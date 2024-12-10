import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sheetsService } from './sheets';
import { Event } from './events';
import { UserProfile } from './users';

interface RegistrationResult {
  success: boolean;
  error?: string;
}

export const registerUserForEvent = async (
  event: Event,
  user: UserProfile
): Promise<RegistrationResult> => {
  try {
    // Add registration to Firestore
    const registrationRef = await addDoc(collection(db, 'registrations'), {
      userId: user.id,
      eventId: event.id,
      timestamp: serverTimestamp(),
      status: 'confirmed'
    });

    // Sync to Google Sheets
    const now = new Date().toISOString();
    await sheetsService.appendRegistration({
      timestamp: now,
      userId: user.id,
      userName: user.name || 'Anonymous',
      userEmail: user.email || 'No email',
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Failed to complete registration'
    };
  }
};