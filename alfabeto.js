const alphabetDisplay = document.getElementById("alphabetDisplay");
const alphabetFeedback = document.getElementById("alphabetFeedback");
const alphabetButtons = document.querySelectorAll(".alphabet-letter");
let selectedVoice = null;
let speechWarmed = false;
let targetLetter = "A";
let questionStartedAt = Date.now();
let helpTimer = null;
let nextTargetTimer = null;
let lastSuccessMessage = "";
let lastTryAgainMessage = "";

const alphabetAssociations = {
    A: { word: "abelha", displayWord: "Abelha", visual: "\uD83D\uDC1D", color: "#ffd166" },
    B: { word: "bola", displayWord: "Bola", visual: "\u26BD", color: "#64b5ff" },
    C: { word: "casa", displayWord: "Casa", visual: "\uD83C\uDFE0", color: "#ff9f7a" },
    D: { word: "dado", displayWord: "Dado", visual: "\uD83C\uDFB2", color: "#d8c2ff" },
    E: { word: "elefante", displayWord: "Elefante", visual: "\uD83D\uDC18", color: "#a5d8ff" },
    F: { word: "flor", displayWord: "Flor", visual: "\uD83C\uDF38", color: "#ffb3c7" },
    G: { word: "gato", displayWord: "Gato", visual: "\uD83D\uDC31", color: "#ffd6a5" },
    H: { word: "helic\u00f3ptero", displayWord: "Helic\u00f3ptero", visual: "\uD83D\uDE81", color: "#9bf6ff" },
    I: { word: "igreja", displayWord: "Igreja", visual: "\u26EA", color: "#caffbf" },
    J: { word: "jacar\u00e9", displayWord: "Jacar\u00e9", visual: "\uD83D\uDC0A", color: "#b7efc5" },
    K: { word: "kiwi", displayWord: "Kiwi", visual: "\uD83E\uDD5D", color: "#d9ed92" },
    L: { word: "le\u00e3o", displayWord: "Le\u00e3o", visual: "\uD83E\uDD81", color: "#ffd166" },
    M: { word: "macaco", displayWord: "Macaco", visual: "\uD83D\uDC35", color: "#f4a261" },
    N: { word: "navio", displayWord: "Navio", visual: "\uD83D\uDEA2", color: "#90dbf4" },
    O: { word: "ovo", displayWord: "Ovo", visual: "\uD83E\uDD5A", color: "#fff3b0" },
    P: { word: "pato", displayWord: "Pato", visual: "\uD83E\uDD86", color: "#ffe066" },
    Q: { word: "queijo", displayWord: "Queijo", visual: "\uD83E\uDDC0", color: "#ffd43b" },
    R: { word: "rato", displayWord: "Rato", visual: "\uD83D\uDC2D", color: "#ced4da" },
    S: { word: "sapo", displayWord: "Sapo", visual: "\uD83D\uDC38", color: "#95d5b2" },
    T: {
        word: "tatu",
        displayWord: "Tatu",
        visual: `<svg class="alphabet-card__svg" viewBox="0 0 180 130" aria-hidden="true" focusable="false">
            <ellipse cx="91" cy="76" rx="58" ry="34" fill="#c68b59"/>
            <path d="M42 72c16-24 70-32 104-8 4 3 4 10-1 13-31 19-81 18-104 2-3-2-3-5 1-7Z" fill="#e0a66f"/>
            <path d="M55 58c2 30 1 42-8 50M76 48c1 34 1 47-8 62M98 47c0 34-1 48-9 62M120 52c-1 29-3 43-11 55" fill="none" stroke="#8f5e3d" stroke-width="6" stroke-linecap="round"/>
            <circle cx="147" cy="63" r="20" fill="#d49a68"/>
            <path d="M156 47l12-12 4 17" fill="#d49a68"/>
            <circle cx="154" cy="60" r="4" fill="#21364d"/>
            <path d="M164 70c8 2 13 5 15 10" fill="none" stroke="#8f5e3d" stroke-width="5" stroke-linecap="round"/>
            <path d="M34 81c-13 5-22 12-28 23" fill="none" stroke="#8f5e3d" stroke-width="7" stroke-linecap="round"/>
            <path d="M60 104v13M96 106v13M129 101v13" stroke="#8f5e3d" stroke-width="8" stroke-linecap="round"/>
        </svg>`,
        color: "#d4a373"
    },
    U: { word: "uva", displayWord: "Uva", visual: "\uD83C\uDF47", color: "#c77dff" },
    V: { word: "vaca", displayWord: "Vaca", visual: "\uD83D\uDC2E", color: "#e9ecef" },
    W: { word: "waffle", displayWord: "Waffle", visual: "\uD83E\uDDC7", color: "#f6bd60" },
    X: { word: "x\u00edcara", displayWord: "X\u00edcara", visual: "\u2615", color: "#bde0fe" },
    Y: { word: "yoga", displayWord: "Yoga", visual: "\uD83E\uDDD8", color: "#cdb4db" },
    Z: { word: "zebra", displayWord: "Zebra", visual: "\uD83E\uDD93", color: "#dee2e6" }
};

const alphabetLetters = Object.keys(alphabetAssociations);
const successMessages = [
    "Muito bem!",
    "Voc\u00ea est\u00e1 aprendendo r\u00e1pido!",
    "Excelente trabalho!",
    "Parab\u00e9ns, voc\u00ea conseguiu!",
    "Isso mesmo!",
    "Voc\u00ea acertou!",
    "Incr\u00edvel!",
    "Continue assim!",
    "Voc\u00ea est\u00e1 indo muito bem!",
    "Que legal!",
    "Fant\u00e1stico!",
    "Voc\u00ea \u00e9 muito inteligente!",
    "\u00d3timo trabalho!",
    "Mandou bem!",
    "Perfeito!",
    "Estou orgulhosa de voc\u00ea!",
    "Voc\u00ea conseguiu reconhecer a letra!",
    "Vamos para a pr\u00f3xima!",
    "Cada vez melhor!",
    "Muito bom!",
    "Voc\u00ea est\u00e1 evoluindo!",
    "Boa observa\u00e7\u00e3o!",
    "Voc\u00ea prestou bastante aten\u00e7\u00e3o!",
    "Excelente!",
    "Aprender \u00e9 divertido!",
    "Vamos continuar!",
    "Voc\u00ea foi incr\u00edvel!",
    "Muito inteligente!",
    "Voc\u00ea acertou direitinho!",
    "Que descoberta bonita!",
    "Sua aten\u00e7\u00e3o ajudou muito!",
    "Voc\u00ea encontrou a letra certa!"
];
const tryAgainMessages = [
    "Tudo bem, vamos tentar juntos!",
    "Voc\u00ea est\u00e1 aprendendo!",
    "Tente mais uma vez!",
    "Quase isso!",
    "Vamos descobrir juntos!",
    "N\u00e3o tem problema errar!",
    "Voc\u00ea consegue!",
    "Vamos tentar novamente com calma!",
    "Cada tentativa ajuda voc\u00ea a aprender!",
    "Boa tentativa!",
    "Sem pressa, olhe com carinho.",
    "Estamos treinando juntos.",
    "Observe a letra e tente de novo.",
    "Voc\u00ea est\u00e1 chegando l\u00e1!",
    "Vamos com calma, uma letra por vez.",
    "Sua tentativa tamb\u00e9m ajuda a aprender."
];

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

const pickMessage = (messages, lastMessage) => {
    if (messages.length <= 1) {
        return messages[0] || "";
    }

    const availableMessages = messages.filter((message) => message !== lastMessage);
    return availableMessages[Math.floor(Math.random() * availableMessages.length)] || messages[0];
};

const getSuccessMessage = () => {
    if (window.InkluaFeedback?.getPositivePhrase) {
        return window.InkluaFeedback.getPositivePhrase();
    }

    lastSuccessMessage = pickMessage(successMessages, lastSuccessMessage);
    return lastSuccessMessage;
};

const getTryAgainMessage = () => {
    if (window.InkluaFeedback?.getEncouragementPhrase) {
        return window.InkluaFeedback.getEncouragementPhrase();
    }

    lastTryAgainMessage = pickMessage(tryAgainMessages, lastTryAgainMessage);
    return lastTryAgainMessage;
};

const getSpokenLetter = (letter) => letterNames[letter] || letter;

const speakText = (text, options = {}) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(text, {
            rate: options.rate ?? 0.82,
            pitch: options.pitch ?? 1.16,
            interrupt: options.interrupt ?? true,
            onEnd: options.onEnd
        });
        return;
    }

    refreshVoice();

    if (window.speechSynthesis.getVoices().length === 0) {
        window.setTimeout(() => speakText(text, options), 300);
        return;
    }

    const utterance = createFastUtterance(text);
    utterance.rate = options.rate ?? 0.82;
    utterance.pitch = options.pitch ?? 1.16;

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
    }

    window.speechSynthesis.resume?.();
    window.speechSynthesis.speak(utterance);
};

const celebrateSuccess = () => {
    if (!alphabetDisplay) {
        return;
    }

    const card = alphabetDisplay.querySelector(".alphabet-card");
    const celebration = document.createElement("div");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    celebration.className = "alphabet-celebration";
    celebration.setAttribute("aria-hidden", "true");
    celebration.innerHTML = `
        <span>\u2b50</span>
        <span>\u2728</span>
        <span>\uD83D\uDE0A</span>
        <span>\uD83C\uDF89</span>
        <span>\u2b50</span>
        <span>\u2728</span>
    `;

    alphabetDisplay.querySelector(".alphabet-celebration")?.remove();
    card?.classList.remove("is-celebrating");
    card?.offsetWidth;
    card?.classList.add("is-celebrating");
    alphabetDisplay.append(celebration);

    window.setTimeout(() => {
        celebration.remove();
        card?.classList.remove("is-celebrating");
    }, reducedMotion ? 900 : 1800);
};

const speakAssociation = (letter, isCorrect, message) => {
    const association = alphabetAssociations[letter];
    const spokenLetter = getSpokenLetter(letter);

    if (!association) {
        speakText(spokenLetter);
        return;
    }

    if (isCorrect) {
        speakText(`${spokenLetter} de ${association.word}. ${message}`, { rate: 0.8, pitch: 1.18 });
        return;
    }

    speakText(`${spokenLetter} de ${association.word}. ${message} Aperte a letra ${getSpokenLetter(targetLetter)}.`, { rate: 0.78, pitch: 1.14 });
};

const speakTargetInstruction = () => {
    speakText(`Aperte a letra ${getSpokenLetter(targetLetter)}.`, { rate: 0.78, pitch: 1.15 });
};

const setFeedback = (message, type = "neutral") => {
    if (!alphabetFeedback) {
        return;
    }

    alphabetFeedback.textContent = message;
    alphabetFeedback.classList.toggle("is-success", type === "success");
    alphabetFeedback.classList.toggle("is-help", type === "help");
};

const scheduleHelp = () => {
    window.clearTimeout(helpTimer);
    helpTimer = window.setTimeout(() => {
        const association = alphabetAssociations[targetLetter];

        if (!association) {
            return;
        }

        setFeedback(`Sem pressa. Aperte a letra ${targetLetter}: ${targetLetter} de ${association.displayWord}.`, "help");
        speakText(`Sem pressa. Aperte a letra ${getSpokenLetter(targetLetter)}. ${getSpokenLetter(targetLetter)} de ${association.word}.`, { rate: 0.78 });
    }, 9000);
};

const setNextTarget = () => {
    window.clearTimeout(nextTargetTimer);
    const currentIndex = alphabetLetters.indexOf(targetLetter);
    targetLetter = alphabetLetters[(currentIndex + 1) % alphabetLetters.length] || "A";
    questionStartedAt = Date.now();
    setFeedback(`Agora aperte a letra ${targetLetter}.`, "help");
    speakTargetInstruction();
    scheduleHelp();
};

const scrollAssociationIntoView = () => {
    if (!alphabetDisplay) {
        return;
    }

    window.requestAnimationFrame(() => {
        alphabetDisplay.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
        });
    });
};

const showLetter = (letter, options = {}) => {
    const association = alphabetAssociations[letter];

    if (alphabetDisplay) {
        alphabetDisplay.classList.remove("is-revealing");
        alphabetDisplay.innerHTML = `
            <div class="alphabet-card" style="--alphabet-accent: ${association?.color || "#64b5ff"}">
                <span class="alphabet-card__letter" aria-hidden="true">${letter}</span>
                <span class="alphabet-card__visual" role="img" aria-label="${association?.displayWord || letter}">
                    ${association?.visual || letter}
                </span>
                <strong>${letter} de ${association?.displayWord || letter}</strong>
            </div>
        `;

        window.requestAnimationFrame(() => {
            alphabetDisplay.classList.add("is-revealing");
        });
    }

    if (options.scroll) {
        scrollAssociationIntoView();
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
    const association = alphabetAssociations[letter];
    const successMessage = getSuccessMessage();

    window.clearTimeout(helpTimer);
    window.clearTimeout(nextTargetTimer);
    clearSelection();
    button.classList.add("is-selected", "is-correct");
    showLetter(letter, { scroll: true });

    setFeedback(`${letter} de ${association?.displayWord || letter}. ${successMessage}`, "success");
    speakAssociation(letter, true, successMessage);
    celebrateSuccess();
    window.InkluaGameProgress?.record("alfabeto", {
        title: "Alfabeto Falado",
        skill: "Reconhecimento de letras",
        item: letter,
        selected: letter,
        question: `${letter} de ${association?.displayWord || letter}`,
        correct: true,
        level: 1,
        maxLevel: 1,
        totalItems: alphabetLetters.length,
        responseTimeMs: Date.now() - questionStartedAt
    });
    questionStartedAt = Date.now();
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
setFeedback("Escolha uma letra para ouvir e aprender.", "help");
