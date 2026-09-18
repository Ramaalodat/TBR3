import React from 'react';

export default function PrivacyPolicy() {
  return (
    <section className='bg-gray-100'>
    <div className="min-h-screen text-left w-full px-6 py-12 bg-white rounded-lg shadow-md text-gray-900 ">
      <h1 className="text-4xl font-semibold mb-8 border-b-2 border-green-600 pb-4 text-center ">
        Privacy Policy
      </h1>

      <p className="mb-6 leading-relaxed text-lg text-black">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
        Information We Collect
      </h2>
      <ul className="list-disc list-inside space-y-2 text-black">
        <li>Personal identification information (Name, email address, phone number, etc.)</li>
        <li>Usage data (e.g., pages visited, time spent)</li>
        <li>Cookies and tracking technologies</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
        How We Use Your Information
      </h2>
      <p className="mb-4 leading-relaxed black">
        We use your information to:
      </p>
      <ul className="list-disc list-inside space-y-2 text-black">
        <li>Provide, operate, and maintain our website</li>
        <li>Improve and personalize user experience</li>
        <li>Communicate with you, including customer service and updates</li>
        <li>Ensure compliance with legal obligations</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
        Sharing Your Information
      </h2>
      <p className="mb-6 leading-relaxed text-black">
        We do not sell or rent your personal data. We may share your data with service providers who help us operate the website, as required by law, or in connection with a business transaction.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
        Your Rights
      </h2>
      <p className="mb-6 leading-relaxed text-black">
        You have the right to access, update, or delete your personal information. Please contact us for any privacy-related concerns.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
        Changes to This Policy
      </h2>
      <p className="mb-6 leading-relaxed text-black">
        We may update this Privacy Policy from time to time. We encourage you to review this page periodically for any changes.
      </p>

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
        Contact Us
      </h2>
      <p className="text-black">
        If you have questions about this policy, contact us at{' '}
        <a 
          href="mailto:support@example.com" 
          className="text-green-600 hover:text-green-800 underline transition-colors"
        >
         tbr3project@gmail.com
        </a>.
      </p>
    </div>
    </section>
  );
}
