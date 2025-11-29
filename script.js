const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];

const colorsHex = {
    "أحمر":    "#ff3b30",
    "أزرق":    "#007aff",
    "أخضر":    "#4cd964",
    "أصفر":    "#ffeb3b",
    "برتقالي":"#ff9500"
};

const TOTAL = 40;

let current = 0;
let correct = 0;
let wrong = 0;
let startTime;
let reactionTimes = [];
let studentName = "";

// عناصر الصفحة
const startScreen = document.getElementById("start-screen");
const testContainer = document.getElementById("test-container");
const endScreen = document.getElementById("end-screen");

const wordEl = document.getElementById("word");
const counterEl = document.getElementById("counter");
const timerEl = document.getElementById("timer");

// بدء الاختبار
document.getElementById("start-btn").onclick = () => {
    studentName = document.getElementById("student-name").value.trim();
    if (!studentName) {
        alert("يرجى كتابة اسم الطالب");
        return;
    }

    startScreen.style.display = "none";
    testContainer.style.display = "block";

    startTime = performance.now();
    newTrial();
};

function newTrial() {
    current++;

    if (current > TOTAL) {
        finishTest();
        return;
    }

    counterEl.textContent = `${current} / ${TOTAL}`;

    // اختيار كلمة و لون خط مختلف
    let word = pickRandom(words);
    let ink = pickRandom(words.filter(c => c !== word));

    wordEl.textContent = word;
    wordEl.style.color = colorsHex[ink];
    document.body.style.background = colorsHex[ink];

    wordEl.dataset.correct = ink;
}

document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        let answer = btn.dataset.color;
        let correctColor = wordEl.dataset.correct;

        let now = performance.now();
        reactionTimes.push(now - startTime);
        startTime = now;

        if (answer === correctColor) correct++;
        else wrong++;

        newTrial();
    };
});

function finishTest() {
    testContainer.style.display = "none";
    endScreen.style.display = "block";

    let totalTime = reactionTimes.reduce((a,b) => a+b, 0);
    let avgTime = totalTime / reactionTimes.length;

    document.getElementById("result-name").innerHTML   = "الاسم: " + studentName;
    document.getElementById("result-correct").innerHTML = "الإجابات الصحيحة: " + correct;
    document.getElementById("result-wrong").innerHTML   = "الأخطاء: " + wrong;
    document.getElementById("result-time").innerHTML    = "الزمن الكلي: " + totalTime.toFixed(0) + " مللي ثانية";
    document.getElementById("result-avg").innerHTML     = "متوسط الزمن: " + avgTime.toFixed(0) + " مللي ثانية";
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// مؤقت الشاشة (يعمل كل 100ms)
setInterval(() => {
    if (startScreen.style.display === "none" && testContainer.style.display === "block") {
        let t = (performance.now() - startTime) / 1000;
        timerEl.textContent = t.toFixed(2) + " ثانية";
    }
}, 100);
