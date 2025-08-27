import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { google } from 'googleapis';

const app = express();

// ===== الإعدادات من المتغيرات =====
const PORT = process.env.PORT || 3000;
const SHEET_ID = process.env.SHEET_ID;                      // مثال: 1XwBsrIo8ZlPp0vBzNoMvBk3c-VEZdrG-pe0WXg5Oo0g
const SHEET_TAB = process.env.SHEET_TAB || 'Registration';   // اسم ورقة التسجيل
const BOT_TOKEN = process.env.BOT_TOKEN || '';               // للتحقق من Telegram WebApp initData (اختياري لكنه مُستحسن)

// خدمة الحساب (Service Account) كـ JSON-string في متغير بيئة
// شارِك ملف Google Sheet مع الإيميل: <service-account-email>@<project>.iam.gserviceaccount.com
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!SHEET_ID || !SERVICE_ACCOUNT_JSON) {
  console.error('SHEET_ID و GOOGLE_SERVICE_ACCOUNT_JSON مطلوبة.');
  process.exit(1);
}

const serviceAccount = JSON.parse(SERVICE_ACCOUNT_JSON);
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  undefined,
  serviceAccount.private_key,
  scopes
);
const sheets = google.sheets({ version: 'v4', auth });

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// ===== التحقق الاختياري من صحة initData القادمة من Telegram WebApp =====
function verifyTelegramInitData(initData) {
  if (!BOT_TOKEN) return true; // تخطَّ التحقق إذا لم يضبط BOT_TOKEN
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash') || '';
    urlParams.delete('hash');

    const data = [...urlParams.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('\n');

    const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calcHash = crypto.createHmac('sha256', secret).update(data).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calcHash, 'hex'));
  } catch {
    return false;
  }
}

// ===== أدوات Sheets =====
const RANGE_READ = `${SHEET_TAB}!A:E`; // Status | Student_Name | Class | telegram_id | Registration_Date

async function findByTelegramId(telegramId) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE_READ
  });
  const rows = res.data.values || [];
  if (rows.length === 0) return null;

  const header = rows[0]; // العناوين
  const idxStatus = header.indexOf('Status');
  const idxName = header.indexOf('Student_Name');
  const idxClass = header.indexOf('Class');
  const idxTg = header.indexOf('telegram_id');
  const idxDate = header.indexOf('Registration_Date');

  if (idxTg === -1) {
    throw new Error('لم يتم العثور على عمود telegram_id في ورقة التسجيل.');
  }

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const tgCell = (r[idxTg] || '').toString().trim();
    if (tgCell === telegramId) {
      return {
        rowNumber: i + 1, // 1-based
        Status: idxStatus >= 0 ? (r[idxStatus] || '') : '',
        name: idxName >= 0 ? (r[idxName] || '') : '',
        class: idxClass >= 0 ? (r[idxClass] || '') : '',
        telegram_id: tgCell,
        registered_at: idxDate >= 0 ? (r[idxDate] || '') : ''
      };
    }
  }
  return null;
}

async function appendRegistration({ name, klass, telegram_id, dateISO }) {
  const values = [
    ['registered', name, klass, telegram_id, dateISO]
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: SHEET_TAB,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  });
}

// ===== API =====

// فحص حالة التسجيل
app.get('/api/status', async (req, res) => {
  try {
    const tgId = (req.query.telegram_id || '').toString().trim();
    if (!tgId) return res.status(400).json({ error: 'telegram_id مطلوب' });

    const exists = await findByTelegramId(tgId);
    return res.json({ exists: !!exists, row: exists || null });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'internal_error' });
  }
});

// تسجيل
app.post('/api/register', async (req, res) => {
  try {
    const { name, klass, telegram_id, initData } = req.body || {};

    if (!telegram_id || !name || !klass) {
      return res.status(400).json({ error: 'name/klass/telegram_id مطلوبة' });
    }

    // تحقق اختياري من initData
    if (initData && !verifyTelegramInitData(initData)) {
      return res.status(403).json({ error: 'initData غير صالح' });
    }

    const existing = await findByTelegramId(telegram_id.toString());
    if (existing) {
      return res.json({ status: 'exists', row: existing });
    }

    const dateISO = new Date().toISOString();
    await appendRegistration({
      name: name.toString().trim(),
      klass: klass.toString().trim(),
      telegram_id: telegram_id.toString().trim(),
      dateISO
    });

    return res.json({ status: 'ok' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'internal_error' });
  }
});

app.get('/health', (_, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`listening on :${PORT}`);
});
