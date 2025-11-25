let studentName = "";
let currentStage = 0; // 1 أو 2

// إحصائيات المرحلة الأولى
let s1_trials = 0;
let s1_correct = 0;
let s1_wrong = 0;
let s1_times = [];

// إحصائيات المرحلة الثانية
let s2_trials = 0;
let s2_correct = 0;
let s2_wrong = 0;
let s2_times = [];

// متغيرات الحالة الحالية
let currentWord = "";
let currentInk = "";
let reactionStart = null;

// المؤقت للمرحلة الثانية
let stage2Remaining = 0;
let stage2Interval = null;

// عناصر DOM
const startScreen   = document.getElementById("startScreen");
const testScreen    = document.getElementById("testScreen");
const resultScreen  = document.getElementById("resultScreen");
const wordCard      = document.getElementById("wordCard");
const buttonsBox    = document.getElementById("buttonsContainer");
const stageTitleEl  = document.getElementById("stageTitle");
const timerBox      = document.getElementById("timerBox");
const instructionEl = document.getElementById("instructionText");
const endStageBtn   = document.getElementById("endStageBtn");

// إنشاء أزرار الألوان مرة واحدة
function setupButtons() {
  let html = "";
  CONFIG.colors.forEach(c => {
    html += `<button class="colorButton" style="background:${c.code}" onclick="submitAnswer('${c.code}')"></button>`;
  });
  buttonsBox.innerHTML = html;
}

// بدء المرحلة الأولى
function startStage1() {
  const nameInput = document.getElementById("studentName");
  studentName = nameInput.value.trim();

  if (!studentName) {
    alert("الرجاء إدخال اسم الطالب أولاً.");
    return;
  }

  currentStage = 1;
  s1_trials = s1_correct = s1_wrong = 0;
  s1_times = [];

  startScreen.style.display = "none";
  testScreen.style.display = "block";
  resultScreen.style.display = "none";

  stageTitleEl.textContent = "المرحلة الأولى: كلمة مطابقة للون";
  instructionEl.textContent =
    "في هذه المرحلة تكون الكلمة مكتوبة بلون يطابق معناها (مثال: كلمة \"أحمر\" باللون الأحمر). مهمتك أن تختار بطاقة اللون المطابقة للون الحبر الظاهر.";

  timerBox.textContent = "";
  endStageBtn.style.display = "block";

  setupButtons();
  createStage1Trial();
}

// توليد محاولة جديدة في المرحلة الأولى
function createStage1Trial() {
  if (s1_trials >= CONFIG.stage1_trials) {
    // انتهت المحاولات، نطلب من الطالب الضغط على زر إنهاء
    wordCard.textContent = "انتهت محاولات هذه المرحلة.\nاضغط زر \"إنهاء المرحلة\" للانتقال للمرحلة الثانية.";
    wordCard.style.color = "#111827";
    reactionStart = null;
    return;
  }

  s1_trials++;
  const colorObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

  currentWord = colorObj.name;
  currentInk  = colorObj.code;

  wordCard.textContent = currentWord;
  wordCard.style.color = currentInk;

  reactionStart = performance.now();
}

// إنهاء المرحلة الأولى والانتقال للثانية
function endStage() {
  if (currentStage !== 1) return;
  startStage2();
}

// بدء المرحلة الثانية
function startStage2() {
  currentStage = 2;
  s2_trials = s2_correct = s2_wrong = 0;
  s2_times = [];

  stageTitleEl.textContent = "المرحلة الثانية: كلمة غير مطابقة للون";
  instructionEl.textContent =
    "في هذه المرحلة يكون لون الحبر مختلفًا عن معنى الكلمة (مثال: كلمة \"أحمر\" مكتوبة باللون الأخضر). ركّز فقط على لون الحبر واضغط على بطاقة اللون الصحيحة، وتجاهل معنى الكلمة.";

  endStageBtn.style.display = "none";

  stage2Remaining = CONFIG.stage2_time;
  timerBox.textContent = stage2Remaining + " ثانية";

  if (stage2Interval) clearInterval(stage2Interval);
  stage2Interval = setInterval(() => {
    stage2Remaining--;
    if (stage2Remaining <= 0) {
      timerBox.textContent = "0 ثانية";
      clearInterval(stage2Interval);
      stage2Interval = null;
      finishTest();
    } else {
      timerBox.textContent = stage2Remaining + " ثانية";
    }
  }, 1000);

  setupButtons();
  createStage2Trial();
}

// توليد مثير جديد في المرحلة الثانية (غير متطابق)
function createStage2Trial() {
  if (stage2Remaining <= 0) {
    finishTest();
    return;
  }

  s2_trials++;

  let wordObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
  let inkObj  = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

  // نضمن أن اللون لا يطابق معنى الكلمة
  while (inkObj.code === wordObj.code) {
    inkObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
  }

  currentWord = wordObj.name;
  currentInk  = inkObj.code;

  wordCard.textContent = currentWord;
  wordCard.style.color = currentInk;

  reactionStart = performance.now();
}

// الضغط على بطاقة اللون (للمرحلتين)
function submitAnswer(selectedColor) {
  if (!reactionStart || !currentStage) return;

  const rt = Math.round(performance.now() - reactionStart);
  const correct = selectedColor === currentInk ? 1 : 0;

  // إرسال محاولة واحدة إلى Google Sheet
  sendTrial({
    participantName: studentName,
    word: currentWord,
    inkColor: currentInk,
    response: selectedColor,
    correct: correct,
    reactionTimeMs: rt,
    userAgent: navigator.userAgent
  });

  if (currentStage === 1) {
    if (correct) s1_correct++; else s1_wrong++;
    s1_times.push(rt);
    createStage1Trial();
  } else if (currentStage === 2) {
    if (correct) s2_correct++; else s2_wrong++;
    s2_times.push(rt);
    createStage2Trial(); // ← هنا التصحيح: توليد مثير جديد بعد كل إجابة
  }

  reactionStart = null;
}

// إنهاء الاختبار بالكامل وحساب النتائج
function finishTest() {
  currentStage = 0;
  testScreen.style.display = "none";
  resultScreen.style.display = "block";

  const s1_avg = s1_times.length ? s1_times.reduce((a,b)=>a+b,0) / s1_times.length : 0;
  const s2_avg = s2_times.length ? s2_times.reduce((a,b)=>a+b,0) / s2_times.length : 0;
  const stroop = s2_avg - s1_avg;

  const html = `
    <p>المرحلة الأولى (مطابقة اللون): صحيح ${s1_correct} ، خطأ ${s1_wrong} ، متوسط زمن الاستجابة = ${s1_avg.toFixed(1)} مللي ثانية.</p>
    <p>المرحلة الثانية (عدم تطابق اللون): صحيح ${s2_correct} ، خطأ ${s2_wrong} ، متوسط زمن الاستجابة = ${s2_avg.toFixed(1)} مللي ثانية.</p>
    <h3>تأثير ستروب = ${stroop.toFixed(1)} مللي ثانية (متوسط زمن المرحلة الثانية - الأولى).</h3>
  `;
  document.getElementById("resultsBox").innerHTML = html;

  // إرسال النتائج النهائية
  sendFinalResults({
    participantName: studentName,
    s1_correct,
    s1_wrong,
    s1_avgRt: Number(s1_avg.toFixed(1)),
    s2_correct,
    s2_wrong,
    s2_avgRt: Number(s2_avg.toFixed(1)),
    stroopEffect: Number(stroop.toFixed(1)),
    userAgent: navigator.userAgent
  });
}

// إرسال محاولة واحدة
function sendTrial(data) {
  fetch(CONFIG.scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(err => console.error("Trial send error:", err));
}

// إرسال النتائج النهائية
function sendFinalResults(finalResults) {
  fetch(CONFIG.scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ finalResults })
  }).catch(err => console.error("Final send error:", err));
}

// إعادة الاختبار
function restart() {
  location.reload();
}
