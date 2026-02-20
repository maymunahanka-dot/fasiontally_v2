import { createContext, useContext, useState, useEffect } from "react";
import { auth, db, provider } from "../backend/firebase.config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

const NewAuthContext = createContext();

export const useNewAuth = () => {
  const context = useContext(NewAuthContext);
  if (!context) {
    throw new Error("useNewAuth must be used within a NewAuthProvider");
  }
  return context;
};

export const NewAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // Flag to prevent race condition

  useEffect(() => {
    // Check localStorage first for faster initial load
    const storedUser = localStorage.getItem("newAuthUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("newAuthUser");
      }
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      // Skip if signup is in progress to prevent race condition
      if (isSigningUp) {
        console.log("⏸️ Signup in progress, skipping auth state change");
        return;
      }

      if (firebaseUser) {
        // Normalize email to lowercase
        const normalizedEmail = firebaseUser.email?.toLowerCase();

        // First, check if this is an admin user
        console.log(
          "🔍 Auth state changed - checking for admin data for:",
          normalizedEmail
        );
        const adminRef = doc(db, "fashiontally_admins", normalizedEmail);
        const adminDoc = await getDoc(adminRef);

        let userData = null;
        let isAdmin = false;

        if (adminDoc.exists()) {
          // This is an admin user
          console.log(
            "✅ Admin user found in auth state change:",
            adminDoc.data()
          );
          userData = adminDoc.data();
          isAdmin = true;
        } else {
          // Check regular users collection
          console.log(
            "🔍 Checking regular user data in auth state change for:",
            normalizedEmail
          );
          const userRef = doc(db, "fashiontally_users", normalizedEmail);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            userData = userDoc.data();
            console.log("✅ User data found in Firestore:", userData);
          } else {
            console.log(
              "⚠️ No Firestore data found, using Firebase Auth data only"
            );
          }
        }

        // Always set user if Firebase Auth user exists, even without Firestore data
        // This matches tally-main's behavior
        const completeUserData = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          email: userData?.email || normalizedEmail || "",
          originalEmail:
            userData?.originalEmail || userData?.email || normalizedEmail || "",
          phone:
            userData?.phone ||
            userData?.phoneNumber ||
            firebaseUser.phoneNumber ||
            "",
          originalPhone: userData?.originalPhone || userData?.phone || "",
          name: userData?.name || firebaseUser.displayName || "",
          role: userData?.role || "Designer",
          country: userData?.country || "",
          state: userData?.state || "",
          lga: userData?.lga || "",
          address: userData?.address || "",
          businessName: userData?.businessName || "",
          businessAddress: userData?.businessAddress || "",
          isPhoneBasedAccount: userData?.isPhoneBasedAccount || false,
          displayName: firebaseUser.displayName || userData?.name || "",
          photoURL: firebaseUser.photoURL || userData?.photoURL || "",
          provider: userData?.provider || "email",
          createdAt: userData?.createdAt || new Date().toISOString(),
          // Admin-specific fields
          isAdmin: isAdmin,
          permissions: userData?.permissions || null,
          invitedBy: userData?.invitedBy || null,
          status: userData?.status || "active",
          // Subscription/trial fields
          subscriptionType: userData?.subscriptionType || null,
          isTrialActive: userData?.isTrialActive || false,
          planType: userData?.planType || null,
          subscriptionEndDate: userData?.subscriptionEndDate || null,
          isSubscribed: userData?.isSubscribed || false,
          trialStartDate: userData?.trialStartDate || null,
        };

        setUser(completeUserData);
        setIsAuthenticated(true);
        localStorage.setItem("newAuthUser", JSON.stringify(completeUserData));
        console.log("✅ User state set successfully");

        // Auto-redirect to dashboard from auth pages (only if not signing up)
        if (!isSigningUp) {
          const currentPath = window.location.pathname;
          if (currentPath === "/login" || currentPath === "/signup") {
            window.location.href = "/dashboard";
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("newAuthUser");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isSigningUp]); // Add isSigningUp to dependencies

  // Sign up with email and password - matching tally-main_v2 structure
  const signUpWithEmail = async (formData) => {
    try {
      // Set signup flag to prevent race condition
      setIsSigningUp(true);
      console.log("🚀 Starting signup process with flag set...");

      const {
        name,
        email,
        phone,
        password,
        businessName,
        category,
        country,
        logo,
        role = "Designer", // Default role
        state = "",
        lga = "",
        address = "",
        businessAddress = "",
      } = formData;

      // Validation - both email AND phone are required
      if (!name || !email?.trim() || !phone?.trim() || !country || !password) {
        throw new Error(
          "Please fill in all required fields including email and phone number"
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Password validation
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // State and LGA are optional for all countries

      // Business role validation
      if (role === "Business" && (!businessName || !businessAddress)) {
        throw new Error(
          "Business users must provide Business Name and Address"
        );
      }

      // Normalize email to lowercase to match Firebase Auth behavior
      const normalizedEmail = email.trim().toLowerCase();

      // Create user with email and password
      console.log("🚀 Creating Firebase Auth user for:", normalizedEmail);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const firebaseUser = userCredential.user;
      console.log(
        "✅ Firebase Auth user created successfully:",
        firebaseUser.uid
      );

      // Store user data in Firestore FIRST (before updateProfile to prevent race condition)
      console.log("🔄 Preparing to create Firestore document...");

      // Test Firestore connectivity
      try {
        console.log("🧪 Testing Firestore connectivity...");
        const testRef = doc(db, "test", "connectivity");
        await setDoc(testRef, {
          test: true,
          timestamp: new Date().toISOString(),
        });
        console.log("✅ Firestore connectivity test passed");
      } catch (connectivityError) {
        console.error(
          "❌ Firestore connectivity test failed:",
          connectivityError
        );
        throw new Error(
          "Database connection failed. Please check your internet connection and try again."
        );
      }

      const userRef = doc(db, "fashiontally_users", normalizedEmail);
      const userData = {
        role: role,
        name: name,
        phone: phone,
        originalPhone: phone,
        country: country,
        state: country === "Nigeria" ? state : "",
        lga: country === "Nigeria" ? lga : "",
        address: address || "",
        email: normalizedEmail,
        originalEmail: normalizedEmail,
        isPhoneBasedAccount: false, // We now require both email and phone
        createdAt: serverTimestamp(),
        // Store business information from signup
        businessName: businessName || "",
        businessCategory: category || "",
        // Store business logo URL from Cloudinary upload
        logoUrl: formData.logoUrl || formData.logo || "",
        // Add 14-day free trial automatically - matching tally-main
        subscriptionType: "trial",
        isTrialActive: true,
        planType: "Growth", // Give trial users the Growth plan features
        subscriptionEndDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(), // 14 days from now
        isSubscribed: true,
        trialStartDate: new Date().toISOString(),
      };

      // Add business address if role is Business (though this is rarely provided during signup)
      if (role === "Business" && businessAddress) {
        userData.businessAddress = businessAddress;
      }

      console.log("🔥 Creating user document with email as ID:", email);
      console.log("🔥 User data to be saved:", userData);

      try {
        await setDoc(userRef, userData);
        console.log("✅ User document created successfully in Firestore");

        // Verify the document was created
        const verifyDoc = await getDoc(userRef);
        if (verifyDoc.exists()) {
          console.log("✅ Document verification successful:", verifyDoc.data());
        } else {
          console.error("❌ Document verification failed - document not found");
        }
      } catch (firestoreError) {
        console.error(
          "❌ Firestore error during document creation:",
          firestoreError
        );
        console.error("❌ Error code:", firestoreError.code);
        console.error("❌ Error message:", firestoreError.message);
        throw firestoreError;
      }

      // Update the user's display name AFTER Firestore write
      console.log("🔄 Updating user display name to:", name);
      await updateProfile(firebaseUser, {
        displayName: name,
      });
      console.log("✅ User display name updated successfully");

      const completeUserData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid, // Keep for backward compatibility
        name: name,
        email: normalizedEmail,
        originalEmail: normalizedEmail,
        phone: phone,
        originalPhone: phone,
        role: role,
        country: country,
        state: country === "Nigeria" ? state : "",
        lga: country === "Nigeria" ? lga : "",
        address: address || "",
        businessName: businessName || "",
        businessCategory: category || "",
        businessAddress: businessAddress || "",
        // Include logo URL in user context
        logoUrl: formData.logoUrl || formData.logo || "",
        isPhoneBasedAccount: false,
        displayName: name,
        provider: "email",
        createdAt: new Date().toISOString(),
        // Include subscription/trial data
        subscriptionType: "trial",
        isTrialActive: true,
        planType: "Growth",
        subscriptionEndDate: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isSubscribed: true,
        trialStartDate: new Date().toISOString(),
      };

      setUser(completeUserData);
      setIsAuthenticated(true);
      localStorage.setItem("newAuthUser", JSON.stringify(completeUserData));

      // Clear signup flag
      setIsSigningUp(false);
      console.log("✅ Signup flag cleared");

      toast.success(
        `Welcome ${name}! Account created successfully. You have a 14-day free trial to explore all features.`
      );

      // Check if there's a selected plan in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const selectedPlan = urlParams.get("plan");

      // Navigate to subscription page with selected plan or dashboard
      setTimeout(() => {
        if (selectedPlan) {
          window.location.href = `/subscription?plan=${selectedPlan}`;
        } else {
          window.location.href = "/dashboard";
        }
      }, 1000);
      return { success: true };
    } catch (error) {
      // Clear signup flag on error
      setIsSigningUp(false);
      console.log("✅ Signup flag cleared due to error");

      console.error("Email signup error:", error);
      let errorMessage = "Failed to create account";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password, rememberMe = false) => {
    try {
      // Normalize email to lowercase to match Firebase Auth behavior
      const normalizedEmail = email.trim().toLowerCase();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const firebaseUser = userCredential.user;

      // Don't throw error if Firestore data not found - Firebase Auth succeeded
      // The onAuthStateChanged will handle loading user data
      toast.success(`Welcome back!`);

      // Navigate to dashboard after successful login
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
      return { success: true };
    } catch (error) {
      console.error("Email signin error:", error);
      let errorMessage = "Failed to sign in";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Split displayName into name
      const name = firebaseUser.displayName || "";

      // Normalize email to lowercase
      const normalizedEmail = firebaseUser.email?.toLowerCase();

      // Check if user exists in Firestore using fashiontally_users collection
      // Use normalized email as document ID to match tally-main approach
      const userRef = doc(db, "fashiontally_users", normalizedEmail);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user in Firestore with tally-main_v2 structure + 3-day trial
        await setDoc(userRef, {
          role: "Designer", // Default role
          name: name,
          phone: firebaseUser.phoneNumber || "",
          originalPhone: firebaseUser.phoneNumber || "",
          country: "",
          state: "",
          lga: "",
          address: "",
          email: normalizedEmail,
          originalEmail: normalizedEmail,
          isPhoneBasedAccount: false,
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          provider: "google",
          createdAt: serverTimestamp(),
          // Add 14-day free trial automatically for Google sign-ups
          subscriptionType: "trial",
          isTrialActive: true,
          planType: "Growth", // Give trial users the Growth plan features
          subscriptionEndDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(), // 14 days from now
          isSubscribed: true,
          trialStartDate: new Date().toISOString(),
        });
      } else {
        // Update existing user with Google data if missing
        await setDoc(
          userRef,
          {
            displayName: firebaseUser.displayName || userDoc.data().displayName,
            photoURL: firebaseUser.photoURL || userDoc.data().photoURL,
            provider: "google",
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Get the complete user data
      const updatedDoc = await getDoc(userRef);
      const userData = updatedDoc.data();
      const completeUserData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid, // Keep for backward compatibility
        name: userData.name || name,
        email: normalizedEmail,
        originalEmail: userData.originalEmail || normalizedEmail,
        phone: userData.phone || firebaseUser.phoneNumber || "",
        originalPhone: userData.originalPhone || userData.phone || "",
        role: userData.role || "Designer",
        country: userData.country || "",
        state: userData.state || "",
        lga: userData.lga || "",
        address: userData.address || "",
        businessName: userData.businessName || "",
        businessAddress: userData.businessAddress || "",
        isPhoneBasedAccount: userData.isPhoneBasedAccount || false,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || "",
        provider: "google",
        createdAt: userData.createdAt || new Date().toISOString(),
        // Include subscription/trial data
        subscriptionType: userData.subscriptionType || null,
        isTrialActive: userData.isTrialActive || false,
        planType: userData.planType || null,
        subscriptionEndDate: userData.subscriptionEndDate || null,
        isSubscribed: userData.isSubscribed || false,
        trialStartDate: userData.trialStartDate || null,
      };

      setUser(completeUserData);
      setIsAuthenticated(true);
      localStorage.setItem("newAuthUser", JSON.stringify(completeUserData));

      toast.success(
        `Welcome ${name}! ${
          !userDoc.exists()
            ? "You have a 14-day free trial to explore all features."
            : ""
        }`
      );

      // Check if there's a selected plan in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const selectedPlan = urlParams.get("plan");

      // Navigate to subscription page with selected plan or dashboard
      setTimeout(() => {
        if (selectedPlan && !userDoc.exists()) {
          // Only redirect to subscription for new users with selected plan
          window.location.href = `/subscription?plan=${selectedPlan}`;
        } else {
          window.location.href = "/dashboard";
        }
      }, 1000);
      return { success: true };
    } catch (error) {
      console.error("Google signin error:", error);
      toast.error(error.message || "Google sign-in failed");
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("newAuthUser");

      toast.success("Signed out successfully");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }
  };

  // Reset password - enhanced with better error handling
  const resetPassword = async (email) => {
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, normalizedEmail);
      toast.success("Password reset email sent!");
      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send password reset email";

      // Enhanced error handling matching tally-main_v2
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile - for updating user data across the app
  const updateUserProfile = (updatedUserData) => {
    const newUserData = {
      ...user,
      ...updatedUserData,
    };

    setUser(newUserData);
    localStorage.setItem("newAuthUser", JSON.stringify(newUserData));

    console.log("User profile updated in context:", newUserData);
  };

  // Refresh user data from Firestore - useful after profile updates
  const refreshUserData = async () => {
    if (!user?.email) return;

    try {
      console.log("🔄 Refreshing user data from Firestore...");

      // Normalize email to lowercase
      const normalizedEmail = user.email.toLowerCase();

      // Check if this is an admin user first
      const adminRef = doc(db, "fashiontally_admins", normalizedEmail);
      const adminDoc = await getDoc(adminRef);

      let userData = null;
      let isAdmin = false;

      if (adminDoc.exists()) {
        userData = adminDoc.data();
        isAdmin = true;
        console.log("✅ Refreshed admin user data:", userData);
      } else {
        // Check regular users collection
        const userRef = doc(db, "fashiontally_users", normalizedEmail);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          userData = userDoc.data();
          console.log("✅ Refreshed regular user data:", userData);
        }
      }

      if (userData) {
        const refreshedUserData = {
          ...user, // Keep existing data
          ...userData, // Override with fresh Firestore data
          // Ensure critical fields are preserved
          uid: user.uid,
          id: user.uid,
          isAdmin: isAdmin,
          isAuthenticated: true,
        };

        setUser(refreshedUserData);
        localStorage.setItem("newAuthUser", JSON.stringify(refreshedUserData));
        console.log("✅ User data refreshed successfully");
        return refreshedUserData;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  const value = {
    // State
    user,
    setUser,
    loading,
    isAuthenticated,
    // Auth functions
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    // Profile update functions
    updateUserProfile,
    refreshUserData,
  };

  return (
    <NewAuthContext.Provider value={value}>
      <Toaster toastOptions={{ duration: 4000 }} />
      {children}
    </NewAuthContext.Provider>
  );
};

export default NewAuthContext;
