import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // ✅ استيراد صحيح

export default function لوحة_الإدارة_المنشورات() {
  const [المنشورات, تعيين_المنشورات] = useState([]);
  const [تحميل, تعيين_التحميل] = useState(true);
  const تنقل = useNavigate();

  // جلب المنشورات من السيرفر
  const جلب_المنشورات = async () => {
    try {
      const استجابة = await fetch(`${process.env.REACT_APP_API_URL}/admin/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!استجابة.ok) {
        console.error("فشل في جلب المنشورات. الحالة:", استجابة.status);
        return تعيين_المنشورات([]);
      }

      const بيانات = await استجابة.json();

      if (Array.isArray(بيانات)) {
        تعيين_المنشورات(بيانات);
      } else {
        console.error("تنسيق بيانات غير صحيح:", بيانات);
        تعيين_المنشورات([]);
      }
    } catch (err) {
      console.error("خطأ أثناء جلب المنشورات:", err.message);
      تعيين_المنشورات([]);
    } finally {
      تعيين_التحميل(false);
    }
  };

  // حذف منشور
  const حذف_المنشور = async (معرف_المنشور) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المنشور؟")) return;

    try {
      const استجابة = await fetch(`${process.env.REACT_APP_API_URL}/admin/posts/${معرف_المنشور}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (استجابة.ok) {
        تعيين_المنشورات((السابق) => السابق.filter((p) => p.post_id !== معرف_المنشور));
      } else {
        console.error("فشل في حذف المنشور");
      }
    } catch (err) {
      console.error("خطأ أثناء حذف المنشور:", err.message);
    }
  };

  useEffect(() => {
    const رمز = localStorage.getItem("token");

    if (!رمز) return تنقل("/login");

    try {
      const مفكوك = jwtDecode(رمز);
      if (!مفكوك.isAdmin) return تنقل("/not-authorized");
    } catch (err) {
      console.error("الرمز غير صالح:", err);
      return تنقل("/login");
    }

    جلب_المنشورات();
  }, [تنقل]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold text-center text-red-700 mb-8">
        لوحة الإدارة – إدارة المنشورات
      </h2>

      {تحميل ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : المنشورات.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">لا توجد منشورات.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-11">
          {المنشورات.map((منشور) => (
            <div
              key={منشور.post_id}
              className="bg-white shadow-lg rounded-l overflow-hidden border border-gray-200"
            >
              {منشور.primary_photo && (
                <img
                  src={`data:image/jpeg;base64,${منشور.primary_photo}`}
                  alt="المنشور"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{منشور.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  نُشر بواسطة: <span className="font-medium">{منشور.username}</span> ({منشور.email})
                </p>
                <button
                  onClick={() => حذف_المنشور(منشور.post_id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
                >
                  حذف المنشور
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
