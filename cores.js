const colorDisplay = document.getElementById("colorDisplay");
const colorButtons = document.querySelectorAll(".color-button");

const speakColor = (colorName) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`Cor ${colorName}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

colorButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const colorName = button.dataset.colorName || button.textContent.trim();
        const colorValue = button.dataset.colorValue || "#ffffff";

        colorButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (colorDisplay) {
            colorDisplay.innerHTML = `
                <span class="color-display__swatch" style="--color-swatch: ${colorValue}"></span>
                <strong>${colorName}</strong>
            `;
        }

        speakColor(colorName);
    });
});
