import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyD8RIvCfflwPtkGd2-rUVPNLG2HnEl9ScM",
  authDomain: "circledop.firebaseapp.com",
  projectId: "circledop",
  storageBucket: "circledop.appspot.com",
  messagingSenderId: "625264165607",
  appId: "1:625264165607:web:754163aa75d73f6d8e5842",
  measurementId: "G-ZNYEE4DLWE",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
