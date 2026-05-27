const numberDisplay = document.getElementById("numberDisplay");
const numberButtons = document.querySelectorAll(".number-button");
const numbers = Array.from(numberButtons).map((button) => button.dataset.number || button.textContent.trim());

let currentTarget = "0";
let questionStartedAt = Date.now();
let answeredQuestions = Number(window.InkluaGameProgress?.read?.()?.games?.numeros?.attempts) || 0;

const speakNumber = (number) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(String(number));
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 3);
const getLevelNumbers = () => numbers.slice(0, [4, 7, 11][getLevel() - 1]);

const renderQuestion = () => {
    const levelNumbers = getLevelNumbers();
    currentTarget = shuffle(levelNumbers)[0] || "0";
    questionStartedAt = Date.now();

    if (numberDisplay) {
        numberDisplay.innerHTML = `
            <span class="game-level-pill">Nivel ${getLevel()} - Pergunta ${(answeredQuestions % 5) + 1}/5</span>
            <strong>${currentTarget}</strong>
        `;
    }

    numberButtons.forEach((button) => {
        const number = button.dataset.number || button.textContent.trim();
        button.hidden = !levelNumbers.includes(number);
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    speakNumber(currentTarget);
};

numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const number = button.dataset.number || button.textContent.trim();
        const isCorrect = number === currentTarget;

        numberButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected", isCorrect ? "is-correct" : "is-wrong");

        if (numberDisplay) {
            numberDisplay.innerHTML = `
                <span class="game-level-pill">Nivel ${getLevel()}</span>
                <strong>${isCorrect ? "Acertou" : `Era ${currentTarget}`}</strong>
            `;
        }

        speakNumber(isCorrect ? number : currentTarget);
        window.InkluaGameProgress?.record("numeros", {
            title: "Numeros Falados",
            skill: "Atencao e foco",
            item: currentTarget,
            selected: number,
            question: `Encontre o numero ${currentTarget}`,
            correct: isCorrect,
            level: getLevel(),
            maxLevel: 3,
            totalItems: 15,
            responseTimeMs: Date.now() - questionStartedAt
        });

        answeredQuestions += 1;
        window.setTimeout(renderQuestion, 850);
    });
});

renderQuestion();
