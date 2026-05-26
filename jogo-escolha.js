const choiceButtons = document.querySelectorAll(".choice-row button");
const gameFeedback = document.querySelector(".game-feedback");

const speakRoutine = (text) => {
    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(text);
        return;
    }

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = window.InkluaSpeech?.createUtterance(text) || new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
};

choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
        choiceButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (!gameFeedback) {
            return;
        }

        gameFeedback.textContent = button.dataset.correct === "true"
            ? "Muito bem! Essa escolha combina com a situa\u00e7\u00e3o."
            : "Boa tentativa. Escolha outra op\u00e7\u00e3o para continuar.";
        speakRoutine(button.dataset.correct === "true"
            ? "Muito bem! Essa escolha combina com a situa\u00e7\u00e3o."
            : "Boa tentativa. Escolha outra op\u00e7\u00e3o para continuar.");

        window.InkluaGameProgress?.record("rotina", {
            title: "Sequência da Rotina",
            skill: "Interação social",
            item: button.textContent.trim(),
            correct: button.dataset.correct === "true",
            completed: button.dataset.correct === "true",
            totalItems: 1
        });
    });
});

speakRoutine("Depois da chegada, qual etapa pode vir na rotina?");
