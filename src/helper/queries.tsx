import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const getAllData = async (tableName: string): Promise<any[]> => {
  try {
    const q = query(collection(db, tableName));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return data;
  } catch (error) {
    console.error("Error getting data from Firebase:", error);
    throw error;
  }
};
