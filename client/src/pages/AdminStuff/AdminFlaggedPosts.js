import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function AdminFlaggedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFlaggedPosts = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/flagged-posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("Invalid data format:", data);
        toast.error("Failed to load flagged posts");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch flagged posts");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/posts/${postId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Post approved");
      fetchFlaggedPosts();
    } catch {
      toast.error("Failed to approve post");
    }
  };

  const handleReject = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Post deleted");
      fetchFlaggedPosts();
    } catch {
      toast.error("Failed to delete post");
    }
  };

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

    fetchFlaggedPosts();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">
        Admin Panel – Flagged Posts
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No flagged posts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-11">
          {posts.map((post) => (
            <div
              key={post.post_id}
              className="bg-white shadow-lg rounded-l overflow-hidden border border-gray-200"
            >
              {post.primary_image_url && (
                <img
                  src={post.primary_image_url}
                  alt="Flagged post"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Posted by: <span className="font-medium">{post.username}</span> ({post.email})
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(post.post_id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(post.post_id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
