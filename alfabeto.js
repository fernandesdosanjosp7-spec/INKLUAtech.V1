const alphabetDisplay = document.getElementById("alphabetDisplay");
const alphabetButtons = document.querySelectorAll(".alphabet-letter");

const letterNames = {
    A: "a",
    B: "b\u00ea",
    C: "c\u00ea",
    D: "d\u00ea",
    E: "\u00e9",
    F: "\u00e9fe",
    G: "g\u00ea",
    H: "ag\u00e1",
    I: "i",
    J: "jota",
    K: "c\u00e1",
    L: "\u00e9le",
    M: "\u00eame",
    N: "\u00eane",
    O: "\u00f3",
    P: "p\u00ea",
    Q: "qu\u00ea",
    R: "\u00e9rre",
    S: "\u00e9sse",
    T: "t\u00ea",
    U: "u",
    V: "v\u00ea",
    W: "d\u00e1blio",
    X: "xis",
    Y: "\u00edpsilon",
    Z: "z\u00ea"
};

const speakLetter = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const letterName = letterNames[letter] || letter;
    const utterance = new SpeechSynthesisUtterance(`Letra ${letterName}.`);
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

alphabetButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const letter = button.dataset.letter || button.textContent.trim();

        alphabetButtons.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");

        if (alphabetDisplay) {
            alphabetDisplay.textContent = letter;
        }

        speakLetter(letter);
    });
});
