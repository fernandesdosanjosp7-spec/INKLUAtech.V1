const colorDisplay = document.getElementById("colorDisplay");
const colorButtons = document.querySelectorAll(".color-button");
const colors = Array.from(colorButtons).map((button) => ({
    name: button.dataset.colorName || button.textContent.trim(),
    value: button.dataset.colorValue || "#ffffff"
}));

let currentTarget = null;
let questionStartedAt = Date.now();
let answeredQuestions = Number(window.InkluaGameProgress?.read?.()?.games?.cores?.attempts) || 0;

const speakColor = (colorName) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`${colorName}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 4);
const getLevelColors = () => colors.slice(0, Math.min(3 + (getLevel() * 2), colors.length));

const renderQuestion = () => {
    const levelColors = getLevelColors();
    currentTarget = shuffle(levelColors)[0] || colors[0];
    questionStartedAt = Date.now();

    if (colorDisplay) {
        colorDisplay.innerHTML = `
            <span class="game-level-pill">Nivel ${getLevel()} - Pergunta ${(answeredQuestions % 5) + 1}/5</span>
            <strong>Encontre: ${currentTarget.name}</strong>
        `;
    }

    colorButtons.forEach((button) => {
        const isAvailable = levelColors.some((color) => color.name === button.dataset.colorName);
        button.hidden = !isAvailable;
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    speakColor(`Encontre ${currentTarget.name}`);
};

colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const colorName = button.dataset.colorName || button.textContent.trim();
        const colorValue = button.dataset.colorValue || "#ffffff";
        const isCorrect = colorName === currentTarget?.name;

        colorButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        button.classList.add(isCorrect ? "is-correct" : "is-wrong");

        if (colorDisplay) {
            colorDisplay.innerHTML = `
                <span class="game-level-pill">Nivel ${getLevel()}</span>
                <span class="color-display__swatch" style="--color-swatch: ${colorValue}"></span>
                <strong>${isCorrect ? "Acertou" : `Era ${currentTarget?.name}`}</strong>
            `;
        }

        speakColor(isCorrect ? colorName : `Tente de novo. Era ${currentTarget?.name}`);
        window.InkluaGameProgress?.record("cores", {
            title: "Jogo das Cores",
            skill: "Reconhecimento de cores",
            item: currentTarget?.name || colorName,
            selected: colorName,
            question: `Encontre ${currentTarget?.name || colorName}`,
            correct: isCorrect,
            level: getLevel(),
            maxLevel: 4,
            totalItems: 20,
            responseTimeMs: Date.now() - questionStartedAt
        });

        answeredQuestions += 1;
        window.setTimeout(renderQuestion, 850);
    });
});

renderQuestion();
