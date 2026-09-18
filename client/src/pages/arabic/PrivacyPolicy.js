import React from 'react';

export default function PrivacyPolicy() {
  return (
    <section className='bg-gray-100'>
      <div className="min-h-screen text-right w-full px-6 py-12 bg-white rounded-lg shadow-md text-gray-900 ">
        <h1 className="text-4xl font-semibold mb-8 border-b-2 border-green-600 pb-4 text-center ">
          سياسة الخصوصية
        </h1>

        <p className="mb-6 leading-relaxed text-lg text-black">
          خصوصيتك مهمة بالنسبة لنا. تشرح سياسة الخصوصية هذه كيف نجمع ونستخدم ونكشف ونحمي معلوماتك عندما تستخدم موقعنا الإلكتروني
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          المعلومات التي نجمعها
        </h2>
        <p className="mb-4 text-black">
          معلومات التعريف الشخصية (الاسم، عنوان البريد الإلكتروني، رقم الهاتف، إلخ)  
        </p>
        <p className="mb-4 text-black">
          بيانات الاستخدام (مثل الصفحات التي تم زيارتها، الوقت الذي تم قضاؤه)  
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          كيف نستخدم معلوماتك
        </h2>
        <p className="mb-4 leading-relaxed text-black">
          : نستخدم معلوماتك من أجل 
        </p>
        <p className="mb-2 text-black">تقديم وتشغيل وصيانة موقعنا الإلكتروني</p>
        <p className="mb-2 text-black">تحسين وتخصيص تجربة المستخدم</p>
        <p className="mb-2 text-black">التواصل معك، بما في ذلك خدمة العملاء والتحديثات</p>
        <p className="mb-2 text-black">ضمان الامتثال للالتزامات القانونية</p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          مشاركة معلوماتك
        </h2>
        <p className="mb-6 leading-relaxed text-black">
          نحن لا نبيع أو نؤجر بياناتك الشخصية. قد نشارك بياناتك مع مزودي الخدمات الذين يساعدوننا في تشغيل الموقع، حسبما يقتضي القانون، أو في سياق صفقة تجارية
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          حقوقك
        </h2>
        <p className="mb-6 leading-relaxed text-black">
          لديك الحق في الوصول إلى معلوماتك الشخصية وتحديثها أو حذفها. يرجى التواصل معنا لأي استفسارات تتعلق بالخصوصية
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          التغييرات على هذه السياسة
        </h2>
        <p className="mb-6 leading-relaxed text-black">
          قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. نشجعك على مراجعة هذه الصفحة بشكل دوري لأي تغييرات
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-green-700">
          تواصل معنا
        </h2>
        <p className="text-right">
          <a 
            href="mailto:support@example.com" 
            className="text-green-700 underline rtl"
          >
            tbr3project@gmail.com
          </a>
            إذا كان لديك أي استفسارات بخصوص هذه السياسات، يرجى التواصل معنا عبر البريد الإلكتروني {' '}
           
        </p>
      </div>
    </section>
  );
}
