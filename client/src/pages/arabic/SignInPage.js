import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/movingarabic.gif";

export default function SignInPage({ setAuth }) {
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate(); 
useEffect(() => {
  console.log("API URL:", process.env.REACT_APP_API_URL);
}, []);
  const { email, password } = inputs;

  const onChange = e =>
    setInputs({ ...inputs, [e.target.name]: e.target.value });

  const onSubmitForm = async e => {
    e.preventDefault();
    try {
      const body = { email, password };
      const response = await fetch(`${process.env.REACT_APP_API_URL}/authentication/login`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body)
      });

      const parseRes = await response.json();

      if (parseRes.jwtToken) {
        localStorage.setItem("token", parseRes.jwtToken);
        setAuth(true);
        toast.success("Logged in Successfully");
        navigate("/feed");
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <section className=" bg-phoneimg bg-no-repeat md:bg-tabletimg  lg:bg-forarabic  bg-cover w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-6 py-12 shadow-2xl bg-white/10 backdrop-blur-md rounded-2xl transition-all duration-500 ease">
        <div className="flex flex-col items-center text-center gap-8">
          <img src={logo} alt="TBR3 Logo" className="w-1/2 h-29" />

          <form onSubmit={onSubmitForm} className="w-full space-y-6 text-right ">
            <div>
              <label htmlFor="email" className="block text-sm  text-black mb-2">البريد الإلكتروني</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm hover:ring-green-400 hover:ring-4 transition duration-300 text-right"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm  text-black mb-2">كلمة السر</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={onChange}
                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-4 text-gray-800 placeholder-gray-400 shadow-md focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm hover:ring-green-400 hover:ring-4 transition duration-300 text-right"
              />
            </div>

            <p className="text-sm text-center">
              <a href="/forgot-password" className="text-black hover:underline transition duration-150">
              نسيت كلمة السر؟
              </a>
            </p>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-800 px-5 py-2 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
             تسجيل الدخول
            </button>

            <p className="text-sm text-center text-black">
            ليس لديك حساب؟{" "}
              <a href="/authentication/registration" className="text-red-800 hover:underline transition duration-150">
                إنشئ حساب
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
