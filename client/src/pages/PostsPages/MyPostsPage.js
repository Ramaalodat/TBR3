import React, { useEffect, useState } from "react";
import axios from "axios";

const MyPostsPage = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/Posting/my-posts`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        setMyPosts(res.data); // ✅ Image URLs already included in `images` array
      } catch (err) {
        console.error("Error fetching my posts:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/Posting/delete-post/${postId}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      setMyPosts(myPosts.filter((post) => post.post_id !== postId));
    } catch (err) {
      alert("Failed to delete post.");
      console.error("Delete error:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-lg animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-4xl font-semibold mb-6 text-center text-green-500">My Posts</h2>

        {myPosts.length === 0 ? (
          <div className="flex items-center justify-center min-h-40">
            <p className="text-center text-red-600 font-bold text-4xl">You haven't posted anything yet.</p>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-3">
            {myPosts.map((post) => (
              <div
                key={post.post_id}
                className="w-full sm:w-1/2 lg:w-1/3 px-3 mb-6"
              >
                <div className="rounded-lg p-4 shadow-2xl bg-white h-full flex flex-col">
                  {post.images?.[0] && (
                    <img
                      src={post.images[0]} // ✅ Display first image from image URLs
                      alt="Post"
                      className="w-full h-auto mb-3 rounded"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <div className="mt-auto flex space-x-4">
                    <button
                      onClick={() => handleDelete(post.post_id)}
                      className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                    <a
                      href={`/edit_post/${post.post_id}`}
                      className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyPostsPage;
