import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";

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
        console.error("خطأ أثناء جلب الطلبات:", err.message);
        toast.error("فشل في جلب الطلبات.");
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

      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      toast.success(`تم ${action === 'confirm' ? 'تأكيد' : 'رفض'} الطلب بنجاح.`);
    } catch (err) {
      console.error("خطأ أثناء معالجة الطلب:", err.message);
      toast.error("فشل في معالجة الطلب.");
    }
  };

  if (!token) return <p className="p-8">يرجى تسجيل الدخول لعرض الطلبات.</p>;
  if (loading) return <p className="p-8 animate-pulse">جارٍ تحميل الطلبات...</p>;
  if (claims.length === 0) return <p className="p-8">لا توجد طلبات معلّقة.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-xl space-y-4 mt-10" dir="rtl">
      <h1 className="text-3xl font-bold text-green-700 mb-6">الطلبات المعلّقة</h1>

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
              تم الطلب بواسطة: {" "}
              <Link
                to={`/ar/user/${claim.receiver_id}`}
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
              {new Date(claim.created_at).toLocaleString('ar-EG')}
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-3 sm:mt-0 sm:ml-4">
            <button
              onClick={() => handleAction(claim.id, "confirm")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              تأكيد
            </button>
            <button
              onClick={() => handleAction(claim.id, "decline")}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              رفض
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonatorClaimsPage;
