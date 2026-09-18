import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ShowEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${id}`);
        if (!response.ok) {
          throw new Error('فشل في جلب بيانات الفعالية');
        }
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('حدث خطأ أثناء جلب الفعالية:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <div className="text-center py-16 text-lg font-semibold text-gray-600">جاري التحميل...</div>;
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-3xl font-extrabold mb-6 text-red-600">الفعالية غير موجودة</h2>
        <p className="mb-6 text-gray-700 text-lg">الفعالية التي تبحث عنها غير متوفرة.</p>
        <button
          onClick={() => navigate('/ar/events')}
          className="inline-block bg-green-700 text-white px-6 py-3 rounded-md shadow hover:bg-green-800 transition"
        >
          الرجوع للفعاليات
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl" dir="rtl">
      <button
        onClick={() => navigate('/ar/events')}
        className="inline-flex items-center mb-8 text-green-700 hover:text-green-900 font-semibold transition"
        aria-label="Back to Events"
      >
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M14 5l7 7-7 7M21 12H3" />
        </svg>
        الرجوع للفعاليات
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {event.images && event.images.length > 0 && (
          <div className="relative h-80 sm:h-96 w-full">
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-8">
          <h1 className="text-4xl font-semibold mb-6 flex items-center text-gray-900">
            <svg className="w-9 h-9 ml-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {event.title}
          </h1>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-700">
              <svg className="w-7 h-7 ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              تفاصيل الفعالية
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                  <svg className="w-6 h-6 ml-3 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  التاريخ والوقت
                </h3>
                <div className="space-y-3 text-gray-800 font-medium bg-gray-50 rounded-lg p-4 shadow-inner">
                  <p>{new Date(event.event_date).toLocaleDateString('ar-EG', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}</p>
                  <p>
                    من <span className="font-semibold">{formatTime(event.start_time)}</span> إلى{' '}
                    <span className="font-semibold">{formatTime(event.end_time)}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                  <svg className="w-6 h-6 ml-3 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  الموقع
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 font-medium text-gray-800 shadow-inner">
                  {event.location}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-700">
              <svg className="w-7 h-7 ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              المنظّم
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 font-medium text-gray-800 shadow-inner max-w-sm">
              {event.owner_name}
            </div>
          </section>

          {event.images && event.images.length > 1 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-700">
                <svg className="w-7 h-7 ml-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                المعرض
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {event.images.slice(1).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`صورة الفعالية ${idx + 1}`}
                    className="w-full h-36 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}