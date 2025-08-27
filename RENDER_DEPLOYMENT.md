# نشر التطبيق على Render

## الخطوات

### 1. رفع الكود إلى GitHub

1. أنشئ repository جديد على GitHub
2. ارفع ملفات المشروع (تأكد من وجود `.gitignore`)
3. **لا ترفع ملف `.env`** - سنضع المتغيرات في Render مباشرة

### 2. إنشاء Web Service على Render

1. اذهب إلى [Render.com](https://render.com/)
2. أنشئ حساب أو سجّل دخول
3. انقر "New" → "Web Service"
4. اربط GitHub account إذا لم يكن مربوط
5. اختر repository الذي أنشأته

### 3. إعداد Web Service

**إعدادات أساسية:**
- **Name**: `telegram-miniapp-register` (أو أي اسم تفضله)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**إعدادات متقدمة:**
- **Auto-Deploy**: Yes (نشر تلقائي عند تحديث GitHub)

### 4. إضافة متغيرات البيئة

في صفحة إعداد الخدمة، اذهب إلى "Environment Variables" وأضف:

```
SHEET_ID = 1XwBsrIo8ZlPp0vBzNoMvBk3c-VEZdrG-pe0WXg5Oo0g
SHEET_TAB = التسجيل
BOT_TOKEN = 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
GOOGLE_SERVICE_ACCOUNT_JSON = {"type":"service_account","project_id":"..."}
```

⚠️ **مهم**: 
- عند إضافة `GOOGLE_SERVICE_ACCOUNT_JSON`، انسخ محتوى ملف JSON **كاملاً** كسطر واحد
- تأكد من عدم وجود فراغات إضافية أو أسطر جديدة
- إذا واجهت مشاكل، يمكنك استخدام أدوات online لتحويل JSON إلى سطر واحد

### 5. النشر

1. انقر "Create Web Service"
2. انتظر انتهاء البناء والنشر (عادة 2-5 دقائق)
3. ستحصل على رابط مثل: `https://your-app-name.onrender.com`

### 6. اختبار التطبيق

1. افتح الرابط في المتصفح - يجب أن تظهر رسالة "تعذر قراءة Telegram ID"
2. تحقق من `/health` endpoint: `https://your-app-name.onrender.com/health`
3. جرّب API: `https://your-app-name.onrender.com/api/status?telegram_id=123`

### 7. ربط مع Telegram Bot

1. اذهب إلى [@BotFather](https://t.me/BotFather)
2. أرسل `/myapps`
3. اختر التطبيق الذي أنشأته سابقاً
4. حدّث Web App URL إلى رابط Render الجديد

## استكشاف الأخطاء

### فشل البناء (Build Failed)

**خطأ في package.json:**
```bash
npm ERR! missing script: start
```
- تأكد من وجود `"start": "node server.js"` في scripts

**خطأ في التبعيات:**
```bash
npm ERR! 404 package not found
```
- تأكد من صحة أسماء الحزم في `dependencies`

### فشل التشغيل (Deploy Failed)

**خطأ في متغيرات البيئة:**
```bash
SHEET_ID و GOOGLE_SERVICE_ACCOUNT_JSON مطلوبة
```
- تحقق من إضافة جميع متغيرات البيئة المطلوبة
- تأكد من صحة تنسيق JSON

**خطأ في Google Sheets:**
```bash
Error: The caller does not have permission
```
- تأكد من مشاركة Google Sheet مع Service Account email
- تحقق من صحة SHEET_ID

### مشاكل في الواجهة

**لا تظهر الصفحة:**
- تحقق من وجود ملف `public/index.html`
- تأكد من إعداد `app.use(express.static('public'))` في server.js

**خطأ CORS:**
- تأكد من إعداد `app.use(cors())` في server.js

## تحسينات الأداء

### 1. تفعيل Auto-Sleep Protection

Render يُسكن التطبيقات المجانية بعد عدم الاستخدام. لمنع ذلك:

1. استخدم خدمة ping مثل [UptimeRobot](https://uptimerobot.com/)
2. أو أضف cron job يستدعي `/health` كل 10 دقائق

### 2. إعداد Custom Domain (اختياري)

1. في إعدادات Render، اذهب إلى "Custom Domains"
2. أضف domain الخاص بك
3. حدّث DNS records حسب التعليمات

### 3. مراقبة الأداء

- راقب Logs في Render Dashboard
- استخدم `/health` endpoint للتحقق من حالة التطبيق
- راقب استهلاك الذاكرة والمعالج

## إعداد التحديثات التلقائية

عند تفعيل Auto-Deploy:
1. أي push إلى GitHub سيؤدي لإعادة نشر تلقائي
2. تأكد من اختبار التغييرات محلياً أولاً
3. استخدم branches للتطوير وmerge إلى main للنشر
