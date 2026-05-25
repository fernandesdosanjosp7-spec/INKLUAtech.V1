const choiceButtons = document.querySelectorAll(".choice-row button");
const gameFeedback = document.querySelector(".game-feedback");

choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
        choiceButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (!gameFeedback) {
            return;
        }

        gameFeedback.textContent = button.dataset.correct === "true"
            ? "Muito bem! Essa escolha combina com a situa&ccedil;&atilde;o."
            : "Boa tentativa. Escolha outra op&ccedil;&atilde;o para continuar.";

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
