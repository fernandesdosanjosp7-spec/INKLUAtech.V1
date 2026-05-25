const vowelDisplay = document.getElementById("vowelDisplay");
const vowelButtons = document.querySelectorAll(".vowel-letter");

const vowelNames = {
    A: "a",
    E: "\u00e9",
    I: "i",
    O: "\u00f3",
    U: "u"
};

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

vowelButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const letter = button.dataset.letter || button.textContent.trim();

        vowelButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (vowelDisplay) {
            vowelDisplay.textContent = letter;
        }

        speakVowel(letter);
    });
});
