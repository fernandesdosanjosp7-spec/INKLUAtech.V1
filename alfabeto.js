const alphabetDisplay = document.getElementById("alphabetDisplay");
const alphabetButtons = document.querySelectorAll(".alphabet-letter");
let selectedVoice = null;
let speechWarmed = false;

const letterNames = {
    A: "a",
    B: "b\u00ea",
    C: "c\u00ea",
    D: "d\u00ea",
    E: "\u00e9",
    F: "efe",
    G: "g\u00ea",
    H: "ag\u00e1",
    I: "i",
    J: "jota",
    K: "ca",
    L: "ele",
    M: "eme",
    N: "ene",
    O: "\u00f3",
    P: "p\u00ea",
    Q: "qu\u00ea",
    R: "erre",
    S: "esse",
    T: "t\u00ea",
    U: "u",
    V: "v\u00ea",
    W: "dablio",
    X: "xis",
    Y: "ipsilon",
    Z: "ze"
};

const selectFastVoice = () => {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    const normalizeVoiceText = (value) => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const femaleNames = ["ana", "beatriz", "camila", "carolina", "francisca", "fernanda", "helena", "luciana", "maria", "patricia", "raquel", "vitoria"];
    const maleNames = ["antonio", "bruno", "carlos", "daniel", "felipe", "joaquim", "paulo", "ricardo", "thiago"];
    const scoreVoice = (voice) => {
        const text = normalizeVoiceText(`${voice.name} ${voice.voiceURI}`);
        let score = 0;

        if (voice.lang?.toLowerCase() === "pt-br") score += 70;
        if (voice.lang?.toLowerCase().startsWith("pt")) score += 40;
        if (femaleNames.some((name) => text.includes(name))) score += 500;
        if (maleNames.some((name) => text.includes(name))) score -= 1000;
        if (text.includes("female") || text.includes("feminina") || text.includes("woman")) score += 450;
        if (text.includes("male") || text.includes("masculina") || text.includes("homem")) score -= 1000;

        return score;
    };

    return window.InkluaSpeech?.getFemaleVoice?.()
        || [...voices].sort((first, second) => scoreVoice(second) - scoreVoice(first))[0]
        || null;
};

const refreshVoice = () => {
    selectedVoice = selectFastVoice() || selectedVoice;
};

const createFastUtterance = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoice?.lang || "pt-BR";
    utterance.rate = 1;
    utterance.pitch = 1.16;

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    return utterance;
};

const warmSpeech = () => {
    if (speechWarmed || !("speechSynthesis" in window)) {
        return;
    }

    speechWarmed = true;
    refreshVoice();

    const utterance = createFastUtterance(".");
    utterance.volume = 0;
    utterance.rate = 1.4;
    window.speechSynthesis.speak(utterance);
    window.setTimeout(() => window.speechSynthesis.cancel(), 60);
};

window.speechSynthesis?.addEventListener?.("voiceschanged", refreshVoice);
refreshVoice();

const speakLetter = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    const letterName = letterNames[letter] || letter;
    const utterance = createFastUtterance(letterName);

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
    }

    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
};

const showLetter = (letter) => {
    if (alphabetDisplay) {
        alphabetDisplay.innerHTML = `<strong>${letter}</strong>`;
    }
};

const clearSelection = () => {
    alphabetButtons.forEach((button) => {
        button.hidden = false;
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });
};

const selectLetter = (button) => {
    const letter = button.dataset.letter || button.textContent.trim();

    clearSelection();
    button.classList.add("is-selected", "is-correct");
    showLetter(letter);
    speakLetter(letter);
};

alphabetButtons.forEach((button) => {
    button.style.touchAction = "manipulation";
    button.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") {
            warmSpeech();
        }
    });
    button.addEventListener("focus", warmSpeech);
    button.addEventListener("pointerdown", () => {
        refreshVoice();
        selectLetter(button);
    });
    button.addEventListener("click", (event) => {
        if (event.detail === 0) {
            selectLetter(button);
        }
    });
});

clearSelection();
showLetter("A");
