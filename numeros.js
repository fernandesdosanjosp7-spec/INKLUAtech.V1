const numberDisplay = document.getElementById("numberDisplay");
const numberButtons = document.querySelectorAll(".number-button");
let selectedVoice = null;
let speechWarmed = false;
let questionStartedAt = Date.now();

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

const speakNumber = (number) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(String(number), { interrupt: true, rate: 1, pitch: 1.16 });
        return;
    }

    const utterance = createFastUtterance(String(number));

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
    }

    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
};

const showNumber = (number) => {
    if (numberDisplay) {
        numberDisplay.innerHTML = `<strong>${number}</strong>`;
    }
};

const clearSelection = () => {
    numberButtons.forEach((button) => {
        button.hidden = false;
        button.classList.remove("is-selected", "is-correct", "is-wrong");
    });
};

const selectNumber = (button) => {
    const number = button.dataset.number || button.textContent.trim();

    clearSelection();
    button.classList.add("is-selected", "is-correct");
    showNumber(number);
    speakNumber(number);
    window.InkluaGameProgress?.record("numeros", {
        title: "Numeros Falados",
        skill: "Reconhecimento de numeros",
        item: number,
        selected: number,
        question: `Numero ${number}`,
        correct: true,
        level: 1,
        maxLevel: 1,
        totalItems: numberButtons.length,
        responseTimeMs: Date.now() - questionStartedAt
    });
    questionStartedAt = Date.now();
};

numberButtons.forEach((button) => {
    button.style.touchAction = "manipulation";
    button.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") {
            warmSpeech();
        }
    });
    button.addEventListener("focus", warmSpeech);
    button.addEventListener("pointerdown", () => {
        refreshVoice();
        selectNumber(button);
    });
    button.addEventListener("click", (event) => {
        if (event.detail === 0) {
            selectNumber(button);
        }
    });
});

clearSelection();
showNumber("0");
