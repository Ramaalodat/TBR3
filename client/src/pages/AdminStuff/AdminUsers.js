import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
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

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const toggleAdmin = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${id}/toggle-admin`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? { ...user, is_admin: updated.is_admin } : user))
      );
    } catch (err) {
      console.error("Failed to toggle admin:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-green-700">Users Management</h2>
        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          Back to Admin Panel
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm text-green-800 font-semibold">Search by Email:</label>
        <input
          type="text"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Enter email..."
          className="border border-gray-300 rounded px-3 py-1 w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-900 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center text-gray-500">No users match that email.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-md overflow-hidden">
            <thead>
              <tr className="bg-green-900 text-white font-semibold font-serif">
                <th className="py-3 px-4 text-center">Username</th>
                <th className="py-3 px-4 text-center">Email</th>
                <th className="py-3 px-4 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 text-center">
                    {user.is_admin ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => toggleAdmin(user.id)}
                      className="bg-blue-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      {user.is_admin ? "Demote" : "Promote"}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
