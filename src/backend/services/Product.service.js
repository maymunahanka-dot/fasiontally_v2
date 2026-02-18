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

const productCollectionRef = collection(db, "store_info");
class ProductDataService {
  addproduct = (newUser) => {
    return addDoc(productCollectionRef, newUser);
  };

  updateproduct = (id, Updatedproduct) => {
    const ProductDoc = doc(db, "users", id);
    return updateDoc(ProductDoc, Updatedproduct);
  };

  deleteproduct = (id) => {
    const ProductDoc = doc(db, "users", id);
    return deleteDoc(ProductDoc);
  };

  getAllproduct = () => {
    return getDocs(productCollectionRef);
  };

  getproduct = (id) => {
    const ProductDoc = doc(db, "users", id);
    return getDoc(ProductDoc);
  };
}

export default new ProductDataService();
