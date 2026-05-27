const syllableLetters = document.getElementById("syllableLetters");
const syllableQuestion = document.getElementById("syllableQuestion");
const syllableOptions = document.getElementById("syllableOptions");
const syllableFeedback = document.getElementById("syllableFeedback");
const syllableStep = document.getElementById("syllableStep");
const syllableTotal = document.getElementById("syllableTotal");
const nextSyllable = document.getElementById("nextSyllable");
const restartSyllable = document.getElementById("restartSyllable");

const syllableRounds = [
    { letters: "A + I", answer: "AI", options: ["AI", "IA", "OI", "AU"], word: "ai" },
    { letters: "O + I", answer: "OI", options: ["UI", "OI", "IO", "AI"], word: "oi" },
    { letters: "A + U", answer: "AU", options: ["UA", "EU", "AU", "AI"], word: "au" },
    { letters: "E + U", answer: "EU", options: ["OU", "EU", "UA", "EI"], word: "eu" },
    { letters: "U + A", answer: "UA", options: ["AU", "IA", "UA", "OU"], word: "ua" },
    { letters: "B + A", answer: "BA", options: ["BA", "BE", "DA", "PA"], word: "ba" },
    { letters: "M + E", answer: "ME", options: ["NE", "ME", "MI", "MA"], word: "me" },
    { letters: "P + I", answer: "PI", options: ["BI", "PI", "PA", "PE"], word: "pi" },
    { letters: "L + O", answer: "LO", options: ["LA", "LU", "LO", "RO"], word: "lo" },
    { letters: "T + U", answer: "TU", options: ["TU", "DU", "TO", "TA"], word: "tu" },
    { letters: "C + A", answer: "CA", options: ["CA", "CO", "GA", "BA"], word: "ca" },
    { letters: "F + E", answer: "FE", options: ["VE", "FA", "FE", "FO"], word: "fe" },
    { letters: "N + I", answer: "NI", options: ["MI", "NA", "NO", "NI"], word: "ni" },
    { letters: "R + O", answer: "RO", options: ["RO", "LO", "RA", "RU"], word: "ro" },
    { letters: "S + U", answer: "SU", options: ["SU", "SO", "ZU", "SA"], word: "su" }
];

let currentRound = 0;
let canContinue = false;
let answeredQuestions = Number(window.InkluaGameProgress?.read?.()?.games?.silabas?.attempts) || 0;
let questionStartedAt = Date.now();

const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 3);

const speakSyllable = (text) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

const recordSyllable = (round, selected, isCorrect, completed = false) => {
    window.InkluaGameProgress?.record("silabas", {
        title: "Jogo das Silabas",
        skill: "Alfabetizacao",
        item: round.answer,
        selected,
        question: round.letters,
        correct: isCorrect,
        completed,
        totalItems: syllableRounds.length,
        level: getLevel(),
        maxLevel: 3,
        responseTimeMs: Date.now() - questionStartedAt
    });
};

const renderRound = () => {
    const round = syllableRounds[currentRound];

    canContinue = false;
    questionStartedAt = Date.now();
    syllableLetters.textContent = round.letters;
    syllableQuestion.textContent = `Nivel ${getLevel()} - ${round.letters} forma...`;
    syllableFeedback.textContent = "";
    syllableStep.textContent = String(currentRound + 1);
    syllableTotal.textContent = String(syllableRounds.length);
    nextSyllable.disabled = true;
    nextSyllable.textContent = currentRound === syllableRounds.length - 1 ? "Finalizar" : "Proxima";
    syllableOptions.innerHTML = round.options.map((option) => `
        <button class="syllable-option" type="button" data-option="${option}">${option}</button>
    `).join("");

    speakSyllable(`${round.letters}. Qual som forma?`);
};

const finishGame = () => {
    syllableLetters.textContent = "Muito bem!";
    syllableQuestion.textContent = "Atividade concluida";
    syllableOptions.innerHTML = "";
    syllableFeedback.textContent = "Voce completou o Jogo das Silabas.";
    nextSyllable.hidden = true;
    restartSyllable.hidden = false;

    window.InkluaGameProgress?.record("silabas", {
        title: "Jogo das Silabas",
        skill: "Alfabetizacao",
        item: "finalizado",
        completed: true,
        totalItems: syllableRounds.length,
        level: getLevel(),
        maxLevel: 3
    });

    speakSyllable("Atividade concluida. Muito bem!");
};

const selectOption = (button) => {
    const round = syllableRounds[currentRound];
    const selected = button.dataset.option || "";
    const isCorrect = selected === round.answer;

    answeredQuestions += 1;

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
    answeredQuestions = 0;
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

renderRound();
