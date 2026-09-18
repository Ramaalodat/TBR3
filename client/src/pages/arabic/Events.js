import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './ArabicEventCard';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('حدث خطأ أثناء جلب الفعاليات:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="min-h-screen bg-gray-100 bg-cover w-full px-5 py-2" dir="rtl">
      <div>
        {/* العنوان */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-semibold text-green-700 pt-7">
            <span className="text-red-700">الفعاليات</span> القادمة
          </h1>
        </div>

        {/* صندوق المعلومات */}
        <div className="bg-white bg-opacity-70 border-r-4 border-green-600 text-green-800 px-6 py-4 text-2xl shadow-md mb-8 mx-0">
          <p className="text-base">
            هل ترغب بتنظيم فعالية جديدة؟ يمكنك{' '}
            <Link to="/ar/about" className="text-red-700 hover:underline font-semibold">
              التواصل معنا من هنا
            </Link>{' '}
            للبدء.
          </p>
        </div>

        {/* تحميل / فارغ / فعاليات */}
        {loading ? (
          <div className="text-center py-16 text-gray-600 text-lg font-medium">جارٍ تحميل الفعاليات...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">لا توجد فعاليات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
