import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // ✅ استيراد صحيح

export default function لوحة_الإدارة() {
  const [المستخدمون, تعيين_المستخدمون] = useState([]);
  const [تحميل, تعيين_التحميل] = useState(true);
  const تنقل = useNavigate();

  useEffect(() => {
    const الرمز = localStorage.getItem("token");
    if (!الرمز) return تنقل("/login");

    try {
      const مفكوك = jwtDecode(الرمز);
      if (!مفكوك.isAdmin) return تنقل("/not-authorized");
    } catch (err) {
      console.error("الرمز غير صالح:", err);
      return تنقل("/login");
    }

    const جلب_المستخدمين = async () => {
      try {
        const استجابة = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${الرمز}`,
          },
        });

        const بيانات = await استجابة.json();
        تعيين_المستخدمون(Array.isArray(بيانات) ? بيانات : []);
      } catch (err) {
        console.error("فشل في جلب المستخدمين:", err);
        تعيين_المستخدمون([]);
      } finally {
        تعيين_التحميل(false);
      }
    };

    جلب_المستخدمين();
  }, [تنقل]);

  const تبديل_مدير = async (id) => {
    try {
      const استجابة = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${id}/toggle-admin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const محدّث = await استجابة.json();
      تعيين_المستخدمون((السابق) =>
        السابق.map((مستخدم) =>
          مستخدم.id === محدّث.id ? { ...مستخدم, is_admin: محدّث.is_admin } : مستخدم
        )
      );
    } catch (err) {
      console.error("فشل في تبديل المدير:", err);
    }
  };

  const حذف_المستخدم = async (id) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      تعيين_المستخدمون((السابق) => السابق.filter((مستخدم) => مستخدم.id !== id));
    } catch (err) {
      console.error("فشل في حذف المستخدم:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-red-600 text-center">لوحة الإدارة – إدارة المستخدمين</h2>
        <button
          onClick={() => تنقل("/admin/posts")}
          className="bg-black hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          إدارة المنشورات
        </button>
      </div>

      {تحميل ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-green-900 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : !Array.isArray(المستخدمون) ? (
        <p className="text-center text-red-500">حدث خطأ أثناء تحميل المستخدمين.</p>
      ) : المستخدمون.length === 0 ? (
        <p className="text-center text-gray-600">لا يوجد مستخدمون.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-md overflow-hidden">
            <thead>
              <tr className="bg-green-900 text-white font-semibold font-serif">
                <th className="py-3 px-4 text-center">اسم المستخدم</th>
                <th className="py-3 px-4 text-center">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-center">مدير</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {المستخدمون.map((مستخدم) => (
                <tr key={مستخدم.id} className="border-t">
                  <td className="py-3 px-4">{مستخدم.username}</td>
                  <td className="py-3 px-4">{مستخدم.email}</td>
                  <td className="py-3 px-4 text-center">
                    {مستخدم.is_admin ? (
                      <span className="text-green-600 font-semibold">نعم</span>
                    ) : (
                      <span className="text-gray-500">لا</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => تبديل_مدير(مستخدم.id)}
                      className="bg-blue-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                      {مستخدم.is_admin ? "تنزيل" : "ترقية"}
                    </button>
                    <button
                      onClick={() => حذف_المستخدم(مستخدم.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      حذف
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
