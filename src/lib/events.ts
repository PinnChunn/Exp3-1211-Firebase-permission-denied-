import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { EVENTS_DATA } from './constants';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  format: string;
  description: string;
  imageUrl: string;
  xp: number;
  attendeeLimit: number;
  tags: string[];
  skills: string[];
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  registeredUsers: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  externalLink?: string;
  duration?: string;
  participants: number;
}

export const initializeEvents = async () => {
  try {
    console.log('Starting event initialization...');
    
    for (const event of EVENTS_DATA) {
      const eventRef = doc(db, 'events', event.id);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        console.log(`Initializing event: ${event.id}`);
        await setDoc(eventRef, {
          ...event,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
    
    console.log('Event initialization completed');
    return { error: null };
  } catch (error) {
    console.error('Error initializing events:', error);
    return { error: 'Failed to initialize events', fallbackData: EVENTS_DATA };
  }
};

export const getEvents = async (): Promise<Event[]> => {
  try {
    const eventsCollection = collection(db, 'events');
    const snapshot = await getDocs(eventsCollection);
    
    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    }
    
    return EVENTS_DATA;
  } catch (error) {
    console.error('Error fetching events:', error);
    return EVENTS_DATA;
  }
};

export const getEvent = async (id: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, 'events', id);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      return {
        id: eventDoc.id,
        ...eventDoc.data()
      } as Event;
    }
    
    return EVENTS_DATA.find(event => event.id === id) || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return EVENTS_DATA.find(event => event.id === id) || null;
  }
};

export const isUserRegistered = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return false;
    }

    const event = eventDoc.data() as Event;
    return event.registeredUsers?.includes(userId) || false;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
};

export const registerForEvent = async (eventId: string, userId: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return { error: 'Event not found' };
    }

    const event = eventDoc.data() as Event;
    
    if (event.registeredUsers?.includes(userId)) {
      return { error: 'Already registered for this event' };
    }

    if (event.registeredUsers?.length >= event.attendeeLimit) {
      return { error: 'Event is full' };
    }

    const updatedRegisteredUsers = [...(event.registeredUsers || []), userId];
    
    await updateDoc(eventRef, {
      registeredUsers: updatedRegisteredUsers,
      participants: (event.participants || 0) + 1,
      updatedAt: serverTimestamp()
    });

    return { error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to register for event' };
  }
};