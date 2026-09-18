import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

import { Link } from "react-router-dom"; // ✅ Add this at the top

const DonatorClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const decoded = jwtDecode(token);
    setUserId(decoded.userId);

    const fetchClaims = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/donations/claims/${decoded.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClaims(res.data);
      } catch (err) {
        console.error("Error fetching claims:", err.message);
        toast.error("Failed to fetch claims.");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [token]);

  const handleAction = async (claimId, action) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/donations/claims/${claimId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from local list
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      toast.success(`Claim ${action}ed successfully.`);
    } catch (err) {
      console.error("Error processing claim:", err.message);
      toast.error("Failed to process claim.");
    }
  };

  if (!token) return <p className="p-8">Please login to view claims.</p>;
  if (loading) return <p className="p-8 animate-pulse">Loading claims...</p>;
  if (claims.length === 0) return <p className="p-8">No pending claims.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-xl space-y-4 mt-10">

      <h1 className="text-3xl font-bold text-green-700 mb-6">Pending Claims</h1>

      {claims.map((claim) => (
        <div
          key={claim.id}
          className="border p-4 rounded-lg shadow flex justify-between items-start flex-wrap"
        >
          <div>
            <p className="text-lg font-semibold text-gray-800">
              📦 {claim.title}
            </p>
 <p className="text-sm text-gray-500 mt-1">
  Claimed by:{" "}
  <Link
    to={`/user/${claim.receiver_id}`}
    className="text-blue-600 underline hover:text-blue-800 transition"
  >
    {claim.receiver_username}
  </Link>
</p>

            {claim.message && (
              <p className="text-sm mt-2 text-gray-600 italic">
                “{claim.message}”
              </p>
            )}
            <p className="text-xs mt-1 text-gray-400">
              {new Date(claim.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-3 sm:mt-0 sm:ml-4">
            <button
              onClick={() => handleAction(claim.id, "confirm")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Confirm
            </button>
            <button
              onClick={() => handleAction(claim.id, "decline")}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonatorClaimsPage;
