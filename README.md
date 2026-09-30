# داشبورد عملیات (نسخهٔ GitHub Pages)

این مخزن نسخهٔ مستقل داشبورد کارخانه است که به‌جای Claude Artifact، از طریق **GitHub Pages** میزبانی می‌شود و برای همگام‌سازی یادداشت‌ها/دستورات مدیریتی از **Firebase Firestore** استفاده می‌کند — بدون نیاز به حساب کاربری در claude.ai برای هیچ‌کدام از بازدیدکننده‌ها.

## وضعیت فعلی
- فایل `index.html` آمادهٔ انتشار است؛ همهٔ تب‌ها (نمای مدیریتی، انبار، برنامه‌ریزی تولید، سفارشات کار، سیستم‌ها) و پاپ‌آپ‌های جزئیات کار می‌کنند.
- بخش «یادداشت‌های مدیریت» در کد وجود دارد اما تا وقتی پیکربندی Firebase (`firebaseConfig` در ابتدای تگ `<script>` اصلی، نزدیک بالای فایل) خالی باشد، غیرفعال می‌ماند و پیام «اتصال به دیتابیس برقرار نیست» نشان داده می‌شود — بقیهٔ داشبورد کاملاً کار می‌کند.

## گام ۱ — ساخت پروژهٔ Firebase (رایگان، حدود ۵ دقیقه)
1. به [console.firebase.google.com](https://console.firebase.google.com) بروید و با حساب گوگل وارد شوید.
2. «Add project» را بزنید، یک نام دلخواه بدهید (مثلاً `factory-dashboard`) و پروژه را بسازید (Google Analytics را می‌توانید غیرفعال بگذارید).
3. از منوی سمت چپ، **Build → Firestore Database** را باز کنید و «Create database» را بزنید.
   - حالت را روی **Production mode** بگذارید.
   - نزدیک‌ترین منطقه به ایران را انتخاب کنید (مثلاً `eur3` یا مشابه).
4. بعد از ساخته‌شدن پایگاه داده، به تب **Rules** بروید و محتوای زیر را جایگزین کنید، سپس Publish بزنید:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /notes/{noteId} {
         allow read: if true;
         allow create: if request.resource.data.text is string
                       && request.resource.data.text.size() < 2000
                       && request.resource.data.keys().hasOnly(['type','refId','refLabel','text','priority','author','created','resolved']);
         allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['resolved']);
         allow delete: if false;
       }
     }
   }
   ```

   این قوانین یعنی: همه می‌توانند یادداشت‌ها را بخوانند و یادداشت جدید اضافه کنند (فقط با فیلدهای مجاز)، اما فقط فیلد «بررسی شد» قابل تغییر است و چیزی قابل حذف نیست. **توجه امنیتی:** چون در این طرح از ورود/رمز عبور استفاده نشده، هر کسی که لینک سایت را داشته باشد می‌تواند یادداشت ثبت کند (نه اینکه داده‌های داشبورد را ببیند یا تغییر دهد — فقط جدول یادداشت‌ها). اگر لازم شد محدودتر شود (مثلاً با رمز عبور ساده یا Firebase Authentication)، بگویید تا اضافه کنم.

5. از منوی چرخ‌دنده (⚙️) بالای صفحه → **Project settings** → پایین صفحه بخش «Your apps» → آیکون `</>`  (Web) را بزنید، یک نام دلخواه بدهید و «Register app» را بزنید.
6. یک شیء `firebaseConfig` مثل این نمایش داده می‌شود:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "factory-dashboard-xxxx.firebaseapp.com",
     projectId: "factory-dashboard-xxxx",
     storageBucket: "factory-dashboard-xxxx.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

   این مقادیر را کپی کنید و برایم بفرستید (یا خودتان داخل `index.html` در همین مخزن، در بخش `// --- FIREBASE CONFIG ---` جایگزین کنید) — این‌ها شناسهٔ عمومی هستند نه رمز، مشکلی نیست در کد صفحه دیده شوند؛ امنیت واقعی را همان Rules بالا تأمین می‌کند.

## گام ۲ — فعال‌سازی GitHub Pages (یک‌بار، ۱۰ ثانیه)
1. در گیت‌هاب وارد این مخزن (`Moogledo/Dashboard`) شوید.
2. **Settings → Pages**.
3. زیر «Build and deployment» → «Source» را روی **Deploy from a branch** بگذارید، شاخه را `main` و پوشه را `/ (root)` انتخاب کنید → Save.
4. بعد از حدود یک دقیقه، آدرس داشبورد این‌طور خواهد بود:
   `https://moogledo.github.io/Dashboard/`

## نکتهٔ مهم دربارهٔ حریم خصوصی
این مخزن الان **عمومی (Public)** است، یعنی هر کسی که این آدرس را حدس بزند یا لینکش را داشته باشد می‌تواند کل داده‌های داشبورد (انبار، تولید، سفارشات) را ببیند — چون GitHub Pages صفحه را بدون هیچ ورود/رمزی در دسترس همه قرار می‌دهد. اگر این قابل قبول نیست، دو راه هست:
- مخزن را **Private** کنید — GitHub Pages روی پلن رایگان فقط برای مخازن عمومی کار می‌کند (برای Pages خصوصی به GitHub Pro/Team نیاز است).
- یا یک لایهٔ رمز عبور سادهٔ سمت کلاینت (یا احراز هویت واقعی با Firebase Authentication) به داشبورد اضافه کنیم — اگر بخواهید انجامش می‌دهم.

## به‌روزرسانی داشبورد در آینده
هر وقت داده‌ها یا کد عوض شود، کافی است فایل `index.html` این مخزن جایگزین شود و به شاخهٔ `main` پوش شود؛ GitHub Pages خودش ظرف چند ثانیه نسخهٔ جدید را منتشر می‌کند.
