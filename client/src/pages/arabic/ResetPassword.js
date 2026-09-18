import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("الرمز مفقود أو غير صالح");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "تم إعادة تعيين كلمة المرور بنجاح");
      } else {
        toast.error(data.message || "فشل في إعادة تعيين كلمة المرور");
      }
    } catch (err) {
      console.error("خطأ في إعادة التعيين:", err);
      toast.error("حدث خطأ ما");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
      <div className="backdrop-blur-md bg-white/60 shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-green-700 mb-6">
          تعيين كلمة المرور الجديدة
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              كلمة المرور الجديدة
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="أدخل كلمة المرور الجديدة"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
          >
            إعادة تعيين كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
}
