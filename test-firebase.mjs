import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const cleanEnv = (value) => {
  if (!value) return undefined;
  let cleaned = value.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.length > 0 ? cleaned : undefined;
};

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

console.log('Firebase Config Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    const email = `test_${Date.now()}@example.com`;
    console.log('Creating auth user:', email);
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, email, 'password123');
    } catch (authErr) {
      console.error('Auth Error (Email/Password might be disabled):', authErr.message);
      process.exit(1);
    }
    
    const uid = cred.user.uid;
    console.log('Auth success. UID =', uid);

    console.log('--- Testing users collection ---');
    const profileRef = doc(db, 'users', uid);
    try {
      await getDoc(profileRef);
      console.log('✅ users getDoc: SUCCESS');
    } catch (e) {
      console.error('❌ users getDoc: FAILED', e.message);
    }

    console.log('--- Testing families collection (create) ---');
    const familiesRef = collection(db, 'families');
    try {
      await addDoc(familiesRef, { name: 'Test Family', createdBy: uid });
      console.log('✅ families addDoc: SUCCESS');
    } catch (e) {
      console.error('❌ families addDoc: FAILED', e.message);
    }

    console.log('--- Testing families collection (query) ---');
    try {
      const q = query(familiesRef, where('familyCode', '==', 'ABCDEF'));
      await getDocs(q);
      console.log('✅ families query: SUCCESS');
    } catch (e) {
      console.error('❌ families query: FAILED', e.message);
    }

    console.log('--- Testing loginHistory collection (create) ---');
    const loginRef = collection(db, 'loginHistory');
    try {
      await addDoc(loginRef, { userId: uid, date: '2026-03-21' });
      console.log('✅ loginHistory addDoc: SUCCESS');
    } catch (e) {
      console.error('❌ loginHistory addDoc: FAILED', e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Unhandled ERROR:', err);
    process.exit(1);
  }
}

test();
