// إعداد الكلمات والألوان
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر": "#ff3b30",
    "أزرق": "#007aff",
    "أخضر": "#4cd964",
    "أصفر": "#ffeb3b",
    "برتقالي": "#ff9500"
};

const TOTAL = 40;

let current = 0;
let correct = 0;
let wrong = 0;

let trialStart;
let trialData = [];

let studentName = "";

// عناصر الصفحة (مطابقة للـ HTML)
const startScreen = document.getElementById("start-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");

const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");
const timerEl = document.getElementById("timer");

// رابط Google Script
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwrhHBMHIQXOV7G77daUx88q-FPhP3e3K85ZyoGfqixHE9ZS84DF2Ymhf4wSmRWuUCliQ/exec";


// بدء الاختبار
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    if (!studentName) {
        alert("يرجى كتابة اسم الطالب");
        return;
    }

    startScreen.style.display = "none";
    testContainer.style.display = "block";

    newTrial();
};


// بطاقة جديدة
function newTrial() {
    current++;
    if (current > TOTAL) {
        finishTest();
        return;
    }

    counterEl.textContent = `${current} / ${TOTAL}`;

    let word = pickRandom(words);
    let ink = pickRandom(words.filter(c => c !== word));

    wordEl.textContent = word;
    wordEl.style.color = colorsHex[ink];
    document.body.style.background = colorsHex[ink];

    wordEl.dataset.word = word;
    wordEl.dataset.ink = ink;

    trialStart = performance.now();
}


// ضغط زر
document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        let answer = btn.dataset.color;
        let correctInk = wordEl.dataset.ink;

        let reaction = Math.round(performance.now() - trialStart);

        let isCorrect = (answer === correctInk);
        if (isCorrect) correct++; else wrong++;

        trialData.push({
            word: wordEl.dataset.word,
            ink: correctInk,
            answer: answer,
            rt: reaction,
            correct: isCorrect ? 1 : 0
        });

        newTrial();
    };
});


// إنهاء الاختبار
function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display = "block";

    let totalTime = trialData.reduce((a, b) => a + b.rt, 0);
    let avgTime = Math.round(totalTime / trialData.length);

    document.getElementById("result-name").textContent = "الاسم: " + studentName;
    document.getElementById("result-correct").textContent = "الإجابات الصحيحة: " + correct;
    document.getElementById("result-wrong").textContent = "الأخطاء: " + wrong;
    document.getElementById("result-time").textContent = "الزمن الكلي: " + totalTime + " مللي ثانية";
    document.getElementById("result-avg").textContent = "متوسط الزمن: " + avgTime + " مللي ثانية";

    sendToSheet(totalTime, avgTime);
}


// إرسال البيانات
function sendToSheet(total, avg) {
    let payload = {
        student: studentName,
        correct: correct,
        wrong: wrong,
        totalTime: total,
        avgTime: avg,
        trials: trialData
    };

    fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
    });
}


// اختيار عشوائي
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


// مؤقت حي
setInterval(() => {
    if (testContainer.style.display === "block") {
        let elapsed = performance.now() - trialStart;
        timerEl.textContent = (elapsed / 1000).toFixed(2) + " ثانية";
    }
}, 100);
