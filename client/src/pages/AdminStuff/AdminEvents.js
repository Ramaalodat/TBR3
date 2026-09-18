import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      if (!decoded.isAdmin) return navigate("/not-authorized");
    } catch (err) {
      console.error("Invalid token:", err);
      return navigate("/login");
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setEvents(data); // ✅ use direct image URLs
      } catch (err) {
        console.error("Failed to fetch events", err);
        toast.error("Error loading events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Delete failed");

      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted.");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete event.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-3xl font-bold text-red-700 mb-6 text-center">Manage Events</h1>

      {loading ? (
        <div className="text-center">Loading events...</div>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-600">No events available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-4">
              {event.images?.[0] && (
                <img
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.event_date} | {event.location}</p>
              <p className="text-sm mb-2 text-gray-500">By: {event.owner_name}</p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  View
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
