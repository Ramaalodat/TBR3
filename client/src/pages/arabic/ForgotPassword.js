import React, { useState } from "react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { message } = await response.json();
      response.ok ? toast.success(message) : toast.error(message);
    } catch (error) {
      console.error("خطأ في طلب إعادة تعيين كلمة المرور:", error);
      toast.error("فشل إرسال رابط إعادة التعيين");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 ">
      <div className="w-full max-w-md bg-green-600 shadow-2xl shadow-green-100 rounded-xl p-8">
        <h1 className="text-3xl font-semibold text-center text-white mb-6">
          هل نسيت كلمة المرور؟
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="أدخل بريدك الإلكتروني"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-700 text-green-500 font-semibold py-2 px-4 rounded-md shadow transition duration-200"
          >
            إرسال رابط إعادة التعيين
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
