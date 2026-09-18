import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-md shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition duration-300 group"
      onClick={() => navigate(`/ar/events/${event.id}`)}
    >
      {/* Image with overlay */}
      {event.images?.length > 0 && (
        <div className="relative h-52 overflow-hidden">
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
            <h3 className="text-xl font-bold text-white drop-shadow">{event.title}</h3>
            <p className="text-sm text-white/90">{event.location}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">{event.owner_name}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
