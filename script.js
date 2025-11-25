// script.js

let participantName = "";
let currentStage = 1; // 1 = متطابقة, 2 = غير متطابقة
let trialInStage = 0;

let currentWordIndex = null;
let currentColorIndex = null;
let trialStartTime = null;

const stats = {
  1: { correct: 0, incorrect: 0, totalRt: 0, trials: 0 },
  2: { correct: 0, incorrect: 0, totalRt: 0, trials: 0 }
};

document.addEventListener("DOMContentLoaded", () => {
  const screenStart = document.getElementById("screen-start");
  const screenTest = document.getElementById("screen-test");
  const screenEnd = document.getElementById("screen-end");

  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  const nameInput = document.getElementById("participant-name");

  const wordDisplay = document.getElementById("word-display");
  const colorButtonsContainer = document.getElementById("color-buttons");

  const stageLabel = document.getElementById("stage-label");
  const trialLabel = document.getElementById("trial-label");
  const timerLabel = document.getElementById("timer-label");
  const instructionText = document.getElementById("instruction-text");

  const stage1AccEl = document.getElementById("stage1-accuracy");
  const stage1RtEl = document.getElementById("stage1-rt");
  const stage2AccEl = document.getElementById("stage2-accuracy");
  const stage2RtEl = document.getElementById("stage2-rt");
  const stroopEffectEl = document.getElementById("stroop-effect");

  // توليد أزرار الألوان من CONFIG
  CONFIG.COLORS.forEach((color, index) => {
    const btn = document.createElement("button");
    btn.className = "color-btn";
    btn.textContent = color.name;
    btn.dataset.colorIndex = index;
    btn.addEventListener("click", () => handleResponse(index));
    colorButtonsContainer.appendChild(btn);
  });

  function showScreen(id) {
    [screenStart, screenTest, screenEnd].forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

  startBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert("الرجاء إدخال اسم الطالب أولاً.");
      return;
    }
    participantName = name;
    resetAll();
    showScreen("screen-test");
    startStage(1);
  });

  restartBtn.addEventListener("click", () => {
    resetAll();
    showScreen("screen-start");
  });

  function resetAll() {
    currentStage = 1;
    trialInStage = 0;
    stats[1] = { correct: 0, incorrect: 0, totalRt: 0, trials: 0 };
    stats[2] = { correct: 0, incorrect: 0, totalRt: 0, trials: 0 };
    trialStartTime = null;
    timerLabel.textContent = "الزمن: 0 ms";
  }

  function startStage(stage) {
    currentStage = stage;
    trialInStage = 0;

    if (stage === 1) {
      instructionText.textContent = "المرحلة 1: اختر اللون الحقيقي للكلمة (الكلمة واللون متطابقان).";
    } else {
      instructionText.textContent = "المرحلة 2: تجاهل معنى الكلمة، واختر لون الحبر فقط (الكلمة واللون غير متطابقين).";
    }

    nextTrial();
  }

  function nextTrial() {
    trialInStage++;

    const totalTrials = currentStage === 1 ? CONFIG.STAGE1_TRIALS : CONFIG.STAGE2_TRIALS;

    if (trialInStage > totalTrials) {
      // انتهاء المرحلة الحالية
      if (currentStage === 1) {
        // نبدأ المرحلة الثانية
        startStage(2);
        return;
      } else {
        // انتهاء المرحلتين
        finishTest();
        return;
      }
    }

    // تحديث الملصقات
    stageLabel.textContent = `المرحلة: ${currentStage}`;
    trialLabel.textContent = `المحاولة: ${trialInStage} / ${totalTrials}`;

    // اختيار كلمة ولون
    const wordIndex = getRandomInt(0, CONFIG.COLORS.length - 1);
    let colorIndex;

    if (currentStage === 1) {
      // متطابقة: نفس اللون
      colorIndex = wordIndex;
    } else {
      // غير متطابقة: لون مختلف
      const otherIndices = CONFIG.COLORS
        .map((_, i) => i)
        .filter(i => i !== wordIndex);
      colorIndex = otherIndices[getRandomInt(0, otherIndices.length - 1)];
    }

    currentWordIndex = wordIndex;
    currentColorIndex = colorIndex;

    const word = CONFIG.COLORS[wordIndex].name;
    const inkColor = CONFIG.COLORS[colorIndex].css;

    wordDisplay.textContent = word;
    wordDisplay.style.color = inkColor;

    // بدء زمن الاستجابة
    trialStartTime = performance.now();
    timerLabel.textContent = "الزمن: 0 ms";

    // تحديث المؤقّت (اختياري، عرض تقريبي)
    startTimerDisplay();
  }

  let timerInterval = null;
  function startTimerDisplay() {
    if (timerInterval) clearInterval(timerInterval);
    if (!trialStartTime) return;

    timerInterval = setInterval(() => {
      if (!trialStartTime) return;
      const now = performance.now();
      const rt = Math.round(now - trialStartTime);
      timerLabel.textContent = `الزمن: ${rt} ms`;
    }, 60);
  }

  function stopTimerDisplay() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function handleResponse(selectedColorIndex) {
    if (trialStartTime === null) {
      return; // لم يبدأ التايمر (حالة أمان)
    }

    const endTime = performance.now();
    const rt = Math.round(endTime - trialStartTime);
    stopTimerDisplay();

    const wordObj = CONFIG.COLORS[currentWordIndex];
    const inkObj = CONFIG.COLORS[currentColorIndex];
    const selectedObj = CONFIG.COLORS[selectedColorIndex];

    // في المرحلتين، الجواب الصحيح هو "لون الحبر"
    const isCorrect = (selectedColorIndex === currentColorIndex);

    const stageStat = stats[currentStage];
    stageStat.trials += 1;
    stageStat.totalRt += rt;
    if (isCorrect) stageStat.correct += 1;
    else stageStat.incorrect += 1;

    // إرسال البيانات إلى Google Sheets
    const payload = {
      participantName,
      stage: currentStage,
      trialNumber: trialInStage,
      word: wordObj.name,
      inkColor: inkObj.name,
      response: selectedObj.name,
      correct: isCorrect ? 1 : 0,
      reactionTimeMs: rt,
      datetime: new Date().toISOString(),
      userAgent: navigator.userAgent || ""
    };

    sendToGoogleSheet(payload);

    // الانتقال للمحاولة التالية بعد صغير جدًا
    setTimeout(() => {
      trialStartTime = null;
      nextTrial();
    }, 150);
  }

  function sendToGoogleSheet(data) {
    if (!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL.includes("PASTE_YOUR_WEB_APP_URL_HERE")) {
      console.warn("لم يتم ضبط رابط Google Script بعد.", data);
      return;
    }

    fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // عشان نتجنب مشاكل CORS
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).catch(err => {
      console.error("خطأ في الإرسال إلى Google Sheets:", err);
    });
  }

  function finishTest() {
    showScreen("screen-end");

    const s1 = stats[1];
    const s2 = stats[2];

    const avg1 = s1.trials ? s1.totalRt / s1.trials : 0;
    const avg2 = s2.trials ? s2.totalRt / s2.trials : 0;
    const effect = avg2 - avg1;

    const acc1 = s1.trials ? (s1.correct / s1.trials) * 100 : 0;
    const acc2 = s2.trials ? (s2.correct / s2.trials) * 100 : 0;

    stage1AccEl.textContent =
      `الصحيح: ${s1.correct} / ${s1.trials} (${acc1.toFixed(1)}%)`;
    stage1RtEl.textContent =
      `متوسط زمن الاستجابة: ${avg1.toFixed(1)} ملّي ثانية`;

    stage2AccEl.textContent =
      `الصحيح: ${s2.correct} / ${s2.trials} (${acc2.toFixed(1)}%)`;
    stage2RtEl.textContent =
      `متوسط زمن الاستجابة: ${avg2.toFixed(1)} ملّي ثانية`;

    stroopEffectEl.textContent =
      `Stroop Effect = ${effect.toFixed(1)} ملّي ثانية (المرحلة غير المتطابقة - المتطابقة)`;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
});
