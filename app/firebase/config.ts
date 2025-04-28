import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    initializeAuth,
    getReactNativePersistence,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
    UserCredential
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const register = (email: string, password: string): Promise<UserCredential> =>
    createUserWithEmailAndPassword(auth, email, password);

const login = (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password);

const logout = (): Promise<void> => signOut(auth);

const updateUserProfile = (user: User, profileUpdates: { displayName?: string | null; photoURL?: string | null; }): Promise<void> =>
    updateProfile(user, profileUpdates);

const CACHE_TIMEOUTS = {
    user: 10 * 60 * 1000,  // 10 minutes
    expenses: 5 * 60 * 1000 // 5 minutes
};

export default {
    app,
    auth,
    register,
    login,
    logout,
    db,
    updateProfile: updateUserProfile,
    CACHE_TIMEOUTS
};