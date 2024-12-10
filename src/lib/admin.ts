import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Event } from './events';

const initialEvents: Omit<Event, 'id'>[] = [
  {
    title: "AI-Powered UX Design Workshop",
    date: "2024-03-15",
    time: "10:00 AM - 4:00 PM EST",
    format: "Virtual",
    description: "在人工智慧技術快速演進的今日，使用者體驗(UX)設計正經歷前所未有的轉變。",
    imageUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    attendeeLimit: 50,
    tags: ["AI", "UX", "Design"],
    skills: ["AI Integration", "UX Research", "Interface Design"],
    requirements: [
      "Basic understanding of UX design principles",
      "Familiarity with design tools (Figma, Sketch)",
      "No coding experience required"
    ],
    instructor: {
      id: "instructor1",
      name: "温明輝",
      role: "UX Research & Design Expert",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      bio: "40% 網路創業者 + 40 % 設計學院教授 + 20% UX 修行者與傳教士",
      expertise: ["UX Research", "Design Systems", "AI Integration"]
    },
    registeredUsers: [],
    status: "published",
    xp: 500
  }
];

export const setupInitialEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    
    for (const eventData of initialEvents) {
      await addDoc(eventsRef, {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error setting up initial events:', error);
    return { error: 'Failed to setup initial events' };
  }
};