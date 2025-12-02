// =======================
// إعداد الكلمات والألوان
// =======================
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];

const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقالي": "#ff9500"
};

// عدد المحاولات الكلي
const TOTAL = 40;

// متغيّرات حالة الاختبار
let current = 0;
let correct = 0;
let wrong = 0;

let trialStart;
let trialData = [];

let studentName = "";

// عناصر الصفحة
const startScreen   = document.getElementById("start-screen");
const testContainer = document.getElementById("test-container");
const endScreen     = document.getElementById("end-screen");

const wordEl    = document.getElementById("word");
const counterEl = document.getElementById("counter");
const timerEl   = document.getElementById("timer");

// =======================
// رابط Google Apps Script
// =======================

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbypwGjMqJx2lT_L7wbPcuuj6_UShdCR1kPhG045lW4HvQScuNl4NiHcSGihZYgYNMEG/exec";


// =======================
// بدء الاختبار
// =======================

document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    if (!studentName) {
        alert("يرجى كتابة اسم الطالب");
        return;
    }

    startScreen.style.display   = "none";
    testContainer.style.display = "block";

    current     = 0;
    correct     = 0;
    wrong       = 0;
    trialData   = [];

    newTrial();
};


// =======================
// إنشاء بطاقة جديدة
// =======================

function newTrial() {
    current++;
    if (current > TOTAL) {
        finishTest();
        return;
    }

    // تحديث العداد  (المحاولة الحالية / الإجمالي)
    counterEl.textContent = `${current} / ${TOTAL}`;

    // اختيار كلمة و لون حبر مختلف عنها
    const word = pickRandom(words);
    const ink  = pickRandom(words.filter(c => c !== word));

    wordEl.textContent   = word;
    wordEl.style.color   = colorsHex[ink];
    document.body.style.background = colorsHex[ink];

    wordEl.dataset.word = word;
    wordEl.dataset.ink  = ink;

    trialStart = performance.now();
}


// =======================
// التعامل مع ضغط الأزرار
// =======================

document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        const answer    = btn.dataset.color;
        const correctInk = wordEl.dataset.ink;

        const reaction = Math.round(performance.now() - trialStart);

        const isCorrect = (answer === correctInk);
        if (isCorrect) {
            correct++;
        } else {
            wrong++;
        }

        trialData.push({
            word:   wordEl.dataset.word,
            ink:    correctInk,
            answer: answer,
            rt:     reaction,
            correct: isCorrect ? 1 : 0
        });

        newTrial();
    };
});


// =======================
// إنهاء الاختبار وإظهار النتيجة
// =======================

function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display     = "block";

    const totalTime = trialData.reduce((a, b) => a + b.rt, 0);
    const avgTime   = Math.round(totalTime / trialData.length);

    document.getElementById("result-name").textContent    = "الاسم: " + studentName;
    document.getElementById("result-correct").textContent = "الإجابات الصحيحة: " + correct;
    document.getElementById("result-wrong").textContent   = "الأخطاء: " + wrong;
    document.getElementById("result-time").textContent    = "الزمن الكلي: " + totalTime + " مللي ثانية";
    document.getElementById("result-avg").textContent     = "متوسط الزمن: " + avgTime + " مللي ثانية";

    // إرسال البيانات إلى Google Sheet
    sendToSheet(totalTime, avgTime);
}


// =======================
// إرسال البيانات إلى Google Sheets
// =======================

function sendToSheet(total, avg) {
    const form = new FormData();

    form.append("student",    studentName);
    form.append("correct",    String(correct));
    form.append("wrong",      String(wrong));
    form.append("totalTime",  String(total));
    form.append("avgTime",    String(avg));
    form.append("trials",     JSON.stringify(trialData));

    fetch(SHEET_URL, {
        method: "POST",
        body: form
    })
    .then(r => r.text())
    .then(txt => {
        console.log("Google Script response:", txt);
        // لا نستخدم alert هنا حتى لا نغيّر سلوك الواجهة
    })
    .catch(err => {
        console.error("خطأ أثناء الإرسال إلى Google Sheet:", err);
    });
}


// =======================
// دوال مساعدة
// =======================

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// مؤقت حي لعرض الزمن الحالي للمحاولة
setInterval(() => {
    if (testContainer.style.display === "block" && trialStart) {
        const elapsed = performance.now() - trialStart;
        timerEl.textContent = (elapsed / 1000).toFixed(2) + " ثانية";
    }
}, 100);
