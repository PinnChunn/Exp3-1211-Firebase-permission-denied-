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

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  tags: string[];
  skills: string[];
  description: string;
  imageUrl: string;
  onRegister: () => void;
  externalLink?: string;
  isAuthenticated: boolean;
  userId?: string;
  xp?: number;
  duration?: string;
  participants?: number;
}