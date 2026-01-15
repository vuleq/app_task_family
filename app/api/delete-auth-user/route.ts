import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Option 1: Sử dụng service account từ environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } 
    // Option 2: Sử dụng các biến môi trường riêng lẻ
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      })
    }
    // Option 3: Sử dụng default credentials
    else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, uid, deleterUserId } = await request.json()

    // Kiểm tra quyền root của deleter (nếu có)
    if (deleterUserId) {
      try {
        const deleterDoc = await admin.firestore().collection('users').doc(deleterUserId).get()
        if (deleterDoc.exists) {
          const deleterData = deleterDoc.data()
          if (!deleterData?.isRoot) {
            return NextResponse.json(
              { error: 'Only root users can delete other users' },
              { status: 403 }
            )
          }
        }
      } catch (error) {
        // Nếu không kiểm tra được, vẫn tiếp tục (có thể user đã bị xóa)
        console.warn('Could not verify root permission:', error)
      }
    }

    let userToDelete: admin.auth.UserRecord | null = null

    // Tìm user bằng email hoặc UID
    if (email) {
      try {
        userToDelete = await admin.auth().getUserByEmail(email)
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          return NextResponse.json(
            { error: `User with email "${email}" not found in Firebase Authentication` },
            { status: 404 }
          )
        }
        throw error
      }
    } else if (uid) {
      try {
        userToDelete = await admin.auth().getUser(uid)
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          return NextResponse.json(
            { error: `User with UID "${uid}" not found in Firebase Authentication` },
            { status: 404 }
          )
        }
        throw error
      }
    } else {
      return NextResponse.json(
        { error: 'Missing email or uid parameter' },
        { status: 400 }
      )
    }

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Không cho phép xóa chính mình (nếu có deleterUserId)
    if (deleterUserId && userToDelete.uid === deleterUserId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Kiểm tra xem user có phải root không (nếu có trong Firestore)
    try {
      const userDoc = await admin.firestore().collection('users').doc(userToDelete.uid).get()
      if (userDoc.exists) {
        const userData = userDoc.data()
        if (userData?.isRoot) {
          return NextResponse.json(
            { error: 'Cannot delete root users' },
            { status: 400 }
          )
        }
      }
    } catch (error) {
      // Nếu không kiểm tra được, vẫn tiếp tục
      console.warn('Could not check root status:', error)
    }

    // Xóa user khỏi Firebase Authentication
    await admin.auth().deleteUser(userToDelete.uid)

    return NextResponse.json({ 
      success: true,
      message: `User "${userToDelete.email || userToDelete.uid}" has been deleted from Firebase Authentication`,
      deletedUser: {
        uid: userToDelete.uid,
        email: userToDelete.email,
      }
    })
  } catch (error: any) {
    console.error('Error in delete-auth-user API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
