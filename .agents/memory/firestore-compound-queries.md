---
name: Firestore Compound Query Indexes
description: Firestore requires composite indexes for compound queries; workaround is single-field where clauses with JS filtering/sorting
---

## Rule
Never combine `where("fieldA", ...)` + `orderBy("fieldB")` on different fields in a Firestore query without first creating the composite index in Firebase Console. The query will silently fail with a permission/index error.

**Why:** Firestore enforces index requirements at query time. Without a composite index, the SDK returns a FirebaseError with a link to create the index. If that error is caught and swallowed (e.g. in a snapshot listener's error handler), the loading state never resolves and the UI shows an infinite spinner.

## How to apply
For this project (`overcharging_reports` collection):
- Use a **single `where` clause** per query (e.g. `where("user_id", "==", uid)` or `where("is_archived", "==", false)`)
- Do **not** chain `orderBy` to a `where` on a different field
- Sort results in JavaScript: `[...docs].sort((a, b) => b.createdAt - a.createdAt)`
- Filter other conditions (e.g. `is_archived`) in JS after fetching

## Error pattern
Snapshot listeners must always pass an `onError` callback that resolves the loading state:
```js
onSnapshot(q, (snap) => { ...; setLoading(false); }, (err) => { setLoading(false); })
```
Without `onError`, a failed query leaves `loading = true` forever.
