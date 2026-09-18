import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RegistrationPage = ({ setAuth }) => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  });

  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const { username, email, password, phone_number } = inputs;

  const jordanPhoneRegex = /^(?:\+9627\d{8}|07\d{8})$/;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!jordanPhoneRegex.test(phone_number)) {
      toast.error("رقم الهاتف يجب أن يكون بصيغة +9627XXXXXXXX أو 07XXXXXXXX");
      return;
    }

    if (cooldown > 0) {
      toast.warn(`يرجى الانتظار ${cooldown} ثانية قبل إعادة الإرسال`);
      return;
    }

    const formattedPhone =
      phone_number.startsWith('07') ? '+962' + phone_number.slice(1) : phone_number;

    try {
      setIsSending(true);

      const checkRes = await fetch(`${process.env.REACT_APP_API_URL}/api/users/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok || !checkData.success) {
        throw new Error(checkData.error || 'رقم الهاتف مسجل مسبقًا');
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      if (!res.ok) throw new Error(await res.text());

      setOtpSent(true);
      toast.success('تم إرسال الرمز إلى هاتفك');

      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error('خطأ: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    const formattedPhone =
      phone_number.startsWith('07') ? '+962' + phone_number.slice(1) : phone_number;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, code: otp }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('تم التحقق من رقم الهاتف بنجاح');
        setPhoneVerified(true);
      } else {
        toast.error('فشل التحقق: ' + (data.error || 'رمز غير صحيح'));
      }
    } catch (err) {
      toast.error('خطأ أثناء التحقق: ' + err.message);
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    if (!phoneVerified) {
      toast.error('يرجى التحقق من رقم الهاتف أولاً');
      return;
    }

    const formattedPhone =
      phone_number.startsWith('07') ? '+962' + phone_number.slice(1) : phone_number;

    try {
      const body = { username, email, password, phone_number: formattedPhone };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/authentication/registration`,
        {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const parseRes = await response.json();

      if (parseRes.jwtToken) {
        localStorage.setItem('token', parseRes.jwtToken);
        setAuth(true);
        toast.success('تم التسجيل بنجاح');
        navigate('/ar/feed');
      } else {
        setAuth(false);
        toast.error('حدث خطأ أثناء التسجيل');
      }
    } catch (err) {
      console.error('Error:', err.message);
      toast.error('خطأ: فشل في عملية التسجيل');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Right side (Video) */}
      <div className="hidden md:block md:w-1/3 bg-gray-100">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mx-4 py-3"
        >
          <source src="https://media.tbr3.org/videos/reg5.mp4" type="video/mp4" />
          متصفحك لا يدعم عرض الفيديو
        </video>
      </div>

      {/* Left side (Form) */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-start bg-gray-100 px-4 py-32 ">
        <div className="w-full max-w-2xl" dir="rtl">
          <h2 className="text-6xl font-semibold text-green-600 mb-10 text-center py-7">إنشاء حساب</h2>

          <form onSubmit={onSubmitForm} className="space-y-4">
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="اسم المستخدم"
              className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required
            />

            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="البريد الإلكتروني"
              className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required
            />

            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="كلمة المرور"
              className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                focus:border-green-500 focus:ring-2 focus:ring-green-400
                hover:ring-2 hover:ring-green-400"
              required
            />

           <div className="flex items-center gap-2 flex-row-reverse">
  <button
    type="button"
    onClick={sendOtp}
    disabled={cooldown > 0 || isSending}
    className={`px-6 py-2 text-white whitespace-nowrap rounded-full transition duration-200 ${
      cooldown > 0 || isSending
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {isSending
      ? 'جاري الإرسال...'
      : cooldown > 0
      ? `أعد الإرسال خلال ${cooldown}s`
      : 'إرسال الرمز'}
  </button>

  <input
    type="tel"
    name="phone_number"
    value={phone_number}
    onChange={onChange}
    placeholder="رقم الهاتف"
    className="w-full px-4 py-2 border text-right rounded-full outline-none transition duration-200
      focus:border-green-500 focus:ring-2 focus:ring-green-400
      hover:ring-2 hover:ring-green-400 "
    required
  />
</div>
            {otpSent && !phoneVerified && (
              <div className="flex items-center gap-2" dir="rtl">
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                >
                  تحقق
                </button>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="أدخل الرمز"
                  className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                    focus:border-green-500 focus:ring-2 focus:ring-green-400
                    hover:ring-2 hover:ring-green-400"
                />
              </div>
            )}

            {phoneVerified && (
              <p className="text-sm text-green-600 font-medium">✅ تم التحقق من رقم الهاتف</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-full font-semibold transition duration-200"
            >
              إنشاء حساب
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-700">
            هل لديك حساب؟{' '}
            <Link to="/authentication/login" className="underline font-medium text-green-600">
              سجّل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
