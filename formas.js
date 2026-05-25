const shapeDisplay = document.getElementById("shapeDisplay");
const shapeButtons = document.querySelectorAll(".shape-button");

const speakShape = (shapeName) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`Forma ${shapeName}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
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
    });
});
