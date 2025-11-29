// الكلمات العربية
const words = {
    red: "أحمر",
    blue: "أزرق",
    green: "أخضر",
    yellow: "أصفر",
    orange: "برتقالي"
};

// خرائط الألوان للخلفية والخط
const colorsHex = {
    red: "#ff3b30",
    blue: "#007aff",
    green: "#4cd964",
    yellow: "#ffeb3b",
    orange: "#ff9500"
};

let trials = 40;
let current = 0;

// عناصر
const wordEl = document.getElementById("word");

// إنشاء تجربة جديدة
function newTrial() {
    current++;

    if (current > trials) {
        wordEl.textContent = "انتهى";
        document.body.style.background = "#333";
        return;
    }

    const allColors = Object.keys(words);

    const isNeutral = Math.random() < 0.5; // محايد أو غير متطابق؟

    if (isNeutral) {
        wordEl.textContent = "XXXXX";
        let ink = allColors[Math.floor(Math.random()*allColors.length)];
        wordEl.style.color = colorsHex[ink];
        document.body.style.background = colorsHex[ink];
        wordEl.dataset.correct = ink;

    } else {
        let wordColor = allColors[Math.floor(Math.random()*allColors.length)];
        let inkOptions = allColors.filter(c => c !== wordColor);
        let ink = inkOptions[Math.floor(Math.random()*inkOptions.length)];

        wordEl.textContent = words[wordColor];
        wordEl.style.color = colorsHex[ink];
        document.body.style.background = colorsHex[ink];
        wordEl.dataset.correct = ink;
    }
}

// عند الضغط على زر
document.querySelectorAll(".btn").forEach(btn => {
    btn.onclick = () => {
        let correct = wordEl.dataset.correct;
        let chosen = btn.dataset.color;

        // لو تريدين حفظ النتائج أضيفه الآن
        // console.log({correct, chosen});

        newTrial();
    };
});

// أول تجربة
newTrial();
