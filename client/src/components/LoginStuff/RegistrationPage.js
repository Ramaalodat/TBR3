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
      toast.error("Phone number must be in format +9627XXXXXXXX or 07XXXXXXXX");
      return;
    }

    if (cooldown > 0) {
      toast.warn(`Please wait ${cooldown} seconds before resending`);
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
        throw new Error(checkData.error || 'Phone already registered');
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      if (!res.ok) throw new Error(await res.text());

      setOtpSent(true);
      toast.success('OTP sent to your phone');

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
      toast.error('Error: ' + err.message);
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
        toast.success('Phone verified successfully');
        setPhoneVerified(true);
      } else {
        toast.error('Verification failed: ' + (data.error || 'Invalid code'));
      }
    } catch (err) {
      toast.error('Verification error: ' + err.message);
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    if (!phoneVerified) {
      toast.error('Please verify your phone number first');
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
        toast.success('Registered Successfully');
        navigate('/feed');
      } else {
        setAuth(false);
        toast.error('Error: Unable to register');
      }
    } catch (err) {
      console.error('Error:', err.message);
      toast.error('Error: Unable to register');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side (Form) */}
      <div className="w-full md:w-2/3 flex flex-col items-center justify-start bg-gray-100 px-4 py-32 ">
        <div className=" w-full max-w-2xl">
          <h2 className="text-6xl font-semibold text-green-600 mb-10 text-center py-7">Registration</h2>

          <form onSubmit={onSubmitForm} className="space-y-4">
            {['username', 'email', 'password'].map((field, index) => (
              <input
                key={index}
                type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                name={field}
                value={inputs[field]}
                onChange={onChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                  focus:border-green-500 focus:ring-2 focus:ring-green-400
                  hover:ring-2 hover:ring-green-400"
                required
              />
            ))}

            <div className="flex items-center gap-2">
              <input
                type="tel"
                name="phone_number"
                value={phone_number}
                onChange={onChange}
                placeholder="e.g. +9627XXXXXXXX or 07XXXXXXXX"
                className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                  focus:border-green-500 focus:ring-2 focus:ring-green-400
                  hover:ring-2 hover:ring-green-400"
                required
              />
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
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Send OTP'}
              </button>
            </div>

            {otpSent && !phoneVerified && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-2 border rounded-full outline-none transition duration-200
                    focus:border-green-500 focus:ring-2 focus:ring-green-400
                    hover:ring-2 hover:ring-green-400"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                >
                  Verify
                </button>
              </div>
            )}

            {phoneVerified && (
              <p className="text-sm text-green-600 font-medium">✅ Phone verified</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-full font-semibold transition duration-200"
            >
              Create Account
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-700">
            Already have an account?{' '}
            <Link to="/authentication/login" className="underline font-medium text-green-600">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side (Image) */}
      <div className="hidden md:block md:w-1/3 bg-gray-100">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mx-4 py-3"
        >
          <source src="https://media.tbr3.org/videos/reg5.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default RegistrationPage;