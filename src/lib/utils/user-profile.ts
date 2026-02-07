import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Collections, UserProfile } from "@/lib/types/firestore";

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    if (!userId) return null;

    const userRef = doc(db, Collections.USERS, userId);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...(snap.data() as Omit<UserProfile, "id">),
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Create or update full user profile (safe for first login)
 */
export async function saveUserProfile(
  profile: Partial<UserProfile> & { id: string }
): Promise<boolean> {
  try {
    if (!profile.id) {
      console.error("User ID is required");
      return false;
    }

    const userRef = doc(db, Collections.USERS, profile.id);

    await setDoc(
      userRef,
      {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
}

/**
 * Update specific editable fields of user profile
 * (USED BY EDIT PROFILE PAGE)
 */
export async function updateUserProfileFields(
  userId: string,
  fields: Partial<
    Omit<UserProfile, "id" | "email" | "createdAt" | "updatedAt">
  >
): Promise<boolean> {
  try {
    console.log("updateUserProfileFields called with:", { userId, fields }); // Debug log

    if (!userId) {
      console.error("User ID missing");
      return false;
    }

    const userRef = doc(db, Collections.USERS, userId);
    console.log("User document reference:", userRef.path); // Debug log

    // Remove empty / undefined fields
    const updateData: Record<string, string | number | boolean | object> = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        updateData[key] = value;
      }
    });

    console.log("Update data to be saved:", updateData); // Debug log

    if (Object.keys(updateData).length === 0) {
      console.warn("No valid fields to update");
      return true;
    }

    updateData.updatedAt = serverTimestamp();

    // 🔑 SAFE UPDATE (creates doc if missing)
    console.log("About to update document..."); // Debug log
    await setDoc(userRef, updateData, { merge: true });
    console.log("Document updated successfully!"); // Debug log

    return true;
  } catch (error) {
    console.error("Error updating user profile fields:", error);
    return false;
  }
}
