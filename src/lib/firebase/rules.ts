export const firebaseRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read events
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // Allow registration updates
      match /registrations/{registrationId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`;