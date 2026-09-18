import React, { useEffect, useState } from "react";

const AdminBanner = () => {
  const [banners, setBanners] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all banners
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Create new banner
  const createBanner = async () => {
    if (!newContent.trim()) return alert("Content cannot be empty");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/banner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent, isActive }),
      });

      if (!res.ok) throw new Error("Banner creation failed");
      setNewContent("");
      setIsActive(true);
      await fetchBanners();
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create banner.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle banner status
  const toggleBanner = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/banner/${id}/toggle`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Toggle failed");
      await fetchBanners();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Banners</h2>

      {/* Create banner */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows="4"
          className="w-full p-2 border rounded mb-2"
          placeholder="Enter banner content (HTML or text)"
        ></textarea>

        <label className="inline-flex items-center mb-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
            className="mr-2"
          />
          Set as active
        </label>

        <button
          onClick={createBanner}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Banner"}
        </button>
      </div>

      {/* Banner history */}
      <h3 className="text-lg font-semibold mb-2">Banner History</h3>
      <div className="space-y-2">
        {banners.map((b) => (
          <div
            key={b.id}
            className={`border p-3 rounded ${
              b.is_active ? "border-red-500 bg-red-50" : "bg-gray-50"
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: b.content }} className="mb-2" />
            <div className="text-sm text-gray-600 flex justify-between items-center">
              <span>{new Date(b.created_at).toLocaleString()}</span>
              <button
                onClick={() => toggleBanner(b.id)}
                className="text-blue-600 hover:underline"
              >
                {b.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBanner;
