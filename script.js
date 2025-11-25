let studentName = "";
let stage = 1;
let trialCount = 0;

let s1_correct = 0;
let s1_wrong = 0;
let s1_times = [];

let s2_correct = 0;
let s2_wrong = 0;
let s2_times = [];

let reactionStart = 0;
let stage2Timer;

function startStage1() {
    studentName = document.getElementById("studentName").value.trim();

    if (studentName === "") {
        alert("الرجاء إدخال اسم الطالب.");
        return;
    }

    stage = 1;
    trialCount = 0;

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("testScreen").style.display = "block";

    document.getElementById("stageTitle").innerText = "المرحلة الأولى: كلمة مطابقة للون";

    setupButtons();
    nextTrial();
}

function setupButtons() {
    let html = "";
    CONFIG.colors.forEach(c => {
        html += `<button class="colorButton" style="background:${c.code}" onclick="submitAnswer('${c.code}')"></button>`;
    });
    document.getElementById("buttonsContainer").innerHTML = html;
}

function nextTrial() {
    if (stage === 1 && trialCount >= CONFIG.stage1_trials) {
        document.getElementById("endStageBtn").style.display = "block";
        return;
    }

    if (stage === 2) {
        return startStage2Timer();
    }

    trialCount++;

    let colorObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

    document.getElementById("wordCard").innerText = colorObj.name;
    document.getElementById("wordCard").style.color = colorObj.code;

    reactionStart = Date.now();
    currentWord = colorObj.name;
    currentInk = colorObj.code;
}

function submitAnswer(selectedColor) {
    let rt = Date.now() - reactionStart;
    let correct = selectedColor === currentInk ? 1 : 0;

    // ——— سجل المحاولة ———
    sendTrial({
        participantName: studentName,
        word: currentWord,
        inkColor: currentInk,
        response: selectedColor,
        correct: correct,
        reactionTimeMs: rt,
        userAgent: navigator.userAgent
    });

    if (stage === 1) {
        if (correct) s1_correct++; else s1_wrong++;
        s1_times.push(rt);
        nextTrial();
    } else {
        if (correct) s2_correct++; else s2_wrong++;
        s2_times.push(rt);
    }
}

function endStage() {
    stage = 2;
    document.getElementById("stageTitle").innerText = "المرحلة الثانية: كلمة غير مطابقة للون";
    trialCount = 0;
    startStage2Timer();
}

function startStage2Timer() {
    document.getElementById("timerBox").innerText = CONFIG.stage2_time;

    let timeLeft = CONFIG.stage2_time;

    stage2Timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timerBox").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(stage2Timer);
            finishTest();
        }

    }, 1000);

    generateIncongruentCard();
}

function generateIncongruentCard() {
    let wordObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    let inkObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

    while (inkObj.code === wordObj.code) {
        inkObj = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    }

    document.getElementById("wordCard").innerText = wordObj.name;
    document.getElementById("wordCard").style.color = inkObj.code;

    currentWord = wordObj.name;
    currentInk = inkObj.code;

    reactionStart = Date.now();
}

function finishTest() {
    document.getElementById("testScreen").style.display = "none";
    document.getElementById("resultScreen").style.display = "block";

    let s1_avg = Math.round(s1_times.reduce((a,b)=>a+b,0) / s1_times.length);
    let s2_avg = Math.round(s2_times.reduce((a,b)=>a+b,0) / s2_times.length);
    let stroop = s2_avg - s1_avg;

    let html = `
        <p>المرحلة 1: صحيح ${s1_correct} - خطأ ${s1_wrong} - متوسط ${s1_avg} مللي</p>
        <p>المرحلة 2: صحيح ${s2_correct} - خطأ ${s2_wrong} - متوسط ${s2_avg} مللي</p>
        <h3>تأثير ستروب: ${stroop} مللي ثانية</h3>
    `;

    document.getElementById("resultsBox").innerHTML = html;

    sendFinalResults({
        participantName: studentName,
        s1_correct,
        s1_wrong,
        s1_avgRt: s1_avg,
        s2_correct,
        s2_wrong,
        s2_avgRt: s2_avg,
        stroopEffect: stroop,
        userAgent: navigator.userAgent
    });
}

function sendTrial(data) {
    fetch(CONFIG.scriptURL, {
        method: "POST",
        body: JSON.stringify(data)
    });
}

function sendFinalResults(data) {
    fetch(CONFIG.scriptURL, {
        method: "POST",
        body: JSON.stringify({ finalResults: data })
    });
}

function restart() {
    location.reload();
}
