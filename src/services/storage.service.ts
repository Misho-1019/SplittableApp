import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

export async function uploadReceipt(
  groupId: string,
  expenseId: string,
  uri: string,
): Promise<{ downloadURL: string }> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const path = `receipts/${groupId}/${expenseId}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, {
    contentType: 'image/jpeg',
  });

  const downloadURL = await getDownloadURL(storageRef);
  return { downloadURL };
}
