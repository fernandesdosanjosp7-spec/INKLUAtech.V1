const numberDisplay = document.getElementById("numberDisplay");
const numberButtons = document.querySelectorAll(".number-button");

const speakNumber = (number) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`N\u00famero ${number}`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

numberButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const number = button.dataset.number || button.textContent.trim();

        numberButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (numberDisplay) {
            numberDisplay.textContent = number;
        }

        speakNumber(number);
    });
});
