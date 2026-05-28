const choiceButtons = document.querySelectorAll(".choice-row button");
const gameFeedback = document.querySelector(".game-feedback");

const speakRoutine = (text) => {
    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(text, { interrupt: true });
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

        const isCorrect = button.dataset.correct === "true";
        const phrase = isCorrect
            ? window.InkluaFeedback?.getPositivePhrase?.() || "Voce acertou!"
            : window.InkluaFeedback?.getEncouragementPhrase?.() || "Boa tentativa, vamos continuar!";
        const detail = isCorrect
            ? "Essa escolha combina com a situacao."
            : "Escolha outra opcao para continuar.";

        gameFeedback.textContent = `${phrase} ${detail}`;
        speakRoutine(`${phrase} ${detail}`);

        window.InkluaGameProgress?.record("rotina", {
            title: "Sequência da Rotina",
            skill: "Interação social",
            item: button.textContent.trim(),
            correct: isCorrect,
            completed: isCorrect,
            totalItems: 1
        });
    });
});

speakRoutine("Depois da chegada, qual etapa pode vir na rotina?");
