const vowelDisplay = document.getElementById("vowelDisplay");
const vowelButtons = document.querySelectorAll(".vowel-letter");
let selectedVoice = null;
let speechWarmed = false;
let questionStartedAt = Date.now();

const vowelNames = {
    A: "a",
    E: "\u00e9",
    I: "i",
    O: "\u00f3",
    U: "u"
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

const speakVowel = (letter) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(`${vowelNames[letter] || letter}.`, { interrupt: true, rate: 1, pitch: 1.16 });
        return;
    }

    const utterance = createFastUtterance(vowelNames[letter] || letter);

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
    }

    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
};

const showVowel = (letter) => {
    if (vowelDisplay) {
        vowelDisplay.innerHTML = `<strong>${letter}</strong>`;
    }
};

const clearSelection = () => {
    vowelButtons.forEach((button) => {
        button.hidden = false;
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });
};

const selectVowel = (button) => {
    const letter = button.dataset.letter || button.textContent.trim();

    clearSelection();
    button.classList.add("is-selected", "is-correct");
    showVowel(letter);
    speakVowel(letter);
    window.InkluaGameProgress?.record("vogais", {
        title: "Vogais Faladas",
        skill: "Alfabetizacao",
        item: letter,
        selected: letter,
        question: `Vogal ${letter}`,
        correct: true,
        level: 1,
        maxLevel: 1,
        totalItems: vowelButtons.length,
        responseTimeMs: Date.now() - questionStartedAt
    });
    questionStartedAt = Date.now();
};

vowelButtons.forEach((button) => {
    button.style.touchAction = "manipulation";
    button.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") {
            warmSpeech();
        }
    });
    button.addEventListener("focus", warmSpeech);
    button.addEventListener("pointerdown", () => {
        refreshVoice();
        selectVowel(button);
    });
    button.addEventListener("click", (event) => {
        if (event.detail === 0) {
            selectVowel(button);
        }
    });
});

clearSelection();
showVowel("A");
