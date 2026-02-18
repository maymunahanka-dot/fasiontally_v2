import { db } from "../firebase.config";

import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const useCollectionRef = collection(db, "users");
class UserDataService {
  addUser = (newUser) => {
    return addDoc(useCollectionRef, newUser);
  };

  updateUse = (id, UpdatedUser) => {
    const UserDoc = doc(db, "users", id);
    return updateDoc(UserDoc, this.updateUse);
  };

  deleteUser = (id) => {
    const UserDoc = doc(db, "users", id);
    return deleteDoc(UserDoc);
  };

  getAllUser = () => {
    return getDocs(useCollectionRef);
  };

  getUser = (id) => {
    const userDoc = doc(db, "users", id);
    return getDoc(userDoc);
  };
}

export default new UserDataService();
