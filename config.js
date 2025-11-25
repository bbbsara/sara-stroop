// config.js

const CONFIG = {
  // الألوان القياسية لاختبار ستروب
  COLORS: [
    { label: "أحمر",  code: "#FF0000" },
    { label: "أخضر",  code: "#00A000" },
    { label: "أزرق",  code: "#0000FF" },
    { label: "أصفر",  code: "#FFFF00" },
    { label: "أسود",  code: "#000000" }
  ],

  // عدد محاولات المرحلة الأولى (متطابقة)
  STAGE1_TRIALS: 10,

  // زمن المرحلة الثانية (غير متطابقة) بالثواني
  STAGE2_DURATION_SEC: 45,

  // رابط الويب آب لـ Google Apps Script
  // استبدلي هذا الرابط برابط الويب-آب الحقيقي عندك
  SCRIPT_URL: "https://script.google.com/macros/s/PASTE_YOUR_WEB_APP_URL_HERE/exec"
};
