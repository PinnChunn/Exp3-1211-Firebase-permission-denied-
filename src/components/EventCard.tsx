import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Users, Check, ExternalLink, Share2, Sparkles, Timer } from 'lucide-react';
import { logUserActivity } from '../lib/firebase';
import { isUserRegistered } from '../lib/events/service';
import type { EventCardProps } from '../lib/events/types';

export default function EventCard({
  id,
  title,
  date,
  time,
  tags = [],
  skills = [],
  imageUrl,
  onRegister,
  externalLink,
  isAuthenticated,
  userId,
  xp = 0,
  duration,
  participants = 0
}: EventCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      if (isAuthenticated && userId && id) {
        const registered = await isUserRegistered(id, userId);
        setIsRegistered(registered);
      }
    };

    checkRegistration();
  }, [isAuthenticated, userId, id]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = externalLink || `${window.location.origin}/events/${id}`;
    const shareData = {
      title: title,
      text: `Check out "${title}" on EXP3`,
      url: shareUrl
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        logUserActivity.shareEvent(id, 'native_share');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        logUserActivity.shareEvent(id, 'copy_link');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getButtonConfig = () => {
    if (isRegistered) {
      return {
        text: 'Registered',
        icon: Check,
        className: 'bg-purple-100 text-purple-600 cursor-default',
        disabled: true
      };
    }

    if (externalLink) {
      return {
        text: 'Register on Lu.ma',
        icon: ExternalLink,
        className: 'bg-purple-600 hover:bg-purple-700 text-white',
        disabled: false,
        onClick: () => window.open(externalLink, '_blank', 'noopener,noreferrer')
      };
    }

    if (!isAuthenticated) {
      return {
        text: 'Connect to Register',
        icon: Users,
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        disabled: false,
        onClick: onRegister
      };
    }

    return {
      text: 'Register Now',
      icon: Calendar,
      className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      disabled: false,
      onClick: onRegister
    };
  };

  const renderMedia = () => {
    if (imageUrl?.endsWith('.mp4')) {
      return (
        <video 
          className="w-full h-48 object-cover rounded-t-xl"
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
        className="w-full h-48 object-cover rounded-t-xl"
      />
    );
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        {renderMedia()}
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

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold mb-4">{title}</h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>{time}</span>
          </div>
          {duration && (
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-indigo-600" />
              <span>{duration}</span>
            </div>
          )}
          {typeof participants === 'number' && (
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>{participants} participants</span>
            </div>
          )}
          {xp && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>{xp} XP</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-gray-600">Skills you'll gain:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            buttonConfig.onClick?.();
          }}
          disabled={buttonConfig.disabled}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${buttonConfig.className}`}
        >
          <buttonConfig.icon className="w-5 h-5" />
          {buttonConfig.text}
        </button>
      </div>
    </div>
  );
}