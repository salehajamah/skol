# تطبيق تسجيل الطالبات - Telegram Mini App

تطبيق ويب صغير يعمل داخل Telegram لتسجيل الطالبات في Google Sheets.

## الملفات

```
/miniapp
  ├─ package.json         # إعدادات المشروع والتبعيات
  ├─ server.js           # خادم Express.js
  ├─ .env               # متغيرات البيئة (محلي فقط)
  └─ public/
      └─ index.html     # واجهة Mini App
```

## المميزات

- تسجيل الطالبات بالاسم الثلاثي والصف (1-6)
- حفظ البيانات في Google Sheets
- منع التسجيل المتكرر
- واجهة عربية متجاوبة مع ثيم Telegram
- إغلاق تلقائي بعد التسجيل
- تحقق اختياري من صحة بيانات Telegram

## الإعداد

### 1. Google Sheets

1. أنشئ ملف Google Sheets جديد
2. أنشئ ورقة باسم "التسجيل" مع العناوين التالية في الصف الأول:
   ```
   Status | اسم الطالبة | الصف | telegram_id | تاريخ التسجيل
   ```

### 2. Google Service Account

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو استخدم موجود
3. فعّل Google Sheets API
4. أنشئ Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - أدخل اسم وصف
   - لا تعطِ أدوار إضافية
5. أنشئ مفتاح JSON:
   - انقر على Service Account → Keys → Add Key → Create New Key → JSON
6. شارك Google Sheet مع إيميل Service Account

### 3. Telegram Bot

1. أنشئ بوت جديد عبر [@BotFather](https://t.me/BotFather)
2. استخدم الأوامر:
   ```
   /newbot
   اسم البوت
   username_bot
   ```
3. احفظ توكن البوت
4. اضبط Mini App URL:
   ```
   /newapp
   اختر البوت
   اسم التطبيق
   وصف مختصر
   رفع صورة (512x512)
   Web App URL: https://your-app.onrender.com/
   ```

### 4. متغيرات البيئة

في Render Dashboard أو ملف `.env` المحلي:

```env
SHEET_ID=1XwBsrIo8ZlPp0vBzNoMvBk3c-VEZdrG-pe0WXg5Oo0g
SHEET_TAB=التسجيل
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
PORT=3000
```

## التشغيل المحلي

```bash
# تثبيت التبعيات
npm install

# تشغيل الخادم
npm run dev

# أو
npm start
```

الخادم سيعمل على http://localhost:3000

## النشر على Render

1. ارفع الكود إلى GitHub repository
2. أنشئ Web Service جديد في Render
3. اربط الـ repository
4. اضبط المتغيرات في Environment Variables
5. انشر

## استخدام التطبيق

1. افتح البوت في Telegram
2. انقر على قائمة البوت أو اكتب `/start`
3. انقر على "فتح التطبيق" أو زر Mini App
4. أدخل الاسم الثلاثي واختر الصف
5. انقر "تسجيل"

## API Endpoints

- `GET /api/status?telegram_id=123` - فحص حالة التسجيل
- `POST /api/register` - تسجيل جديد
- `GET /health` - فحص صحة الخادم

## الأمان

- التحقق من initData القادم من Telegram (اختياري)
- منع التسجيل المتكرر
- حماية API من CORS
- تشفير الاتصالات عبر HTTPS

## استكشاف الأخطاء

### "لم يتم العثور على عمود telegram_id"
تأكد من أن ورقة Google Sheets تحتوي على العناوين الصحيحة.

### "تعذر قراءة Telegram ID"
تأكد من فتح التطبيق من داخل Telegram وليس المتصفح مباشرة.

### "initData غير صالح"
تحقق من صحة BOT_TOKEN أو عطّل التحقق بحذف المتغير.

### خطأ 403 من Google Sheets
تأكد من مشاركة الملف مع إيميل Service Account.
