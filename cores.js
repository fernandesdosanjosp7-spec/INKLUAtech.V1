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

const scheduleNextQuestion = (delay = 350) => {
    window.clearTimeout(nextQuestionTimer);
    nextQuestionTimer = window.setTimeout(renderQuestion, delay);
};

const speakColor = (colorName, onEnd) => {
    if (!("speechSynthesis" in window)) {
        if (typeof onEnd === "function") {
            window.setTimeout(onEnd, 650);
        }
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

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(`${colorName}.`, {
            rate: 0.78,
            pitch: 1.16,
            onEnd: finishSpeech
        });

        if (typeof onEnd === "function") {
            const fallbackDelay = Math.max(1200, String(colorName).length * 90);
            window.setTimeout(finishSpeech, fallbackDelay);
        }

        return;
    }

    window.speechSynthesis.cancel();

<<<<<<< HEAD
    const utterance = window.InkluaSpeech?.createUtterance(`${colorName}.`, { rate: 0.78 }) || new SpeechSynthesisUtterance(`${colorName}.`);
    utterance.lang = utterance.lang || "pt-BR";
    utterance.rate = 0.78;
    utterance.pitch = 1.16;
    utterance.onend = finishSpeech;
    utterance.onerror = utterance.onend;

=======
    const utterance = window.InkluaSpeech?.createUtterance(`${colorName}.`) || new SpeechSynthesisUtterance(`${colorName}.`);
>>>>>>> origin/main
    window.speechSynthesis.speak(utterance);

    if (typeof onEnd === "function") {
        const fallbackDelay = Math.max(900, String(colorName).length * 90);
        window.setTimeout(finishSpeech, fallbackDelay);
    }
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 6);
const getLevelColors = () => colors.slice(0, Math.min(2 + (getLevel() * 2), colors.length));

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

    speakColor(`Encontre ${currentTarget.name}`);
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

        if (colorDisplay) {
            colorDisplay.innerHTML = `
                <span class="game-level-pill">Nivel ${getLevel()}</span>
                <span class="color-display__swatch" style="--color-swatch: ${colorValue}"></span>
                <strong>${isCorrect ? "Acertou" : `Era ${currentTarget?.name}`}</strong>
            `;
        }

        speakColor(isCorrect ? `Muito bem. ${colorName}` : `Tudo bem. Voce consegue. A cor era ${currentTarget?.name}`);
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
        scheduleNextQuestion(isCorrect ? 2200 : 7200);
    });
});

renderQuestion();
