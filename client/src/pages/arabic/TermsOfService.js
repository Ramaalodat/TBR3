import React from 'react';

export default function TermsOfService() {
  return (
    <div className="w-full min-h-screen bg-white px-6 py-10 text-black text-right" dir="rtl">
      <h1 className="text-3xl font-semibold text-center mb-6 border-b-2 border-green-700 pb-4">شروط الخدمة</h1>

      <p className="mb-4">
        مرحبًا بكم في موقعنا. باستخدامك أو دخولك إلى الموقع، فإنك توافق على الالتزام بهذه الشروط. إذا لم توافق على أي جزء منها، يرجى عدم استخدام الموقع.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. استخدام الموقع</h2>
      <p className="mb-4">
        توافق على استخدام الموقع لأغراض قانونية فقط وبطريقة لا تنتهك حقوق الآخرين أو تقيد استخدامهم واستمتاعهم بالموقع.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. حسابات المستخدمين</h2>
      <p className="mb-4">
        قد يُطلب منك إنشاء حساب للوصول إلى ميزات معينة. أنت مسؤول عن الحفاظ على سرية معلومات تسجيل الدخول الخاصة بك.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. الملكية الفكرية</h2>
      <p className="mb-4">
        جميع المحتويات على الموقع هي ملك لنا أو مرخصة لنا. لا يجوز لك نسخها أو توزيعها أو إنشاء أعمال مشتقة منها دون إذن منا.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. إنهاء الخدمة</h2>
      <p className="mb-4">
        نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الموقع حسب تقديرنا الخاص، دون إشعار أو تحمل أي مسؤولية.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. تحديد المسؤولية</h2>
      <p className="mb-4">
        لسنا مسؤولين عن أي أضرار تنشأ من استخدامك للموقع. استخدام الموقع يكون على مسؤوليتك الخاصة.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. تغييرات الشروط</h2>
      <p className="mb-4">
        قد نقوم بتحديث شروط الخدمة في أي وقت. استمرارك في استخدام الموقع يعني قبولك للشروط الجديدة.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. تواصل معنا</h2>
      <p>
        إذا كان لديك أي استفسارات بخصوص هذه الشروط، يرجى التواصل معنا عبر البريد الإلكتروني{' '}
        <a href="mailto:support@example.com" className="text-green-700 underline">
          tbr3project@gmail.com
        </a>
      </p>
    </div>
  );
}
