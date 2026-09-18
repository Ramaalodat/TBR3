import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch posts. Status:", res.status);
        return setPosts([]);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("Invalid data format:", data);
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.post_id !== postId));
      } else {
        console.error("Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err.message);
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

    fetchPosts();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">
        Admin Panel – Manage Posts
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No posts found.</p>
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
                  alt="post"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Posted by: <span className="font-medium">{post.username}</span> ({post.email})
                </p>
                <button
                  onClick={() => deletePost(post.post_id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
                >
                  Delete Post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
