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

    const utterance = window.InkluaSpeech?.createUtterance(`${vowelNames[letter] || letter}.`) || new SpeechSynthesisUtterance(`${vowelNames[letter] || letter}.`);
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
        window.InkluaGameProgress?.record("vogais", {
            title: "Jogo das Vogais",
            skill: "Alfabetização",
            item: letter,
            correct: true,
            totalItems: 5
        });
    });
});
