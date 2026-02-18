import React, { useEffect, useState } from "react";
import OnePlatform from "../SignUp/subpages/OnePlatform_copy";
import Welcome from "../SignUp/subpages/Welcome_copy";
import { v4 } from "uuid";
import { storage } from "../../backend/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProductDataService from "./../../backend/services/Product.service";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useNavigate } from "react-router-dom";

const SetupStore = () => {
  const [isSetup, setisSetup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [storename, setstorename] = useState("");
  const [storeCountry, setstoreCountry] = useState("");
  const [storetype, setstoretype] = useState("");
  const [storeLogo, setstoreLogo] = useState(null);
  const [selectedPlan, setselectedPlan] = useState(null);
  const { user, setUser } = useNewAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const uploadImageAndGetURL = async (file) => {
    const imageRef = ref(storage, `image/${file.name}-${v4()}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  //go fix it
  // const handleSubmit = async (plan) => {
  //   console.log("ddddddddddddd", plan.name, storename, storeCountry, storetype);
  //   let imageUrl = "";

  //   const ProductToStorInDB = {
  //     userId: "dfssfsf",
  //     storeName: storename,
  //     storeCountry: storeCountry,
  //     storeCategory: storetype,
  //     selectedPlan: plan.name,
  //     storLogo: imageUrl,
  //   };

  //   if (storeLogo) {
  //     imageUrl = await uploadImageAndGetURL(storeLogo);
  //     console.log("Image URL:", imageUrl);
  //   }

  //   if (imageUrl) {
  //     try {
  //       await ProductDataService.addproduct(ProductToStorInDB);
  //       console.log("kkkkkkkkkkkkkkkkkkkk", "added succcccc");
  //     } catch (error) {
  //       console.log("wwwwwwwwwwww", error);
  //     }
  //   }

  //   console.log("donnnnnnnnnnnnnnnnnnnnnnnnnnn");
  // };

  const handleSubmit = async (plan) => {
    setLoading(true);
    try {
      let imageUrl = "";
      if (storeLogo) {
        imageUrl = await uploadImageAndGetURL(storeLogo);
      }

      // Store store info in Firestore using user ID as document ID
      const storeRef = doc(db, "stores", user.id);
      await setDoc(storeRef, {
        userId: user.id,
        storeName: storename,
        storeCountry: storeCountry,
        storeCategory: storetype,
        selectedPlan: plan.name,
        storeLogo: imageUrl,
        createdAt: new Date().toISOString(),
        planDetails: plan, // Store the complete plan object if needed
      });

      // Update user context with hasStore: true
      const updatedUser = { ...user, hasStore: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/dashboard");
    } catch (error) {
      console.error("Error setting up store:", error);
      toast.error("Failed to setup store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isSetup ? (
        <Welcome
          setselectedPlan={setselectedPlan}
          selectedPlan={selectedPlan}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      ) : (
        <OnePlatform
          storename={storename}
          setstorename={setstorename}
          storeCountry={storeCountry}
          setstoreCountry={setstoreCountry}
          storetype={storetype}
          setstoretype={setstoretype}
          storeLogo={storeLogo}
          setstoreLogo={setstoreLogo}
          setisSetup={setisSetup}
          loading={loading}
        />
      )}
    </>
  );
};

export default SetupStore;
