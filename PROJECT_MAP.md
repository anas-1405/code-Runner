# PROJECT_MAP.md - Live Project Map

> آخر تحديث: 2026-10-24

## [نظرة عامة]
**اسم المشروع:** Web Code Runner
**الوصف:** خدمة ويب لتشغيل أكواد C و C++ و Python مباشرة من المتصفح، مع دعم ملفات متعددة، اختيار لغة البرمجة، تظليل الكلمات المفتاحية، عرض الأخطاء بشكل منفصل باللون الأحمر، واستخدام مترجمات محلية (MinGW) أو Docker حسب توفر البيئة.

## [TECH_STACK]
| المكون | التقنية | الإصدار (حتى 2026-10) | ملاحظات |
|---|---|---|---|
| Runtime (Backend) | Node.js LTS | 22.x | Stable LTS |
| Language (Backend) | TypeScript | 5.9.x | Strict mode |
| API Framework | Express.js | 4.21.x | مستقر، تجنب Express 5 |
| Docker Client | dockerode | 4.x | للتحكم بالحاويات (اختياري) |
| Local Compilers | MinGW-W64 (gcc/g++) / py launcher | gcc 16.2.0 | للتشغيل المحلي عند عدم توفر Docker |
| Runtime (Frontend) | Vite | 7.x | Build tool |
| Language (Frontend) | TypeScript | 5.9.x | Strict mode |
| Container Base | Debian Bookworm Slim + build-essential + gcc/g++ + python3 | مستقر | جاهز للبناء |
| Logging | Console logging | مخصص | غير متزامن بسيط |

## [SYSTEM_FLOW]
1. يفتح المستخدم التطبيق عبر المتصفح
2. يختار لغة البرمجة من القائمة (Auto/C/C++/Python)
3. ينشئ/يحرر ملفات متعددة
4. يحدد الملف الرئيسي
5. يضغط Run
6. Backend يحدد runner (Docker أو Local) ويترجم/يشغل
7. يعرض الناتج في قسم Output
8. يعرض الأخطاء في قسم Errors باللون الأحمر أسفل الناتج

## [ARCHITECTURE]
```
/backend
  /src
    /api        -> run route
    /services   -> runner, localRunner, dockerService
    /shared     -> types
/server.ts

/frontend
  /src
    /api.ts     -> API client
    /main.ts    -> UI logic + keyword lists
    /style.css  -> styles + syntax/error styles
    /types.ts   -> types
/index.html
```

## [التعديلات المنفذة]
- [x] إضافة قائمة اختيار لغة البرمجة (language selector) في الهيدر
- [x] إضافة قسم Errors أسفل قسم Output بلون أحمر
- [x] إضافة فئات CSS للكلمات المفتاحية (`.keyword`, `.type`, `.string`, `.number`, `.comment`)
- [x] إضافة قوائم كلمات مفتاحية لـ C/C++/Python في `main.ts`
- [x] تحديث منطق التشغيل لعرض stdout في Output وstderr في Errors
- [x] إضافة دعم المترجمات المحلية (localRunner) مع MinGW في مسار `C:\mingw64`
- [x] إضافة runner ذكي يختار Docker أو Local تلقائياً
- [x] إصلاح دعم ملفات متعددة في الترجمة المحلية
- [x] تحسين CSS للعرض الأنيق
- [x] تحسين شكل زر تبديل اللغة (دائري أنيق)
- [x] تغيير امتداد الملف تلقائياً عند اختيار لغة البرمجة
- [x] جعل اسم الملف قابل للتعديل جزئياً - فقط قبل الامتداد، الامتداد غير قابل للتعديل
- [x] إصلاح منطق اختيار لغة البرمجة للتشغيل صحيحاً
- [x] حذف خيار Auto
- [x] تغيير الكود الافتراضي حسب اللغة المختارة
- [x] حفظ لغة البرمجة المختارة في localStorage
- [x] إضافة دعم Tab للـ indentation (4 مسافات)
- [x] إضافة شريط تنقل عمودي لإدارة الملفات (إضافة/حذف/تعيين رئيسي)
- [x] تبديل شريط التنقل من الزاوية العلوية اليسرى
- [x] دعم 8 لغات للواجهة (عربي افتراضي): ar, en, tr, fr, de, es, nl, it
- [x] اختيار اللغة من قائمة منسدلة
- [x] تحسين مظهر dark/light mode ليصبح أكثر أناقة وتناسقاً
- [x] جعل اسم الملف قريباً من الامتداد مع توسع تلقائي للـinput
- [x] إزالة المسافة بين اسم الملف ونقطة الامتداد
- [x] منع الفراغ عند حذف اسم الملف (استبدال بقيمة افتراضية)
- [x] جعل مستطيل اسم الملف يتمدد ويتقلص حسب الطول
- [x] تحسين قابلية الاستخدام والنشر (جاهز للنشر على الإنترنت)

## [ORPHANS & PENDING]
- [ ] بناء صورة Docker (يحتاج Docker daemon متاح)
- [ ] تفعيل تظليل فعلي للنص في textarea (حالياً فئات جاهزة)

## [COMPLETED]
- [x] Dockerfile جاهز
- [x] Backend API جاهز مع دعم ملفات متعددة
- [x] Frontend حديث وجاهز
- [x] دعم C/C++/Python
- [x] عزل عبر Docker أو تشغيل محلي
- [x] UI محسّن مع اختيار اللغة وأقسام الإخراج/الأخطاء
- [x] مشروع جاهز للتشغيل على http://localhost:5173

## [VERIFIABLE GOALS]
- [x] يمكن اختيار لغة البرمجة
- [x] يمكن تشغيل C
- [x] يمكن تشغيل C++
- [x] يمكن تشغيل Python
- [x] يدعم ملفات متعددة
- [x] يعرض الأخطاء تحت النتيجة باللون الأحمر
- [x] الكلمات المفتاحية لها فئات تظليل جاهزة
- [x] يعمل بدون Docker عبر MinGW المحلي
