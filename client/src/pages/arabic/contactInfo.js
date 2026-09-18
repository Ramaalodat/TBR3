import React from 'react';

export default function ContactInfo({ phone, setPhone }) {
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPhone(value);
    }
  };

  return (
    <div className="contact-info-container space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          رقم الهاتف
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="07XXXXXXXX"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          maxLength="10"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          أدخل رقم هاتفك بدون رمز الدولة (مثلاً: 07XXXXXXXX)
        </p>
      </div>
    </div>
  );
}
