import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Award, Brain, Globe, Book, Share2, Check, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getEvent, Event, isUserRegistered, registerForEvent } from '../lib/events';
import { getCurrentUser } from '../lib/auth';
import AuthModal from './AuthModal';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        const eventData = await getEvent(id);
        
        if (eventData) {
          setEvent(eventData);
          if (currentUser) {
            const registered = await isUserRegistered(id, currentUser.id);
            setIsRegistered(registered);
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: event.title,
      text: `Check out "${event.title}" on EXP3`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (clipboardErr) {
        console.error('Failed to copy to clipboard:', clipboardErr);
      }
    }
  };

  const handleRegistration = async () => {
    if (!event || !id) return;
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      const { error } = await registerForEvent(id, user.id);
      if (!error) {
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleAuthSuccess = async (userData: any) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    
    if (id) {
      await handleRegistration();
    }
  };

  const renderMedia = (imageUrl: string, title: string) => {
    if (imageUrl.endsWith('.mp4')) {
      return (
        <video 
          className="w-full h-64 object-cover rounded-t-2xl"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src={imageUrl} type="video/mp4" />
        </video>
      );
    }

    return (
      <img 
        src={imageUrl}
        alt={title}
        className="w-full h-64 object-cover rounded-t-2xl"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                {renderMedia(event.imageUrl, event.title)}
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors duration-300 flex items-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Share</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">{event.title}</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span>{event.format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>{event.participants || 0}/{event.attendeeLimit} seats</span>
                  </div>
                </div>

                {isRegistered && event.externalLink && (
                  <div className="mb-8 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-700">Event Link:</span>
                      <a
                        href={event.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:text-green-800 underline flex items-center gap-1"
                      >
                        Join Event <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="prose max-w-none mb-8">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4">Skills You'll Gain</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Registration Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold">Free Event</div>
                <div className="text-gray-500">{event.xp} XP</div>
              </div>
              
              {isRegistered ? (
                <div className="w-full py-3 bg-green-100 text-green-600 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Registered</span>
                </div>
              ) : event.externalLink ? (
                <a 
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Register on Lu.ma
                </a>
              ) : (
                <button 
                  onClick={handleRegistration}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 mb-4"
                  disabled={event.participants >= event.attendeeLimit}
                >
                  {!user ? 'Sign in to Register' : 
                   event.participants >= event.attendeeLimit ? 'Sold Out' : 
                   'Register Now'}
                </button>
              )}

              <div className="text-sm text-gray-500 text-center mt-4">
                {event.attendeeLimit - (event.participants || 0)} spots remaining
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={event.instructor.avatar}
                  alt={event.instructor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold">{event.instructor.name}</h3>
                  <p className="text-gray-600">{event.instructor.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}