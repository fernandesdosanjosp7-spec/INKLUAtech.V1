const shapeDisplay = document.getElementById("shapeDisplay");
const shapeButtons = document.querySelectorAll(".shape-button");

const speakShape = (shapeName) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = window.InkluaSpeech?.createUtterance(`Forma ${shapeName}.`) || new SpeechSynthesisUtterance(`Forma ${shapeName}.`);
    window.speechSynthesis.speak(utterance);
};

shapeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const shapeName = button.dataset.shapeName || button.textContent.trim();
        const shapeClass = button.dataset.shapeClass || "circle";

        shapeButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (shapeDisplay) {
            shapeDisplay.innerHTML = `
                <span class="shape-preview shape-preview--${shapeClass}"></span>
                <strong>${shapeName}</strong>
            `;
        }

        speakShape(shapeName);
        window.InkluaGameProgress?.record("formas", {
            title: "Formas Faladas",
            skill: "Coordenação motora",
            item: shapeName,
            correct: true,
            totalItems: 6
        });
    });
});
