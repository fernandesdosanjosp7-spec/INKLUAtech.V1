const colorDisplay = document.getElementById("colorDisplay");
const colorButtons = document.querySelectorAll(".color-button");
const colors = Array.from(colorButtons).map((button) => ({
    name: button.dataset.colorName || button.textContent.trim(),
    value: button.dataset.colorValue || "#ffffff"
}));

let currentTarget = null;
let questionStartedAt = Date.now();
let answeredQuestions = Number(window.InkluaGameProgress?.read?.()?.games?.cores?.attempts) || 0;
let isAnswerLocked = false;
let speechRequestId = 0;
let nextQuestionTimer = null;

const waitForSpeechVoices = (callback) => {
    if (!("speechSynthesis" in window) || window.speechSynthesis.getVoices().length > 0) {
        callback();
        return;
    }

    let didRun = false;
    const runOnce = () => {
        if (didRun) {
            return;
        }

        didRun = true;
        window.speechSynthesis.removeEventListener?.("voiceschanged", runOnce);
        callback();
    };

    window.speechSynthesis.addEventListener?.("voiceschanged", runOnce);
    window.setTimeout(runOnce, 500);
};

if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
}

const scheduleNextQuestion = (delay = 350) => {
    window.clearTimeout(nextQuestionTimer);
    nextQuestionTimer = window.setTimeout(renderQuestion, delay);
};

const speakColor = (colorName, onEnd, options = {}) => {
    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(`${colorName}.`, {
            rate: options.rate ?? 0.9,
            pitch: 1.16,
            interrupt: options.interrupt,
            onEnd
        });
        return;
    }

    if (!("speechSynthesis" in window)) {
        if (typeof onEnd === "function") {
            window.setTimeout(onEnd, 650);
        }
        return;
    }

    if (options.waitForVoices && window.speechSynthesis.getVoices().length === 0) {
        waitForSpeechVoices(() => speakColor(colorName, onEnd, { ...options, waitForVoices: false }));
        return;
    }

    speechRequestId += 1;
    const currentSpeechRequest = speechRequestId;
    let finished = false;
    const finishSpeech = () => {
        if (finished || currentSpeechRequest !== speechRequestId) {
            return;
        }

        finished = true;

        if (typeof onEnd === "function") {
            onEnd();
        }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = window.InkluaSpeech?.createUtterance(`${colorName}.`, { rate: 0.9 }) || new SpeechSynthesisUtterance(`${colorName}.`);
    utterance.lang = utterance.lang || "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1.16;
    utterance.onend = finishSpeech;
    utterance.onerror = utterance.onend;
    window.speechSynthesis.speak(utterance);

    if (typeof onEnd === "function") {
        const fallbackDelay = Math.max(900, String(colorName).length * 90);
        window.setTimeout(finishSpeech, fallbackDelay);
    }
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 6);
const getLevelColors = () => colors.slice(0, Math.min(6 + (getLevel() * 2), colors.length));

const renderQuestion = () => {
    window.clearTimeout(nextQuestionTimer);
    const levelColors = getLevelColors();
    currentTarget = shuffle(levelColors)[0] || colors[0];
    questionStartedAt = Date.now();
    isAnswerLocked = false;

    if (colorDisplay) {
        colorDisplay.innerHTML = `
            <span class="game-level-pill">Nivel ${getLevel()} - Pergunta ${(answeredQuestions % 5) + 1}/5</span>
            <strong>Encontre: ${currentTarget.name}</strong>
        `;
    }

    colorButtons.forEach((button) => {
        const isAvailable = levelColors.some((color) => color.name === button.dataset.colorName);
        button.hidden = !isAvailable;
        button.disabled = false;
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    speakColor(`Encontre ${currentTarget.name}`, null, { waitForVoices: true });
};

colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (isAnswerLocked) {
            return;
        }

        isAnswerLocked = true;
        const colorName = button.dataset.colorName || button.textContent.trim();
        const colorValue = button.dataset.colorValue || "#ffffff";
        const isCorrect = colorName === currentTarget?.name;

        colorButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        button.classList.add(isCorrect ? "is-correct" : "is-wrong");
        colorButtons.forEach((item) => {
            item.disabled = true;
        });

        const feedbackPhrase = window.InkluaFeedback
            ? (isCorrect ? window.InkluaFeedback.getPositivePhrase() : window.InkluaFeedback.getEncouragementPhrase())
            : (isCorrect ? "Voce acertou!" : "Boa tentativa, vamos continuar!");
        const feedbackDetail = isCorrect
            ? ""
            : `A cor era ${currentTarget?.name}.`;

        if (colorDisplay) {
            colorDisplay.innerHTML = `
                <span class="game-level-pill">Nivel ${getLevel()}</span>
                <span class="color-display__swatch" style="--color-swatch: ${colorValue}"></span>
                <strong>${feedbackPhrase}</strong>
            `;
            colorDisplay.classList.remove("is-celebrating");

            if (isCorrect) {
                window.requestAnimationFrame(() => colorDisplay.classList.add("is-celebrating"));
            }
        }

        window.InkluaGameProgress?.record("cores", {
            title: "Jogo das Cores",
            skill: "Reconhecimento de cores",
            item: currentTarget?.name || colorName,
            selected: colorName,
            question: `Encontre ${currentTarget?.name || colorName}`,
            correct: isCorrect,
            level: getLevel(),
            maxLevel: 6,
            totalItems: 30,
            responseTimeMs: Date.now() - questionStartedAt
        });

        answeredQuestions += 1;
        const finishFeedback = () => scheduleNextQuestion(isCorrect ? 650 : 1200);

        if (window.InkluaSpeech?.speak) {
            window.InkluaSpeech.speak(`${feedbackPhrase} ${feedbackDetail}`.trim(), {
                rate: 0.86,
                pitch: 1.16,
                interrupt: true,
                onEnd: finishFeedback
            });
            return;
        }

        speakColor(`${feedbackPhrase} ${feedbackDetail}`.trim(), finishFeedback, { interrupt: true, rate: 0.86 });
    });
});

renderQuestion();
