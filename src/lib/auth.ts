import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { createUserProfile, getUserProfile } from './users';

// Authorized domains for Firebase Authentication
const AUTHORIZED_DOMAINS = [
  'stackblitz.io',
  'stackblitz.com',
  'bolt.new',
  'exp32024.web.app',
  'exp32024.firebaseapp.com',
  'exp3.org',
  'netlify.app',
  'localhost',
  'webcontainer.io',
  'githubifz6r7-ipmo--5173--fc837ba8.local-credentialless.webcontainer.io'
];

export const handleAuthError = (error: any) => {
  console.error('Authentication error:', error);
  
  switch (error.code) {
    case 'auth/popup-blocked':
      return '請允許彈出視窗以完成登入';
    case 'auth/cancelled-popup-request':
      return '登入被取消，請重試';
    case 'auth/unauthorized-domain':
      return '此網域未被授權，請聯繫管理員';
    case 'auth/popup-closed-by-user':
      return '登入視窗被關閉，請重試';
    default:
      return error.message || '登入失敗，請重試';
  }
};

export const signInWithGoogle = async () => {
  try {
    // 先清除任何現有的 auth 狀態
    await signOut(auth);
    
    console.log('Starting Google sign in process...');
    const result = await signInWithPopup(auth, googleProvider);
    
    if (result.user) {
      const { user: userProfile, error: profileError } = await createUserProfile({
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL
      });

      if (profileError) {
        throw new Error(profileError);
      }

      return { user: userProfile, error: null };
    }
    
    throw new Error('No user data received');
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // 如果彈出窗口被阻擋，嘗試使用重定向
    if (error.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: null };
      } catch (redirectError) {
        console.error('Redirect sign in error:', redirectError);
        return { user: null, error: 'Unable to sign in. Please try again.' };
      }
    }
    
    return { 
      user: null, 
      error: error.message || 'Authentication failed'
    };
  }
};

export const handleRedirectResult = async () => {
  try {
    console.log('Handling redirect result...'); // 調試用
    const result = await getRedirectResult(auth);
    
    if (result?.user) {
      console.log('Redirect sign in successful:', result.user.email); // 調試用
      
      const { user: userProfile, error: profileError } = await createUserProfile({
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL
      });

      if (profileError) {
        console.error('Profile creation error after redirect:', profileError); // 調試用
        throw new Error(profileError);
      }

      return { user: userProfile, error: null };
    }
    return { user: null, error: null };
  } catch (error: any) {
    console.error('Redirect result error:', error); // 調試用
    const errorMessage = handleAuthError(error);
    return { user: null, error: errorMessage };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully'); // 調試用
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error); // 調試用
    return { error: '登出失敗，請重試' };
  }
};

export const getCurrentUser = async () => {
  return new Promise((resolve) => {
    console.log('Checking current user...'); // 調試用
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        console.log('Current user found:', user.email); // 調試用
        const { user: userProfile } = await getUserProfile(user.uid);
        resolve(userProfile || {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL
        });
      } else {
        console.log('No user currently signed in'); // 調試用
        resolve(null);
      }
    });
  });
};