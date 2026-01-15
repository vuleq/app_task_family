/**
 * Script để xóa user khỏi Firebase Authentication bằng email hoặc UID
 * 
 * Cách sử dụng:
 * 1. Cài đặt firebase-admin: npm install firebase-admin
 * 2. Cấu hình Firebase Admin SDK (xem README)
 * 3. Chạy: npx ts-node scripts/delete-auth-user.ts <email hoặc uid>
 * 
 * Ví dụ:
 * npx ts-node scripts/delete-auth-user.ts sol@mail.com
 * npx ts-node scripts/delete-auth-user.ts abc123xyz
 */

import admin from 'firebase-admin'
import * as readline from 'readline'

// Initialize Firebase Admin SDK
function initializeAdmin() {
  if (!admin.apps.length) {
    try {
      // Option 1: Sử dụng service account từ environment variable (JSON string)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
        console.log('✅ Initialized Firebase Admin with FIREBASE_SERVICE_ACCOUNT')
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
        console.log('✅ Initialized Firebase Admin with individual env variables')
      }
      // Option 3: Sử dụng service account file
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        })
        console.log('✅ Initialized Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS')
      }
      // Option 4: Thử load từ file serviceAccountKey.json trong thư mục scripts
      else {
        try {
          const serviceAccount = require('./serviceAccountKey.json')
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          })
          console.log('✅ Initialized Firebase Admin with serviceAccountKey.json')
        } catch (error) {
          console.error('❌ Error: Could not initialize Firebase Admin SDK')
          console.error('Please configure one of the following:')
          console.error('1. FIREBASE_SERVICE_ACCOUNT environment variable (JSON string)')
          console.error('2. FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL')
          console.error('3. GOOGLE_APPLICATION_CREDENTIALS pointing to service account file')
          console.error('4. serviceAccountKey.json file in scripts folder')
          process.exit(1)
        }
      }
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin:', error)
      process.exit(1)
    }
  }
}

async function deleteUserByEmailOrUid(emailOrUid: string) {
  initializeAdmin()

  let userToDelete: admin.auth.UserRecord | null = null

  // Kiểm tra xem là email hay UID
  const isEmail = emailOrUid.includes('@')

  try {
    if (isEmail) {
      console.log(`🔍 Looking for user with email: ${emailOrUid}`)
      userToDelete = await admin.auth().getUserByEmail(emailOrUid)
    } else {
      console.log(`🔍 Looking for user with UID: ${emailOrUid}`)
      userToDelete = await admin.auth().getUser(emailOrUid)
    }

    console.log(`✅ Found user:`)
    console.log(`   UID: ${userToDelete.uid}`)
    console.log(`   Email: ${userToDelete.email || 'N/A'}`)
    console.log(`   Display Name: ${userToDelete.displayName || 'N/A'}`)
    console.log(`   Created: ${userToDelete.metadata.creationTime}`)

    // Xác nhận trước khi xóa
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question(`\n⚠️  Are you sure you want to delete this user? (yes/no): `, resolve)
    })

    rl.close()

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled. User not deleted.')
      process.exit(0)
    }

    // Xóa user
    console.log('\n🗑️  Deleting user...')
    await admin.auth().deleteUser(userToDelete.uid)

    console.log(`✅ Successfully deleted user "${userToDelete.email || userToDelete.uid}" from Firebase Authentication!`)
    console.log(`   User can now register again with email: ${userToDelete.email || 'N/A'}`)
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: User not found in Firebase Authentication`)
      if (isEmail) {
        console.error(`   Email: ${emailOrUid}`)
      } else {
        console.error(`   UID: ${emailOrUid}`)
      }
    } else {
      console.error(`❌ Error deleting user:`, error.message)
    }
    process.exit(1)
  }
}

// Main
const emailOrUid = process.argv[2]

if (!emailOrUid) {
  console.error('❌ Error: Please provide email or UID')
  console.error('Usage: npx ts-node scripts/delete-auth-user.ts <email hoặc uid>')
  console.error('Example: npx ts-node scripts/delete-auth-user.ts sol@mail.com')
  process.exit(1)
}

deleteUserByEmailOrUid(emailOrUid)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
