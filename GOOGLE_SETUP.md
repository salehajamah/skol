# إعداد Google Service Account

## الخطوات التفصيلية:

### 1. إنشاء مشروع في Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. انقر "Select a project" → "New Project"
3. أدخل اسم المشروع (مثل: "telegram-miniapp-sheets")
4. انقر "Create"

### 2. تفعيل Google Sheets API

1. في القائمة الجانبية: APIs & Services → Library
2. ابحث عن "Google Sheets API"
3. انقر عليه ثم انقر "Enable"

### 3. إنشاء Service Account

1. في القائمة الجانبية: IAM & Admin → Service Accounts
2. انقر "Create Service Account"
3. أدخل اسم (مثل: sheets-bot) ووصف
4. انقر "Create and Continue"
5. تخطَّ الأدوار (Grant this service account access to project)
6. انقر "Done"

### 4. إنشاء مفتاح JSON

1. في قائمة Service Accounts، انقر على الحساب الذي أنشأته
2. انتقل إلى تبويب "Keys"
3. انقر "Add Key" → "Create new key"
4. اختر "JSON" → "Create"
5. سيتم تنزيل ملف JSON - احفظه بأمان

### 5. نسخ محتوى JSON إلى متغير البيئة

افتح الملف المُنزّل وانسخ محتواه كاملاً إلى متغير `GOOGLE_SERVICE_ACCOUNT_JSON`.

مثال على التنسيق:
```json
{
  "type": "service_account",
  "project_id": "telegram-miniapp-sheets-123456",
  "private_key_id": "abcdef1234567890",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "sheets-bot@telegram-miniapp-sheets-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/sheets-bot%40telegram-miniapp-sheets-123456.iam.gserviceaccount.com"
}
```

⚠️ **هام**: عند نسخ JSON إلى Render، تأكد من نسخه كسطر واحد أو استخدم escape characters صحيحة.

### 6. مشاركة Google Sheet

1. افتح Google Sheets
2. أنشئ ملف جديد
3. أنشئ ورقة باسم "التسجيل"
4. أضف العناوين في الصف الأول:
   ```
   Status | اسم الطالبة | الصف | telegram_id | تاريخ التسجيل
   ```
5. انقر "Share" أو "مشاركة"
6. أضف الإيميل من `client_email` في ملف JSON
7. أعطه صلاحية "Editor"
8. انقر "Share"

### 7. الحصول على Sheet ID

من رابط Google Sheet:
```
https://docs.google.com/spreadsheets/d/1XwBsrIo8ZlPp0vBzNoMvBk3c-VEZdrG-pe0WXg5Oo0g/edit
```

`SHEET_ID` هو: `1XwBsrIo8ZlPp0vBzNoMvBk3c-VEZdrG-pe0WXg5Oo0g`
