const syllableLetters = document.getElementById("syllableLetters");
const syllableQuestion = document.getElementById("syllableQuestion");
const syllableOptions = document.getElementById("syllableOptions");
const syllableFeedback = document.getElementById("syllableFeedback");
const syllableStep = document.getElementById("syllableStep");
const syllableTotal = document.getElementById("syllableTotal");
const nextSyllable = document.getElementById("nextSyllable");
const restartSyllable = document.getElementById("restartSyllable");

const syllableLevels = [
    [
        { letters: "A + I", answer: "AI", options: ["AI", "IA", "OI", "AU"], word: "ai" },
        { letters: "O + I", answer: "OI", options: ["UI", "OI", "IO", "AI"], word: "oi" },
        { letters: "A + U", answer: "AU", options: ["UA", "EU", "AU", "AI"], word: "au" },
        { letters: "E + U", answer: "EU", options: ["OU", "EU", "UA", "EI"], word: "eu" },
        { letters: "U + A", answer: "UA", options: ["AU", "IA", "UA", "OU"], word: "ua" }
    ],
    [
        { letters: "B + A", answer: "BA", options: ["BA", "BE", "AB", "PA"], word: "ba" },
        { letters: "B + O", answer: "BO", options: ["BO", "OB", "BA", "DO"], word: "bo" },
        { letters: "C + A", answer: "CA", options: ["AC", "CA", "CO", "KA"], word: "ca" },
        { letters: "D + E", answer: "DE", options: ["DE", "DA", "ED", "TE"], word: "de" },
        { letters: "F + I", answer: "FI", options: ["FA", "IF", "FI", "VI"], word: "fi" }
    ],
    [
        { letters: "M + A", answer: "MA", options: ["MA", "AM", "ME", "NA"], word: "ma" },
        { letters: "P + E", answer: "PE", options: ["PA", "PE", "EP", "BE"], word: "pe" },
        { letters: "T + O", answer: "TO", options: ["OT", "TA", "TO", "DO"], word: "to" },
        { letters: "L + U", answer: "LU", options: ["LI", "UL", "NU", "LU"], word: "lu" },
        { letters: "R + I", answer: "RI", options: ["IR", "RA", "RI", "LI"], word: "ri" }
    ]
];

let currentRound = 0;
let canContinue = false;
let currentLevel = 1;
let syllableRounds = [];

const getStoredGameLevel = (gameId) => {
    const progress = window.InkluaGameProgress?.read?.();
    return Math.max(Number(progress?.games?.[gameId]?.level) || 1, 1);
};

const getRoundsForLevel = (level) => syllableLevels[(level - 1) % syllableLevels.length];

const loadCurrentLevel = () => {
    currentLevel = getStoredGameLevel("silabas");
    syllableRounds = getRoundsForLevel(currentLevel);
};

const speakSyllable = (text) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = window.InkluaSpeech?.createUtterance(text) || new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
};

const recordSyllable = (round, selected, isCorrect, completed = false) => {
    window.InkluaGameProgress?.record("silabas", {
        title: "Jogo das Silabas",
        skill: "Alfabetização",
        item: round.answer,
        correct: isCorrect,
        completed,
        totalItems: syllableRounds.length,
        selected
    });
};

const renderRound = () => {
    const round = syllableRounds[currentRound];

    canContinue = false;
    syllableLetters.textContent = round.letters;
    syllableQuestion.textContent = `${round.letters} forma...`;
    syllableFeedback.textContent = "";
    syllableStep.textContent = String(currentRound + 1);
    syllableTotal.textContent = String(syllableRounds.length);
    nextSyllable.disabled = true;
    nextSyllable.textContent = currentRound === syllableRounds.length - 1 ? "Finalizar fase" : "Proxima";
    syllableOptions.innerHTML = round.options.map((option) => `
        <button class="syllable-option" type="button" data-option="${option}">${option}</button>
    `).join("");

    speakSyllable(`${round.letters}. Qual som forma?`);
};

const finishGame = () => {
    const nextLevel = getStoredGameLevel("silabas");

    syllableLetters.textContent = "Muito bem!";
    syllableQuestion.textContent = nextLevel > currentLevel ? `Fase ${nextLevel} desbloqueada` : "Atividade concluida";
    syllableOptions.innerHTML = "";
    syllableFeedback.textContent = nextLevel > currentLevel
        ? "Voce acertou as perguntas da fase. A proxima fase tem novas silabas."
        : "Voce completou o Jogo das Silabas.";
    nextSyllable.hidden = true;
    restartSyllable.hidden = false;
    restartSyllable.textContent = nextLevel > currentLevel ? `Comecar fase ${nextLevel}` : "Jogar novamente";

    window.InkluaGameProgress?.record("silabas", {
        title: "Jogo das Silabas",
        skill: "Alfabetização",
        item: "finalizado",
        completed: true,
        totalItems: syllableRounds.length
    });

    speakSyllable("Atividade concluída. Muito bem!");
};

const selectOption = (button) => {
    const round = syllableRounds[currentRound];
    const selected = button.dataset.option || "";
    const isCorrect = selected === round.answer;

    syllableOptions.querySelectorAll(".syllable-option").forEach((option) => {
        option.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    button.classList.add("is-selected");

    if (isCorrect) {
        button.classList.add("is-correct");
        syllableFeedback.textContent = `Isso mesmo! ${round.letters} forma ${round.answer}.`;
        canContinue = true;
        nextSyllable.disabled = false;
        recordSyllable(round, selected, true);
        speakSyllable(`${round.word}. Muito bem.`);
        return;
    }

    button.classList.add("is-wrong");
    syllableFeedback.textContent = "Boa tentativa. Observe a plaquinha e tente novamente.";
    recordSyllable(round, selected, false);
    speakSyllable("Boa tentativa. Tente novamente.");
};

const goToNextRound = () => {
    if (!canContinue) {
        return;
    }

    if (currentRound === syllableRounds.length - 1) {
        finishGame();
        return;
    }

    currentRound += 1;
    renderRound();
};

const restartGame = () => {
    currentRound = 0;
    loadCurrentLevel();
    nextSyllable.hidden = false;
    restartSyllable.hidden = true;
    renderRound();
};

syllableOptions.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".syllable-option") : null;

    if (button) {
        selectOption(button);
    }
});

nextSyllable.addEventListener("click", goToNextRound);
restartSyllable.addEventListener("click", restartGame);

loadCurrentLevel();
renderRound();
