import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useNavigate } from 'react-router-dom';

const SliderEvent = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/events`);
        const data = await res.json();
        setEvents(data); // ✅ Use URLs directly now
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="relative px-4 bg-gray-100 pb-3">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        speed={500}
        loop={true}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 15 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
        className="relative bg-gray-100"
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <div
              className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              {event.images?.length > 0 && (
                <div className="relative h-48">
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-white/90 text-sm">{event.location}</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{event.description}</p>
                <div className="flex items-center">
                  <p className="text-gray-500 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {event.owner_name}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SliderEvent;
