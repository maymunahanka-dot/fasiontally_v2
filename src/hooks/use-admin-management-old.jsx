import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../backend/firebase.config";
import { useNewAuth } from "../contexts/NewAuthContext";
import { useSubscription } from "./use-subscription";
import { ADMIN_LIMITS } from "../constants/subscription";

export function useAdminManagement() {
  console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ADMIN HOOK - Hook initialized");

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const { planType } = useSubscription();
  const { user } = useNewAuth();

  console.log("👤👤👤👤👤👤👤👤👤👤 ADMIN HOOK - Current user:", user?.email);
  console.log("📊📊📊📊📊📊📊📊📊📊 ADMIN HOOK - Plan type:", planType);
  console.log(
    "🔧🔧🔧🔧🔧🔧🔧🔧🔧🔧 ADMIN HOOK - Admin limit:",
    ADMIN_LIMITS[planType]
  );

  // Check if user can add more admins based on subscription
  const canAddMoreAdmins = (currentCount) => {
    return currentCount < (ADMIN_LIMITS[planType] || 0);
  };

  const getAdminLimit = () => {
    return ADMIN_LIMITS[planType] || 0;
  };

  const loadAdmins = useCallback(async () => {
    console.log("🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 LOAD ADMINS - Function called");
    console.log("🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 LOAD ADMINS - DB available:", !!db);
    console.log("🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 LOAD ADMINS - User email:", user?.email);

    if (!db || !user?.email) {
      console.log("🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫 LOAD ADMINS - No DB or user email:", {
        db: !!db,
        userEmail: user?.email,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(
        "📋📋📋📋📋📋📋📋📋📋 LOAD ADMINS - Starting query for user:",
        user.email
      );

      const adminRef = collection(db, "fashiontally_admins");
      // Use simple query without compound indexes to avoid Firestore index requirements
      const q = query(adminRef, where("invitedBy", "==", user.email));

      console.log("🔍🔍🔍🔍🔍🔍🔍🔍🔍🔍 LOAD ADMINS - Executing query...");
      const snapshot = await getDocs(q);

      console.log("📊📊📊📊📊📊📊📊📊📊 LOAD ADMINS - Query results:", {
        totalDocs: snapshot.docs.length,
        userEmail: user.email,
      });

      const adminList = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("👤👤👤👤👤👤👤👤👤👤 LOAD ADMINS - Found admin:", {
          id: doc.id,
          name: data.name,
          email: data.email,
          invitedBy: data.invitedBy,
        });
        return {
          id: doc.id, // This will be the email since we use email as document ID
          email: doc.id, // Ensure email is always available
          ...data,
        };
      });

      // Sort by createdAt in JavaScript instead of Firestore to avoid compound index requirements
      adminList.sort((a, b) => {
        // Handle both Firestore Timestamp and ISO string formats
        const getTime = (dateValue) => {
          if (!dateValue) return 0;
          if (typeof dateValue === "string")
            return new Date(dateValue).getTime();
          if (dateValue.toDate) return dateValue.toDate().getTime();
          return new Date(dateValue).getTime();
        };

        const aTime = getTime(a.createdAt);
        const bTime = getTime(b.createdAt);
        return bTime - aTime; // Descending order (newest first)
      });

      setAdmins(adminList);
      console.log(
        "✅✅✅✅✅✅✅✅✅✅ LOAD ADMINS - Successfully loaded",
        adminList.length,
        "admins"
      );
    } catch (error) {
      console.error("❌❌❌❌❌❌❌❌❌❌ LOAD ADMINS - Error:", error);
      // Set empty array on error to prevent infinite loading
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const createAdmin = async (adminData) => {
    if (!db) {
      throw new Error("Database connection error");
    }

    // Check subscription limits
    if (!canAddMoreAdmins(admins.length)) {
      const limit = getAdminLimit();
      throw new Error(
        `You have reached the limit of ${limit} admins for your ${planType} plan. Please upgrade to add more admins.`
      );
    }

    setOperationLoading(true);
    try {
      // Check if admin with this email already exists
      const existingAdmin = admins.find(
        (admin) => admin.email === adminData.email
      );
      if (existingAdmin) {
        throw new Error("An admin with this email already exists");
      }

      // Generate password: first name + "123456"
      const firstName = adminData.name.split(" ")[0].toLowerCase();
      const password = `${firstName}123456`;

      console.log(
        "🔐🔐🔐🔐🔐🔐🔐🔐🔐🔐 CREATE ADMIN - Generated password:",
        password
      );

      // Store current user info before creating admin
      const currentUserEmail = user.email;
      const currentUserData = { ...user }; // Store complete user data

      console.log(
        "👤👤👤👤👤👤👤👤👤👤 CREATE ADMIN - Current user before admin creation:",
        currentUserEmail
      );

      // Create a secondary Firebase app instance to avoid auto-login
      // This is a workaround since we can't use Firebase Admin SDK in client-side
      const { initializeApp, deleteApp } = await import("firebase/app");
      const { getAuth, createUserWithEmailAndPassword: createUserSecondary } =
        await import("firebase/auth");

      // Create a secondary app instance
      const secondaryApp = initializeApp(
        {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        },
        "secondary"
      );

      const secondaryAuth = getAuth(secondaryApp);

      console.log(
        "🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 CREATE ADMIN - Creating user with secondary auth instance"
      );

      // Create user with secondary auth (won't affect main auth state)
      const userCredential = await createUserSecondary(
        secondaryAuth,
        adminData.email,
        password
      );
      const newUser = userCredential.user;

      console.log(
        "👤👤👤👤👤👤👤👤👤👤 CREATE ADMIN - Created auth user:",
        newUser.uid
      );

      // Sign out from secondary auth immediately
      await secondaryAuth.signOut();

      // Delete the secondary app to clean up
      await deleteApp(secondaryApp);

      console.log(
        "✅✅✅✅✅✅✅✅✅✅ CREATE ADMIN - Secondary auth cleaned up, main session preserved"
      );

      // Create admin document using email as document ID (like tally-main)
      const newAdmin = {
        id: adminData.email, // Use email as ID for consistency
        name: adminData.name,
        email: adminData.email,
        phoneNumber: adminData.phoneNumber || "",
        role: adminData.role || "admin",
        permissions: adminData.permissions,
        invitedBy: currentUserEmail, // Use stored email
        createdAt: new Date().toISOString(),
        status: "active",
        uid: newUser.uid,
        password: password, // Store for display purposes
      };

      await setDoc(doc(db, "fashiontally_admins", adminData.email), newAdmin);

      // Update local state
      setAdmins((prev) => [newAdmin, ...prev]);

      console.log(
        "✅✅✅✅✅✅✅✅✅✅ CREATE ADMIN - Successfully created admin without auto-login"
      );

      // Return password for display
      return { success: true, password, admin: newAdmin };
    } catch (error) {
      console.error("❌❌❌❌❌❌❌❌❌❌ CREATE ADMIN - Error:", error);

      // Handle specific Firebase errors first
      if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "An account with this email already exists in Firebase Auth. Please use a different email address."
        );
      }

      // If the secondary app approach fails, fall back to the original method with proper session restoration
      if (
        error.message.includes("secondary") ||
        error.message.includes("import") ||
        error.message.includes("delete")
      ) {
        console.log(
          "🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 CREATE ADMIN - Falling back to original method"
        );

        // Generate password: first name + "123456"
        const firstName = adminData.name.split(" ")[0].toLowerCase();
        const password = `${firstName}123456`;

        // Store current user data
        const currentUserEmail = user.email;

        try {
          // Create user with main auth (will cause auto-login)
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            adminData.email,
            password
          );
          const newUser = userCredential.user;

          // Immediately sign out the new user
          await auth.signOut();

          // Restore the original user session by updating the auth context
          // This is a workaround - the auth context should handle this
          console.log(
            "🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 CREATE ADMIN - Session restoration needed"
          );

          // Create admin document
          const newAdmin = {
            id: adminData.email,
            name: adminData.name,
            email: adminData.email,
            phoneNumber: adminData.phoneNumber || "",
            role: adminData.role || "admin",
            permissions: adminData.permissions,
            invitedBy: currentUserEmail,
            createdAt: new Date().toISOString(),
            status: "active",
            uid: newUser.uid,
            password: password,
          };

          await setDoc(
            doc(db, "fashiontally_admins", adminData.email),
            newAdmin
          );
          setAdmins((prev) => [newAdmin, ...prev]);

          // Alert user about session restoration
          setTimeout(() => {
            alert(
              "Admin created successfully! Please refresh the page to restore your session if needed."
            );
          }, 1000);

          return { success: true, password, admin: newAdmin };
        } catch (fallbackError) {
          console.error(
            "❌❌❌❌❌❌❌❌❌❌ CREATE ADMIN - Fallback error:",
            fallbackError
          );

          if (fallbackError.code === "auth/email-already-in-use") {
            throw new Error(
              "An account with this email already exists in Firebase Auth. Please use a different email address."
            );
          }

          throw fallbackError;
        }
      }

      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const updateAdmin = async (adminEmail, adminData) => {
    if (!db) throw new Error("Database connection error");
    try {
      const adminRef = doc(db, "fashiontally_admins", adminEmail);
      await updateDoc(adminRef, {
        ...adminData,
        updatedAt: new Date().toISOString(),
      });

      setAdmins((prev) =>
        prev.map((a) => (a.email === adminEmail ? { ...a, ...adminData } : a))
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating admin:", error);
      throw error;
    }
  };

  const deleteAdmin = async (adminEmail) => {
    if (!db) throw new Error("Database connection error");

    setOperationLoading(true);
    try {
      console.log(
        "🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️ DELETE ADMIN - Starting deletion for:",
        adminEmail
      );
      console.log(
        "🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️ DELETE ADMIN - Current admins list:",
        admins.map((a) => ({ email: a.email, name: a.name }))
      );

      // Find the admin to get their UID
      const adminToDelete = admins.find((a) => a.email === adminEmail);
      if (!adminToDelete) {
        console.error(
          "❌❌❌❌❌❌❌❌❌❌ DELETE ADMIN - Admin not found in list:",
          adminEmail
        );
        throw new Error("Admin not found");
      }

      console.log("👤👤👤👤👤👤👤👤👤👤 DELETE ADMIN - Found admin:", {
        email: adminToDelete.email,
        uid: adminToDelete.uid,
        name: adminToDelete.name,
        id: adminToDelete.id,
      });

      // Delete from Firestore using email as document ID
      const adminRef = doc(db, "fashiontally_admins", adminEmail);
      console.log(
        "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 DELETE ADMIN - Attempting to delete document with ID:",
        adminEmail
      );

      await deleteDoc(adminRef);
      console.log(
        "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 DELETE ADMIN - Firestore document deleted successfully"
      );

      // Update local state immediately and force re-render
      console.log(
        "📝📝📝📝📝📝📝📝📝📝 DELETE ADMIN - Before state update, admins count:",
        admins.length
      );

      const updatedAdmins = admins.filter((a) => a.email !== adminEmail);
      console.log(
        "📝📝📝📝📝📝📝📝📝📝 DELETE ADMIN - After filter, admins count:",
        updatedAdmins.length
      );
      console.log(
        "📝📝📝📝📝📝📝📝📝📝 DELETE ADMIN - Remaining admins:",
        updatedAdmins.map((a) => a.email)
      );

      setAdmins(updatedAdmins);
      console.log(
        "✅✅✅✅✅✅✅✅✅✅ DELETE ADMIN - Local state update completed"
      );

      // Note: Firebase Auth user deletion requires server-side implementation
      // The user account still exists in Firebase Auth but cannot access admin features
      // since the Firestore document is deleted

      return {
        success: true,
        message:
          "Admin removed from system. Note: The user's Firebase Auth account still exists but they no longer have admin access.",
        deletedAdmin: adminToDelete,
      };
    } catch (error) {
      console.error("❌❌❌❌❌❌❌❌❌❌ DELETE ADMIN - Error:", error);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleAdminStatus = async (adminEmail) => {
    const admin = admins.find((a) => a.email === adminEmail);
    if (!admin || !db) return { success: false };

    try {
      const adminRef = doc(db, "fashiontally_admins", adminEmail);
      const newStatus = admin.status === "active" ? "inactive" : "active";
      await updateDoc(adminRef, { status: newStatus });
      setAdmins((prev) =>
        prev.map((a) =>
          a.email === adminEmail ? { ...a, status: newStatus } : a
        )
      );
      return { success: true };
    } catch (error) {
      console.error("Error toggling admin status:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    console.log(
      "🔄🔄🔄🔄🔄🔄🔄🔄🔄🔄 ADMIN HOOK - useEffect triggered, user email:",
      user?.email
    );
    if (user?.email) {
      console.log("📞📞📞📞📞📞📞📞📞📞 ADMIN HOOK - Calling loadAdmins...");
      loadAdmins();
    } else {
      console.log(
        "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ ADMIN HOOK - No user email, skipping loadAdmins"
      );
      setLoading(false);
    }
  }, [user?.email, loadAdmins]);

  return {
    admins,
    loading,
    operationLoading,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    toggleAdminStatus,
    refreshAdmins: loadAdmins,
    canAddMoreAdmins: () => canAddMoreAdmins(admins.length),
    adminLimit: getAdminLimit(),
  };
}
