/**
 * Firestore Blog Utilities
 * All blog data is stored under:  users/{uid}/blogs/{blogId}
 * This keeps every user's blogs completely private.
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

/** Return a reference to the user's blogs sub-collection */
function blogsRef(uid) {
  return collection(db, 'users', uid, 'blogs');
}

/** Fetch all blogs for the current user, ordered newest-first */
export async function fetchUserBlogs(uid) {
  const q = query(blogsRef(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    // Convert Firestore Timestamps to ISO strings for React serialization
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt;
    const scheduledAt = data.scheduledAt?.toDate ? data.scheduledAt.toDate().toISOString() : data.scheduledAt;
    
    return { 
      ...data,
      id: d.id, 
      createdAt,
      updatedAt,
      scheduledAt
    };
  });
}

/** Create a new blog document */
export async function createBlog(uid, blogData) {
  const ref = await addDoc(blogsRef(uid), {
    ...blogData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: blogData.status || 'draft',
  });
  return ref.id;
}

/** Update an existing blog document */
export async function updateBlog(uid, blogId, updates) {
  const ref = doc(db, 'users', uid, 'blogs', blogId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

/** Delete a blog document */
export async function deleteBlog(uid, blogId) {
  const ref = doc(db, 'users', uid, 'blogs', blogId);
  await deleteDoc(ref);
}

/** Get a single blog */
export async function getBlog(uid, blogId) {
  const ref = doc(db, 'users', uid, 'blogs', blogId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Save credentials per user in Firestore (not localStorage) */
export async function saveCredentials(uid, credentials) {
  const ref = doc(db, 'users', uid, 'settings', 'credentials');
  await setDoc(ref, { platforms: credentials, updatedAt: serverTimestamp() }, { merge: true });
}

/** Fetch credentials for a user */
export async function fetchCredentials(uid) {
  const ref = doc(db, 'users', uid, 'settings', 'credentials');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().platforms || {}) : {};
}
