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
    // Option 3: Sử dụng default credentials (nếu chạy trên GCP hoặc có GOOGLE_APPLICATION_CREDENTIALS)
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
    const { targetUserId, deleterUserId } = await request.json()

    if (!targetUserId || !deleterUserId) {
      return NextResponse.json(
        { error: 'Missing targetUserId or deleterUserId' },
        { status: 400 }
      )
    }

    // Kiểm tra quyền root của deleter
    const deleterDoc = await admin.firestore().collection('users').doc(deleterUserId).get()
    if (!deleterDoc.exists) {
      return NextResponse.json(
        { error: 'Deleter user not found' },
        { status: 404 }
      )
    }

    const deleterData = deleterDoc.data()
    if (!deleterData?.isRoot) {
      return NextResponse.json(
        { error: 'Only root users can delete other users' },
        { status: 403 }
      )
    }

    // Không cho phép xóa chính mình
    if (targetUserId === deleterUserId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Kiểm tra target user có tồn tại không
    const targetDoc = await admin.firestore().collection('users').doc(targetUserId).get()
    if (!targetDoc.exists) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    const targetData = targetDoc.data()
    // Không cho phép xóa root user khác
    if (targetData?.isRoot) {
      return NextResponse.json(
        { error: 'Cannot delete other root users' },
        { status: 400 }
      )
    }

    // Xóa user khỏi Firebase Authentication
    try {
      await admin.auth().deleteUser(targetUserId)
    } catch (authError: any) {
      // Nếu user không tồn tại trong Auth (có thể đã bị xóa trước đó), không báo lỗi
      if (authError.code !== 'auth/user-not-found') {
        console.error('Error deleting user from Auth:', authError)
        // Vẫn tiếp tục vì có thể user đã bị xóa khỏi Auth nhưng còn trong Firestore
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'User deleted from Firebase Authentication' 
    })
  } catch (error: any) {
    console.error('Error in delete-user API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
