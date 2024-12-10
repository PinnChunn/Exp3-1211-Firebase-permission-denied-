import { collection, getDocs, doc, getDoc, updateDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Event } from './types';
import { EVENTS_DATA } from '../constants';
import { logUserActivity } from '../firebase';
import { eventCache } from './cache';

export const initializeEvents = async () => {
  try {
    // Always start with static data in cache
    eventCache.set(EVENTS_DATA);
    
    console.log('Starting event initialization...');
    const batch = writeBatch(db);
    
    for (const event of EVENTS_DATA) {
      const eventRef = doc(db, 'events', event.id);
      batch.set(eventRef, {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    await batch.commit();
    console.log('Event initialization completed successfully');
    return { error: null };
  } catch (error) {
    console.warn('Firebase initialization failed, using static data:', error);
    return { error: 'Firebase write failed', fallbackData: EVENTS_DATA };
  }
};

export const getEvents = async (): Promise<Event[]> => {
  // Always check cache first
  const cachedEvents = eventCache.get();
  if (cachedEvents) {
    return cachedEvents;
  }

  try {
    const eventsCollection = collection(db, 'events');
    const snapshot = await getDocs(eventsCollection);
    
    if (!snapshot.empty) {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
      
      eventCache.set(events);
      return events;
    }
  } catch (error) {
    console.warn('Error fetching events from Firebase:', error);
  }
  
  // Fallback to static data
  console.log('Using static event data');
  eventCache.set(EVENTS_DATA);
  return EVENTS_DATA;
};

export const getEvent = async (id: string): Promise<Event | null> => {
  // Check cache first
  const cachedEvents = eventCache.get();
  if (cachedEvents) {
    const cachedEvent = cachedEvents.find(event => event.id === id);
    if (cachedEvent) return cachedEvent;
  }

  try {
    const eventRef = doc(db, 'events', id);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      const event = {
        id: eventDoc.id,
        ...eventDoc.data()
      } as Event;
      return event;
    }
  } catch (error) {
    console.warn('Error fetching event from Firebase:', error);
  }
  
  // Fallback to static data
  return EVENTS_DATA.find(event => event.id === id) || null;
};

export const isUserRegistered = async (eventId: string, userId: string): Promise<boolean> => {
  // Check cache first
  const cachedEvents = eventCache.get();
  if (cachedEvents) {
    const event = cachedEvents.find(e => e.id === eventId);
    if (event) {
      return event.registeredUsers?.includes(userId) || false;
    }
  }

  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return false;
    }

    const event = eventDoc.data() as Event;
    return event.registeredUsers?.includes(userId) || false;
  } catch (error) {
    console.warn('Error checking registration status:', error);
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

    // Update cache
    const cachedEvents = eventCache.get();
    if (cachedEvents) {
      const updatedEvents = cachedEvents.map(e => 
        e.id === eventId 
          ? { ...e, registeredUsers: updatedRegisteredUsers, participants: (e.participants || 0) + 1 }
          : e
      );
      eventCache.set(updatedEvents);
    }

    logUserActivity.userInteraction('event_registration', { eventId }, userId);
    return { error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Failed to register for event' };
  }
};