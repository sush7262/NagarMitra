import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Helper to upload a base64 or File object to Firebase Storage
 * and return the public download URL.
 */
export async function uploadImage(fileOrBlob, path) {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, fileOrBlob)
  const downloadUrl = await getDownloadURL(storageRef)
  return downloadUrl
}
