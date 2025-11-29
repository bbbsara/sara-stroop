// إعداد الألوان والكلمات
const words = ["أحمر", "أزرق", "أخضر", "أصفر", "برتقالي"];
const colorsHex = {
    "أحمر":    "#ff3b30",
    "أزرق":    "#007aff",
    "أخضر":    "#4cd964",
    "أصفر":    "#ffeb3b",
    "برتقالي":"#ff9500"
};

const TOTAL = 40;

let currentTrial = 0;
let correctCount = 0;
let wrongCount = 0;

let trialData = [];  // لتخزين كل البطاقات
let trialStartTime;

let studentName = "";

// عناصر DOM
const startScreen  = document.getElementById("start-screen");
const testScreen   = document.getElementById("test-screen");
const endScreen    = document.getElementById("end-screen");

const wordEl   = document.getElementById("word");
const counterEl = document.getElementById("counter");
const timerEl   = document.getElementById("timer");

// رابط Google Apps Script Web App  
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwrhHBMHIQXOV7G77daUx88q-FPhP3e3K85ZyoGfqixHE9ZS84DF2Ymhf4wSmRWuUCliQ/exec";

// بدء الاختبار
document.getElementById("start-btn").onclick = () => {
  studentName = document.getElementById("student-name").value.trim();
  if (!studentName) {
    alert("اكتب اسمك");
    return;
  }
  startScreen.style.display = "none";
  testScreen.style.display  = "block";
  newTrial();
};

function newTrial() {
  currentTrial++;
  if (currentTrial > TOTAL) {
    finishTest();
    return;
  }

  counterEl.textContent = `${currentTrial} / ${TOTAL}`;

  const word = pickRandom(words);
  const ink  = pickRandom(words.filter(c => c !== word));

  wordEl.textContent = word;
  wordEl.style.color = colorsHex[ink];
  document.body.style.background = colorsHex[ink];

  wordEl.dataset.word = word;
  wordEl.dataset.ink  = ink;

  trialStartTime = performance.now();
}

// عند اختيار لون
document.querySelectorAll(".btn").forEach(btn => {
  btn.onclick = () => {
    const chosen = btn.dataset.color;
    const correctInk = wordEl.dataset.ink;

    const rt = Math.round(performance.now() - trialStartTime);

    const isCorrect = (chosen === correctInk);
    if (isCorrect) correctCount++;
    else wrongCount++;

    trialData.push({
      word:   wordEl.dataset.word,
      ink:    correctInk,
      answer: chosen,
      rt:     rt,
      correct: isCorrect ? 1 : 0
    });

    newTrial();
  };
});

function finishTest() {
  testScreen.style.display = "none";
  endScreen.style.display = "block";

  const totalTime = trialData.reduce((acc, t) => acc + t.rt, 0);
  const avgTime   = Math.round(totalTime / trialData.length);

  document.getElementById("result-name").textContent    = "الاسم: "         + studentName;
  document.getElementById("result-correct").textContent = "الإجابات الصحيحة: " + correctCount;
  document.getElementById("result-wrong").textContent   = "الأخطاء: "         + wrongCount;
  document.getElementById("result-total").textContent   = "الزمن الكلي: "     + totalTime + " مللي ثانية";
  document.getElementById("result-avg").textContent     = "متوسط الزمن: "     + avgTime + " مللي ثانية";

  sendToSheet();
}

function sendToSheet() {
  const payload = {
    student:   studentName,
    correct:   correctCount,
    wrong:     wrongCount,
    totalTime: trialData.reduce((a,b) => a + b.rt, 0),
    avgTime:   Math.round(trialData.reduce((a,b) => a + b.rt, 0) / trialData.length),
    trials:    trialData
  };

  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload)
  });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// مؤقت حي يظهر الزمن منذ ظهور الكلمة الحالية
setInterval(() => {
  if (testScreen.style.display === "block") {
    const elapsed = performance.now() - trialStartTime;
    timerEl.textContent = (elapsed/1000).toFixed(2) + " ثانية";
  }
}, 100);
