const alphabetDisplay = document.getElementById("alphabetDisplay");
const alphabetButtons = document.querySelectorAll(".alphabet-letter");
const alphabetLetters = Array.from(alphabetButtons).map((button) => button.dataset.letter || button.textContent.trim());

const letterNames = {
    A: "a",
    B: "be",
    C: "ce",
    D: "de",
    E: "e",
    F: "efe",
    G: "ge",
    H: "aga",
    I: "i",
    J: "jota",
    K: "ca",
    L: "ele",
    M: "eme",
    N: "ene",
    O: "o",
    P: "pe",
    Q: "que",
    R: "erre",
    S: "esse",
    T: "te",
    U: "u",
    V: "ve",
    W: "dablio",
    X: "xis",
    Y: "ipsilon",
    Z: "ze"
};

let currentTarget = "A";
let questionStartedAt = Date.now();
let answeredQuestions = Number(window.InkluaGameProgress?.read?.()?.games?.alfabeto?.attempts) || 0;

const speakLetter = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const letterName = letterNames[letter] || letter;
    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(`${letterName}.`);
        return;
    }

    const utterance = window.InkluaSpeech?.createUtterance(`${letterName}.`) || new SpeechSynthesisUtterance(`${letterName}.`);
    utterance.lang = utterance.lang || "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1.16;
    window.speechSynthesis.speak(utterance);
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 6);
const getLevelLetters = () => alphabetLetters.slice(0, [5, 9, 13, 17, 21, 26][getLevel() - 1]);

const renderQuestion = () => {
    const letters = getLevelLetters();
    currentTarget = shuffle(letters)[0] || "A";
    questionStartedAt = Date.now();

    if (alphabetDisplay) {
        alphabetDisplay.innerHTML = `
            <span class="game-level-pill">Nivel ${getLevel()} - Pergunta ${(answeredQuestions % 5) + 1}/5</span>
            <strong>${currentTarget}</strong>
        `;
    }

    alphabetButtons.forEach((button) => {
        const letter = button.dataset.letter || button.textContent.trim();
        button.hidden = !letters.includes(letter);
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    speakLetter(currentTarget);
};

alphabetButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const letter = button.dataset.letter || button.textContent.trim();
        const isCorrect = letter === currentTarget;

        alphabetButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected", isCorrect ? "is-correct" : "is-wrong");

        if (alphabetDisplay) {
            alphabetDisplay.innerHTML = `
                <span class="game-level-pill">Nivel ${getLevel()}</span>
                <strong>${isCorrect ? "Acertou" : `Era ${currentTarget}`}</strong>
            `;
        }

        speakLetter(isCorrect ? letter : currentTarget);
        window.InkluaGameProgress?.record("alfabeto", {
            title: "Alfabeto Falado",
            skill: "Alfabetizacao",
            item: currentTarget,
            selected: letter,
            question: `Encontre a letra ${currentTarget}`,
            correct: isCorrect,
            level: getLevel(),
            maxLevel: 6,
            totalItems: 30,
            responseTimeMs: Date.now() - questionStartedAt
        });

        answeredQuestions += 1;
        window.setTimeout(renderQuestion, 850);
    });
});

renderQuestion();
