const vowelDisplay = document.getElementById("vowelDisplay");
const vowelButtons = document.querySelectorAll(".vowel-letter");
const vowels = Array.from(vowelButtons).map((button) => button.dataset.letter || button.textContent.trim());

const vowelNames = {
    A: "a",
    E: "e",
    I: "i",
    O: "o",
    U: "u"
};

let currentTarget = "A";
let questionStartedAt = Date.now();
let answeredQuestions = Number(window.InkluaGameProgress?.read?.()?.games?.vogais?.attempts) || 0;

const speakVowel = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`${vowelNames[letter] || letter}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 6);
const getLevelVowels = () => vowels.slice(0, [2, 3, 4, 5, 5, 5][getLevel() - 1]);

const renderQuestion = () => {
    const levelVowels = getLevelVowels();
    currentTarget = shuffle(levelVowels)[0] || "A";
    questionStartedAt = Date.now();

    if (vowelDisplay) {
        vowelDisplay.innerHTML = `
            <span class="game-level-pill">Nivel ${getLevel()} - Pergunta ${(answeredQuestions % 5) + 1}/5</span>
            <strong>${currentTarget}</strong>
        `;
    }

    vowelButtons.forEach((button) => {
        const letter = button.dataset.letter || button.textContent.trim();
        button.hidden = !levelVowels.includes(letter);
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    speakVowel(currentTarget);
};

vowelButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const letter = button.dataset.letter || button.textContent.trim();
        const isCorrect = letter === currentTarget;

        vowelButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected", isCorrect ? "is-correct" : "is-wrong");

        if (vowelDisplay) {
            vowelDisplay.innerHTML = `
                <span class="game-level-pill">Nivel ${getLevel()}</span>
                <strong>${isCorrect ? "Acertou" : `Era ${currentTarget}`}</strong>
            `;
        }

        speakVowel(isCorrect ? letter : currentTarget);
        window.InkluaGameProgress?.record("vogais", {
            title: "Jogo das Vogais",
            skill: "Alfabetizacao",
            item: currentTarget,
            selected: letter,
            question: `Encontre a vogal ${currentTarget}`,
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
