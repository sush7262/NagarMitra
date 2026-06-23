import { doc, setDoc, increment } from 'firebase/firestore'
import { db } from './firebase'

export const POINTS = {
  REPORT_ISSUE: 10,
  ISSUE_VERIFIED_RESOLVED: 20, // Awarded to the original reporter
  UPVOTE: 2,
  DISPUTE: 30, // Awarded when disputing a fake closure
  VERIFY_RESOLVED: 5 // Awarded to the citizen who verified
}

export async function awardPoints(uid, points, statToIncrement = null) {
  if (!uid) return
  try {
    const updates = {
      citizenScore: increment(points)
    }
    if (statToIncrement) {
      // e.g. 'reports_count', 'disputes_count'
      updates[statToIncrement] = increment(1)
    }
    
    const userRef = doc(db, 'users', uid)
    await setDoc(userRef, updates, { merge: true })
  } catch (err) {
    console.error("Failed to award points:", err)
  }
}
