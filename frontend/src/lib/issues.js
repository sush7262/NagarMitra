import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  collectionGroup,
  documentId
} from 'firebase/firestore'
import { db } from './firebase'
import { awardPoints, POINTS } from './points'
import { uploadImage } from './storage'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 }

const RADIUS_METERS = 100

// ── Helpers ───────────────────────────────────────────────────────────────────

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6_371_000
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const dphi = ((lat2 - lat1) * Math.PI) / 180
  const dlambda = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return ''
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function sortBySeverity(issues) {
  return [...issues].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity_label] ?? 99
    const sb = SEVERITY_ORDER[b.severity_label] ?? 99
    if (sa !== sb) return sa - sb
    return (b.severity_score ?? 0) - (a.severity_score ?? 0)
  })
}

export function filterIssues(issues, statusFilter) {
  if (statusFilter === 'All') return issues
  if (statusFilter === 'Open') return issues.filter(i => i.status === 'open')
  if (statusFilter === 'In Progress') return issues.filter(i => i.status === 'in_progress')
  if (statusFilter === 'Resolved') {
    return issues.filter(i => i.status === 'resolved' || i.status === 'verified_resolved')
  }
  return issues
}

export function computeStats(issues) {
  const reported = issues.length
  const inProgress = issues.filter(i => i.status === 'in_progress').length
  const resolved = issues.filter(
    i => i.status === 'resolved' || i.status === 'verified_resolved'
  ).length
  return { reported, inProgress, resolved }
}

function docToIssue(snap) {
  return { id: snap.id, path: snap.ref.path, ...snap.data() }
}

// ── Firestore reads ───────────────────────────────────────────────────────────


export function subscribeToAllIssues(callback, onError) {
  const depts = ["PWD", "Jal Board", "Electricity Board", "Municipal", "Other"];
  const unsubs = [];
  const state = {};
  let initializedCount = 0;
  
  depts.forEach(dept => {
    unsubs.push(onSnapshot(collectionGroup(db, dept), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') {
          delete state[change.doc.id];
        } else {
          state[change.doc.id] = docToIssue(change.doc);
        }
      });
      initializedCount++;
      if (initializedCount >= depts.length) {
        callback(Object.values(state));
      }
    }, onError));
  });
  
  return () => unsubs.forEach(u => u());
}

export function subscribeToUserIssues(uid, callback, onError) {
  const depts = ["PWD", "Jal Board", "Electricity Board", "Municipal", "Other"];
  const unsubs = [];
  const state = {};
  let initializedCount = 0;
  
  depts.forEach(dept => {
    const q = query(collectionGroup(db, dept), where("reporter_uid", "==", uid));
    unsubs.push(onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') delete state[change.doc.id];
        else state[change.doc.id] = docToIssue(change.doc);
      });
      initializedCount++;
      if (initializedCount >= depts.length) callback(Object.values(state));
    }, onError));
  });
  return () => unsubs.forEach(u => u());
}

export function subscribeToIssues(callback, onError) {
  return subscribeToAllIssues((issues) => {
    callback(sortBySeverity(issues))
  }, onError)
}


export async function fetchIssueById(issueId) {
  const depts = ["PWD", "Jal Board", "Electricity Board", "Municipal", "Other"];
  for (const dept of depts) {
    const q = query(collectionGroup(db, dept), where("issue_id", "==", issueId));
    const snap = await getDocs(q);
    if (!snap.empty) return docToIssue(snap.docs[0]);
  }
  return null;
}

export async function getIssueRefById(issueId) {
  const depts = ["PWD", "Jal Board", "Electricity Board", "Municipal", "Other"];
  for (const dept of depts) {
    const q = query(collectionGroup(db, dept), where("issue_id", "==", issueId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].ref;
  }
  throw new Error("Issue not found");
}


// ── Duplicate detection (client fallback) ───────────────────────────────────


async function findDuplicateClient(issueType, lat, lng) {
  const depts = ["PWD", "Jal Board", "Electricity Board", "Municipal", "Other"];
  for (const dept of depts) {
    const q = query(collectionGroup(db, dept), where('issue_type', '==', issueType), where('status', 'in', ['open', 'in_progress']));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const loc = data.location || {};
      if (loc.lat == null || loc.lng == null) continue;
      if (haversineMeters(lat, lng, loc.lat, loc.lng) <= RADIUS_METERS) {
        return { id: docSnap.id, path: docSnap.ref.path, ...data };
      }
    }
  }
  return null;
}


export async function upvoteExistingIssue(issueId, reporterUid) {
  const issueRef = await getIssueRefById(issueId)
  await updateDoc(issueRef, {
    upvote_count: increment(1),
    supporters: arrayUnion(reporterUid),
    updated_at: serverTimestamp(),
  })
  if (reporterUid) {
    await awardPoints(reporterUid, POINTS.UPVOTE)
  }
}

// ── Submit flow (backend with client fallback) ────────────────────────────────

async function checkDuplicateViaBackend(issueType, location, reporterUid) {
  const res = await fetch(`${BACKEND_URL}/api/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      issue_type: issueType,
      location,
      reporter_uid: reporterUid,
    }),
  })
  return { res, data: res.ok ? await res.json() : null }
}

async function checkDuplicateViaClient(issueType, location, reporterUid) {
  const duplicate = await findDuplicateClient(issueType, location.lat, location.lng)
  if (duplicate) {
    await upvoteExistingIssue(duplicate.id, reporterUid)
    return {
      is_duplicate: true,
      existing_issue_id: duplicate.id,
      message:
        `Similar issue already reported nearby (ID: ${duplicate.id}). ` +
        'Your support has been added! 👍',
    }
  }
  return { is_duplicate: false, message: 'No duplicate found. Proceed to submit.' }
}


async function submitViaClient(payload) {
  const colRef = collection(db, 'issues', 'user_issue', payload.department);
  const docRef = doc(colRef);
  const docData = {
    title: payload.title,
    description: payload.description,
    issue_type: payload.issue_type,
    severity_score: payload.severity_score,
    severity_label: payload.severity_label,
    department: payload.department,
    status: 'open',
    reporter_uid: payload.reporter_uid,
    reporter_name: payload.reporter_name,
    location: {
      lat: payload.location.lat,
      lng: payload.location.lng,
      address: payload.location.address,
    },
    photos: payload.photos,
    upvote_count: 1,
    supporters: [payload.reporter_uid],
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    resolved_at: null,
    escalation_count: 0,
    officer_uid: null,
    verification_deadline: null,
    ai_confidence: payload.ai_confidence,
    issue_id: docRef.id
  };
  await setDoc(docRef, docData);
  return { issue_id: docRef.id, message: 'Issue successfully reported!' }
}


/**
 * Full submit: duplicate check → photo upload → save.
 * Uses backend when Firebase Admin is configured; falls back to Firestore client SDK.
 */
export async function submitIssue({ draft, photos, user, uploadImage }) {
  const reporterUid = user?.uid || 'anonymous'

  // 1. Duplicate check
  let checkData
  const { res: checkRes, data: backendCheck } = await checkDuplicateViaBackend(
    draft.issueType,
    draft.location,
    reporterUid
  )

  if (checkRes.status === 503) {
    checkData = await checkDuplicateViaClient(draft.issueType, draft.location, reporterUid)
  } else if (!checkRes.ok) {
    const err = await checkRes.json().catch(() => ({}))
    throw new Error(err.detail || 'Duplicate check failed')
  } else {
    checkData = backendCheck
  }

  if (checkData.is_duplicate) {
    return { duplicate: true, message: checkData.message }
  }

  // 2. Upload photos
  const uploadedUrls = []
  for (const photo of photos) {
    if (!photo.file) continue
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}`
    const path = `issues/${reporterUid}/${filename}`
    const url = await uploadImage(photo.file, path)
    uploadedUrls.push(url)
  }

  // 3. Save issue
  const payload = {
    title: draft.title,
    description: draft.description,
    issue_type: draft.issueType,
    severity_score: draft.severityScore,
    severity_label: draft.severityLabel,
    department: draft.department,
    reporter_uid: reporterUid,
    reporter_name: user?.displayName || 'Citizen',
    location: draft.location,
    photos: { before: uploadedUrls },
    ai_confidence: draft.aiConfidence || 0,
  }

  const submitRes = await fetch(`${BACKEND_URL}/api/submit-issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (submitRes.status === 503) {
    return { duplicate: false, ...(await submitViaClient(payload)) }
  }

  if (!submitRes.ok) {
    const err = await submitRes.json().catch(() => ({}))
    throw new Error(err.detail || 'Submit failed')
  }

  return { duplicate: false, ...(await submitRes.json()) }
}

export async function isBackendFirebaseReady() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`)
    if (!res.ok) return false
    const data = await res.json()
    return data.firebase_admin === true
  } catch {
    return false
  }
}

// ── Issue Interactions (Task 3.2) ──────────────────────────────────────────────

export async function markIssueVerified(issueId, user) {
  const issueRef = await getIssueRefById(issueId)
  const snap = await getDoc(issueRef)

  await updateDoc(issueRef, {
    status: 'verified_resolved',
    updated_at: serverTimestamp()
  })

  if (user?.uid) {
    await awardPoints(user.uid, POINTS.VERIFY_RESOLVED)
  }
  if (snap.exists() && snap.data().reporter_uid) {
    await awardPoints(snap.data().reporter_uid, POINTS.ISSUE_VERIFIED_RESOLVED)
  }
}

export async function submitDispute(issueId, user, description, file) {
  if (!file) throw new Error("Proof photo is required for disputes")
  
  const filename = `${Date.now()}_dispute_${Math.random().toString(36).substring(7)}`
  const path = `issues/${user.uid}/disputes/${filename}`
  const photoUrl = await uploadImage(file, path)

  const issueRef = await getIssueRefById(issueId)
  const issueSnap = await getDoc(issueRef)
  
  if (issueSnap.exists()) {
    const data = issueSnap.data()
    if (data.officer_uid) {
      const officerRef = doc(db, 'officers', data.officer_uid)
      await setDoc(officerRef, {
        fake_closure_count: increment(1)
      }, { merge: true })
    }
  }

  await updateDoc(issueRef, {
    status: 'disputed',
    updated_at: serverTimestamp()
  })

  const commentsRef = collection(issueRef, 'comments')
  await addDoc(commentsRef, {
    text: description,
    photo_url: photoUrl,
    is_dispute: true,
    user_uid: user.uid,
    user_name: user.displayName || 'Citizen',
    created_at: serverTimestamp()
  })

  if (user?.uid) {
    await awardPoints(user.uid, POINTS.DISPUTE, 'disputes_count')
  }
}

export async function resolveIssueByOfficer(issueId, user, userProfile, afterPhotoFile) {
  if (!afterPhotoFile) throw new Error("After-photo is mandatory")
  
  const officerName = userProfile?.name || user?.displayName || 'City Officer'
  const officerDept = userProfile?.department || 'Unknown Department'
  const officerId = userProfile?.officer_id || user?.uid || 'Unknown ID'
  
  const filename = `${Date.now()}_after_${Math.random().toString(36).substring(7)}`
  const path = `issues/${user.uid}/resolutions/${filename}`
  const photoUrl = await uploadImage(afterPhotoFile, path)

  const issueRef = await getIssueRefById(issueId)
  const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000) // +48 hours

  await updateDoc(issueRef, {
    status: 'resolved',
    'photos.after': [photoUrl],
    resolved_at: serverTimestamp(),
    officer_uid: officerId,
    resolved_by_name: officerName,
    resolved_by_dept: officerDept,
    verification_deadline: deadline,
    updated_at: serverTimestamp()
  })

  // Track officer total resolutions (Task 4.4)
  const officerRef = doc(db, 'officers', officerId)
  await setDoc(officerRef, {
    name: officerName,
    department: officerDept,
    total_resolutions: increment(1)
  }, { merge: true })

  const commentsRef = collection(issueRef, 'comments')
  await addDoc(commentsRef, {
    text: `✅ Official Resolution: The assigned officer (${officerName} - ${officerDept}) has marked this issue as resolved. Please review the attached proof photo.`,
    photo_url: photoUrl,
    is_official_resolution: true,
    user_uid: officerId,
    user_name: officerName,
    created_at: serverTimestamp()
  })
}

export async function addComment(issueId, user, text) {
  const issueRef = await getIssueRefById(issueId);
  const commentsRef = collection(issueRef, 'comments')
  await addDoc(commentsRef, {
    text,
    user_uid: user.uid,
    user_name: user.displayName || 'Citizen',
    created_at: serverTimestamp()
  })
}


export function subscribeToComments(issueId, callback) {
  let unsub = () => {};
  let isCancelled = false;
  getIssueRefById(issueId).then(issueRef => {
    if (isCancelled) return;
    const commentsRef = collection(issueRef, 'comments');
    unsub = onSnapshot(commentsRef, (snapshot) => {
      const comments = snapshot.docs.map(snap => ({ id: snap.id, ...snap.data() }));
      comments.sort((a, b) => (a.created_at?.toMillis() || 0) - (b.created_at?.toMillis() || 0));
      callback(comments);
    });
  }).catch(e => console.error(e));
  return () => {
    isCancelled = true;
    unsub();
  };
}


export async function triggerAIVerification(issueId) {
  const res = await fetch('http://127.0.0.1:8000/api/verify-resolution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issue_id: issueId })
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.detail || 'Failed to trigger AI Verification')
  }
  return await res.json()
}
