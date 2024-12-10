import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import AuthModal from './components/AuthModal';
import SkillPaths from './components/SkillPaths';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import { getCurrentUser } from './lib/auth';
import { initializeEvents, getEvents, registerForEvent, Event } from './lib/events';
import { EVENTS_DATA } from './lib/constants';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>(EVENTS_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        setLoading(true);
        console.log('Starting app initialization...');
        
        // Get current user first
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }

        // Initialize events in the background
        await initializeEvents();
        
        // Get latest events
        const eventsList = await getEvents();
        setEvents(eventsList);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleEventRegistration = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.externalLink) {
      window.open(event.externalLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!isAuthenticated) {
      setPendingEventId(eventId);
      setPendingAction('register');
      setIsAuthModalOpen(true);
      return;
    }

    if (user) {
      const { error } = await registerForEvent(eventId, user.id);
      if (!error) {
        const updatedEvents = await getEvents();
        setEvents(updatedEvents);
      }
    }
  };

  const handleAuthSuccess = async (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    
    if (pendingEventId && pendingAction === 'register') {
      await handleEventRegistration(pendingEventId);
      setPendingEventId(null);
      setPendingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              EXP3
            </Link>
            <UserProfile 
              isAuthenticated={isAuthenticated}
              user={user}
              onLogin={() => setIsAuthModalOpen(true)}
              onLogout={() => {
                setIsAuthenticated(false);
                setUser(null);
              }}
            />
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <main className="pt-16">
            <Hero />
            <Benefits />
            <section id="events" className="py-20">
              <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Featured Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      {...event}
                      userId={user?.id}
                      onRegister={() => handleEventRegistration(event.id)}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </div>
            </section>
            <SkillPaths />
          </main>
        } />
        
        <Route path="/events/:id" element={
          <EventDetail />
        } />
      </Routes>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingEventId(null);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}