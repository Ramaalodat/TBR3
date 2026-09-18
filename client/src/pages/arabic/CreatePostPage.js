import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import ContactInfo from '../../components/contactInfo/contactInfo';
import LocationMap from '../../components/contactInfo/locationMap';

function صفحة_إنشاء_منشور({ عندإنشاء_المنشور }) {
  const تنقل = useNavigate();
  const [العنوان, تعيين_العنوان] = useState("");
  const [الوصف, تعيين_الوصف] = useState("");
  const [الصور, تعيين_الصور] = useState([]);
  const [جار_الرفع, تعيين_جار_الرفع] = useState(false);
  const [تقدم_الرفع, تعيين_تقدم_الرفع] = useState(0);
  const [البريد, تعيين_البريد] = useState('');
  const [الهاتف, تعيين_الهاتف] = useState('');
  const [الموقع, تعيين_الموقع] = useState('');
  const [الفئة, تعيين_الفئة] = useState('');
  const [المميزات, تعيين_المميزات] = useState(['']);

  const خيارات_الفئات = [
    "أثاث", "إلكترونيات", "ألعاب", "ملابس", "كتب",
    "أجهزة منزلية", "دمى", "أدوات", "معدات رياضية", "طعام", "أخرى"
  ];

  const عند_الإسقاط = useCallback((الملفات_المقبولة) => {
    const ملفات_صحيحة = الملفات_المقبولة.filter(ملف =>
      ملف.type.startsWith('image/') && ملف.size <= 5 * 1024 * 1024
    );
    if (ملفات_صحيحة.length !== الملفات_المقبولة.length) {
      toast.warning("تم رفض بعض الملفات. فقط الصور تحت 5 ميجابايت مسموح بها.");
    }
    تعيين_الصور(السابق => [...السابق, ...ملفات_صحيحة]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: عند_الإسقاط,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024
  });

  const إزالة_صورة = (الفهرس) => {
    تعيين_الصور(السابق => السابق.filter((_, i) => i !== الفهرس));
  };

  const معالجة_الإرسال = async (e) => {
    e.preventDefault();

    if (!الفئة) {
      toast.error("يرجى اختيار الفئة");
      return;
    }

    if (الصور.length === 0) {
      toast.error("يرجى رفع صورة واحدة على الأقل");
      return;
    }

    const formData = new FormData();
    formData.append("title", العنوان);
    formData.append("description", الوصف);
    //formData.append("features", JSON.stringify(المميزات.filter(f => f.trim() !== '')));
    formData.append("email", البريد);
    formData.append("phone", الهاتف);
    formData.append("location", الموقع);
    //formData.append("category", الفئة);
    const مميزات_مصفاة = المميزات.filter(f => f.trim() !== '');
    const كل_المميزات = [الفئة, ...مميزات_مصفاة];
    formData.append("features", JSON.stringify(كل_المميزات));

    الصور.forEach((صورة) => {
      formData.append("images", صورة);
    });

    تعيين_جار_الرفع(true);
    تعيين_تقدم_الرفع(0);

    try {
      const استجابة = await fetch(`${process.env.REACT_APP_API_URL}/create_post`, {
        method: "POST",
        headers: {
          jwt_token: localStorage.getItem("token"),
        },
        body: formData,
      });

      if (استجابة.ok) {
        const بيانات = await استجابة.json();
        toast.success("تم إنشاء المنشور بنجاح");

        تعيين_العنوان("");
        تعيين_الوصف("");
        تعيين_الصور([]);
        تعيين_المميزات(['']);
        تعيين_الفئة("");
        تعيين_البريد("");
        تعيين_الهاتف("");
        تعيين_الموقع("");
        تعيين_تقدم_الرفع(0);

        if (بيانات.post_id) {
          تنقل(`/posts/${بيانات.post_id}`);
        } else {
          تنقل('/');
        }

        if (عندإنشاء_المنشور) عندإنشاء_المنشور();
      } else {
        const نص_الخطأ = await استجابة.text();
        try {
          const بيانات_الخطأ = JSON.parse(نص_الخطأ);
          toast.error(بيانات_الخطأ.message || "غير قادر على إنشاء المنشور");
        } catch {
          toast.error(نص_الخطأ || "غير قادر على إنشاء المنشور");
        }
      }
    } catch (err) {
      console.error("خطأ في الإرسال:", err);
      toast.error("حدث خطأ أثناء إنشاء المنشور.");
    } finally {
      تعيين_جار_الرفع(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col  ">
      <div className="w-full  py-6 px-4 md:px-12 lg:px-24 xl:px-40 mt-3 ">
        <h1 className="text-4xl font-semibold text-red-700 text-center ">
          إنشاء منشور جديد
        </h1>

        {جار_الرفع && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${تقدم_الرفع}%` }}
              />
            </div>
            <p className="text-center text-sm text-green-800 mt-2">
              جاري الرفع... {تقدم_الرفع}%
            </p>
          </div>
        )}

        <form
          onSubmit={معالجة_الإرسال}
          encType="multipart/form-data"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* العمود الأيسر */}
          <div className="space-y-6">
            {/* العنوان */}
            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">العنوان</label>
              <input
                type="text"
                value={العنوان}
                onChange={(e) => تعيين_العنوان(e.target.value)}
                required
                placeholder="أدخل عنوان العنصر"
                className="w-full border border-gray-300 rounded-md px-4 py-2 "
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">الوصف</label>
              <textarea
                value={الوصف}
                onChange={(e) => تعيين_الوصف(e.target.value)}
                rows={5}
                required
                placeholder="اكتب وصفًا تفصيليًا"
                className="w-full border border-gray-300 rounded-md px-4 py-2 resize-none" 
              />
            </div>

            {/* الفئة */}
            <div>
              <label className="block text-lg font-semibold text-green-800 mb-1">الفئة</label>
              <select
                value={الفئة}
                onChange={(e) => تعيين_الفئة(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- اختر فئة --</option>
                {خيارات_الفئات.map((خيار, فهرس) => (
                  <option key={فهرس} value={خيار}>
                    {خيار}
                  </option>
                ))}
              </select>
            </div>

            {/* معلومات التواصل */}
            <ContactInfo email={البريد} setEmail={تعيين_البريد} phone={الهاتف} setPhone={تعيين_الهاتف} />
          </div>

          {/* العمود الأيمن */}
          <div className="space-y-6">
            {/* رفع الصور */}
            <div>
              <label className="block text-lg font-semibold text-green-800 mb-2">الصور</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-gray-600">
                  {isDragActive
                    ? 'أسقط الصور هنا...'
                    : 'اسحب وأفلت الصور أو انقر لاختيار الملفات'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPEG، PNG، GIF (حتى 5 ميجابايت لكل صورة)
                </p>
              </div>
            </div>

            {/* معاينة الصور */}
            {الصور.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {الصور.map((صورة, فهرس) => (
                  <div key={فهرس} className="relative group">
                    <img
                      src={URL.createObjectURL(صورة)}
                      alt={`معاينة ${فهرس + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => إزالة_صورة(فهرس)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* اختيار الموقع */}
            <LocationMap onLocationSelect={تعيين_الموقع} />
            {الموقع && <p className="text-sm text-green-800 mt-1">{الموقع}</p>}
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={جار_الرفع || الصور.length === 0}
              className="w-full bg-red-700  text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {جار_الرفع ? 'جارٍ الرفع' : 'إنشاء المنشور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default صفحة_إنشاء_منشور;
