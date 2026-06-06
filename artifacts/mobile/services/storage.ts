import { getAuth } from "firebase/auth";
import { app } from "./firebase";

const BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;

/**
 * Uploads a base64-encoded image to Firebase Storage and returns the download URL.
 * @param base64 - base64 string WITHOUT the data:image/... prefix
 * @param mimeType - e.g. "image/jpeg"
 * @param path - e.g. "evidence/reports/filename.jpg"
 */
export async function uploadBase64Image(
  base64: string,
  mimeType: string,
  path: string
): Promise<string> {
  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in to upload evidence.");

  const token = await user.getIdToken();

  const encodedPath = encodeURIComponent(path);
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?name=${encodedPath}`;

  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
      Authorization: `Bearer ${token}`,
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err?.error?.message ?? "Upload failed");
  }

  const data = await uploadRes.json();
  const downloadToken = data.downloadTokens;
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodedPath}?alt=media&token=${downloadToken}`;
  return downloadUrl;
}
