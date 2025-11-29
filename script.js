// إعدادات
const TOTAL_TRIALS = 40;

// الكلمات العربية
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];

// الألوان بالقيم الحقيقية
const colorMap = {
    "أحمر": "#e53935",
    "أزرق": "#1e88e5",
    "أخضر": "#43a047",
    "أصفر": "#fdd835",
    "برتقالي": "#fb8c00"
};

// متغيرات
let currentTrial = 0;
let startTime;
let reactionTimes = [];
let correctCount = 0;
let studentName = "";
let studentClass = "";
let currentCorrectColor = "";

// عناصر DOM
const startScreen = document.getElementById("start-screen");
const testScreen = document.getElementById("test-screen");
const endScreen = document.getElementById("end-screen");
const stimulus = document.getElementById("stimulus");
const trialCount = document.getElementById("trial-count");
const timer = document.getElementById("timer");
const summary = document.getElementById("summary");

// بدء الاختبار
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    studentClass = document.getElementById("student-class").value.trim();

    if (!studentName) {
        alert("الرجاء كتابة اسم الطالب");
        return;
    }

    startScreen.style.display = "none";
    testScreen.style.display = "block";

    nextTrial();
};

// تجربة جديدة
function nextTrial() {
    currentTrial++;
    trialCount.textContent = `${currentTrial} / ${TOTAL_TRIALS}`;

    if (currentTrial > TOTAL_TRIALS) {
        finishTest();
        return;
    }

    // اختيار نوع التجربة
    const isNeutral = Math.random() < 0.5;

    if (isNeutral) {
        stimulus.textContent = "XXXXX";
        currentCorrectColor = pickRandom(words);
    } else {
        const word = pickRandom(words);
        let inkColor = pickRandom(words.filter(w => w !== word));

        stimulus.textContent = word;
        currentCorrectColor = inkColor;
    }

    // تغيير لون الكلمة والخلفية
    const realColor = colorMap[currentCorrectColor];
    stimulus.style.color = realColor;
    document.body.style.background = realColor;

    startTime = performance.now();
}

// اختيار عشوائي
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// عند الضغط على زر اللون
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        let rt = performance.now() - startTime;
        let chosen = btn.dataset.color;

        reactionTimes.push({
            trial: currentTrial,
            rt: rt,
            correct: chosen === currentCorrectColor,
            condition: stimulus.textContent === "XXXXX" ? "Neutral" : "Incongruent",
            word: stimulus.textContent,
            ink: currentCorrectColor
        });

        if (chosen === currentCorrectColor) correctCount++;

        nextTrial();
    });
});

// إنهاء الاختبار
function finishTest() {
    testScreen.style.display = "none";
    endScreen.style.display = "block";

    let avg = reactionTimes.reduce((a, b) => a + b.rt, 0) / reactionTimes.length;

    summary.innerHTML = `
        الاسم: ${studentName}<br>
        الصف: ${studentClass}<br><br>
        عدد الإجابات الصحيحة: ${correctCount}<br>
        عدد الأخطاء: ${TOTAL_TRIALS - correctCount}<br>
        الزمن المتوسط: ${avg.toFixed(2)} مللي ثانية
    `;

    sendToSheet(reactionTimes);
}

// إرسال النتائج إلى Google Sheet
function sendToSheet(data) {
    fetch("YOUR_WEB_APP_LINK_HERE", {
        method: "POST",
        body: JSON.stringify({
            name: studentName,
            class: studentClass,
            results: data
        })
    });
}
