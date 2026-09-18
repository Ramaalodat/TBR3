import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// StarRating component
const StarRating = ({ rating, setRating }) => {
  const handleClick = (value) => {
    if (setRating) setRating(value);
  };

  return (
    <div className="flex justify-center space-x-5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <svg
            key={star}
            onClick={() => handleClick(star)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={isFilled ? "#facc15" : "none"}
            stroke="#facc15"
            className="w-10 h-10 cursor-pointer transition-transform duration-200 hover:scale-110"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M10 1.5c.4 0 .77.24.93.61l1.7 3.67 4.05.59c.98.14 1.38 1.34.66 2.03l-2.93 2.77.69 4.01c.17.98-.86 1.72-1.74 1.26L10 14.77l-3.62 1.9c-.88.46-1.91-.28-1.74-1.26l.69-4.01-2.93-2.77c-.72-.69-.32-1.89.66-2.03l4.05-.59 1.7-3.67c.16-.37.53-.61.93-.61Z"
            />
          </svg>
        );
      })}
    </div>
  );
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.userId);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
        setUser({ ...res.data, id: userId });
      } catch (err) {
        setError("Failed to fetch user data");
      }
    };

    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/feedback/${userId}`);
        setFeedbacks(res.data.feedbacks);
        setAverageRating(res.data.average_rating);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchFeedback();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!token || rating === 0) {
      setSubmitError("Please login and select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/feedback`,
        { receiver_id: userId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Feedback submitted!");
      setRating(0);
      setComment("");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response.data.message === "You already submitted feedback for this user."
      ) {
        setSubmitError("You already submitted feedback.");
      } else {
        setSubmitError("Failed to submit feedback.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/feedback/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Feedback deleted.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSubmitError("Failed to delete feedback.");
    }
  };

  if (loading)
    return <div className="p-6 text-gray-500 animate-pulse">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">No user data available.</div>;

  // Determine badge based on items_donated
  let badge = null;
  if (user.items_donated >= 100) badge = "🥇";
  else if (user.items_donated >= 50) badge = "🥈";
  else if (user.items_donated >= 0) badge = "🥉";

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-4">
        <div>
          <h1 className="text-4xl font-semibold leading-loose text-green-700 mb-4 text-center">User Info</h1>
<p className="text-xl leading-loose text-center">
  Username: <span className="text-red-600">{user.username}</span>
    {user.is_admin && (
    <span className="ml-3 bg-red-500 text-white px-2 py-1 text-m rounded">
      ADMIN
    </span>
  )}
  {badge && <span className="ml-2 text-2xl">{badge}</span>}

</p>

          <p className="text-xl leading-loose text-center">Email: <span className="text-red-600">{user.email}</span></p>
          <p className="text-lg text-center mt-2">Items Donated: <span className="font-semibold text-green-700">{user.items_donated}</span></p>
          {/* <p className="text-lg text-center">Items Received: <span className="font-semibold text-blue-600">{user.items_received}</span></p> */}

          {currentUserId && currentUserId !== user.id && (
            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.href = `/dm/${user.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow"
              >
                💬 Message {user.username}
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-left">Feedback:</h2>
          <p className="text-gray-700 mb-4 text-left">Average Rating: <strong>{averageRating}</strong> / 5</p>

          {feedbacks.length === 0 ? (
            <p className="text-gray-500 italic">No feedback yet.</p>
          ) : (
            <ul className="space-y-4">
              {feedbacks.map((f, index) => (
                <li key={index} className="relative bg-gray-100 border p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{f.giver_username}</span>
                    <span className="text-yellow-500 font-medium">{f.rating} / 5</span>
                  </div>
                  <p className="text-gray-600 mt-2">{f.comment}</p>
                  <p className="text-xs text-right text-gray-400 mt-1">
                    {new Date(f.created_at).toLocaleDateString()}
                  </p>
                  {f.giver_id === currentUserId && (
                    <button
                      onClick={handleDelete}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Leave Your Feedback</h2>
          {submitError && <p className="text-red-500 text-sm mb-2">{submitError}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-3 font-medium">Rating:</p>
              <StarRating rating={rating} setRating={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border p-3 rounded-md resize-none"
              placeholder="Write your feedback..."
              rows="4"
            ></textarea>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
