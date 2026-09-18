import React from 'react';

export default function PageNotFound() {
  return (
    <div dir="rtl">
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-green-600">٤٠٤</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            الصفحة غير موجودة
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              العودة إلى الصفحة الرئيسية
            </a>
            <a href="/about" className="text-sm font-semibold text-gray-900">
              تواصل مع الدعم <span aria-hidden="true">←</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
