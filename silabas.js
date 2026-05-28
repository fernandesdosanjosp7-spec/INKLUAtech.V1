const syllableLetters = document.getElementById("syllableLetters");
const syllableQuestion = document.getElementById("syllableQuestion");
const syllableOptions = document.getElementById("syllableOptions");
const syllableFeedback = document.getElementById("syllableFeedback");
const syllablePrompt = document.getElementById("syllablePrompt");
const syllableStep = document.getElementById("syllableStep");
const syllableTotal = document.getElementById("syllableTotal");
const nextSyllable = document.getElementById("nextSyllable");
const restartSyllable = document.getElementById("restartSyllable");

const syllableRounds = [
    { letters: "A + I", answer: "AI", options: ["AI", "IA", "OI", "AU"], word: "ai" },
    { letters: "O + I", answer: "OI", options: ["UI", "OI", "IO", "AI"], word: "oi" },
    { letters: "A + U", answer: "AU", options: ["UA", "EU", "AU", "AI"], word: "au" },
    { letters: "E + U", answer: "EU", options: ["OU", "EU", "UA", "EI"], word: "eu" },
    { letters: "U + A", answer: "UA", options: ["AU", "IA", "UA", "OU"], word: "ua" },
    { letters: "B + A", answer: "BA", options: ["BA", "BE", "DA", "PA"], word: "ba" },
    { letters: "M + E", answer: "ME", options: ["NE", "ME", "MI", "MA"], word: "me" },
    { letters: "P + I", answer: "PI", options: ["BI", "PI", "PA", "PE"], word: "pi" },
    { letters: "L + O", answer: "LO", options: ["LA", "LU", "LO", "RO"], word: "lo" },
    { letters: "T + U", answer: "TU", options: ["TU", "DU", "TO", "TA"], word: "tu" },
    { letters: "C + A", answer: "CA", options: ["CA", "CO", "GA", "BA"], word: "ca" },
    { letters: "F + E", answer: "FE", options: ["VE", "FA", "FE", "FO"], word: "fe" },
    { letters: "N + I", answer: "NI", options: ["MI", "NA", "NO", "NI"], word: "ni" },
    { letters: "R + O", answer: "RO", options: ["RO", "LO", "RA", "RU"], word: "ro" },
    { letters: "S + U", answer: "SU", options: ["SU", "SO", "ZU", "SA"], word: "su" },
    { letters: "B + E", answer: "BE", options: ["BE", "BA", "PE", "DE"], word: "be" },
    { letters: "D + A", answer: "DA", options: ["BA", "DA", "DE", "TA"], word: "da" },
    { letters: "G + O", answer: "GO", options: ["CO", "GU", "GO", "GA"], word: "go" },
    { letters: "J + A", answer: "JA", options: ["JA", "ZA", "JO", "GA"], word: "ja" },
    { letters: "V + E", answer: "VE", options: ["FE", "VE", "VA", "VO"], word: "ve" },
    { letters: "BO + LA", answer: "BOLA", options: ["BOLA", "BOLO", "BALA", "BELA"], word: "bola", type: "word" },
    { letters: "CA + SA", answer: "CASA", options: ["CASA", "CAMA", "CARA", "CAPA"], word: "casa", type: "word" },
    { letters: "PA + TO", answer: "PATO", options: ["PATO", "POTE", "PATA", "GATO"], word: "pato", type: "word" },
    { letters: "MA + LA", answer: "MALA", options: ["MALA", "MOLA", "MILA", "MATA"], word: "mala", type: "word" },
    { letters: "BO + CA", answer: "BOCA", options: ["BOCA", "BOLA", "BOTA", "BOLO"], word: "boca", type: "word" },
    { letters: "LU + A", answer: "LUA", options: ["LUA", "LIA", "LUAU", "RUA"], word: "lua", type: "word" },
    { letters: "ME + SA", answer: "MESA", options: ["MESA", "MALA", "MUSA", "MOLA"], word: "mesa", type: "word" },
    { letters: "DA + DO", answer: "DADO", options: ["DADO", "DEDO", "DIA", "DONA"], word: "dado", type: "word" },
    { letters: "SA + PO", answer: "SAPO", options: ["SAPO", "SOPA", "SACO", "SINO"], word: "sapo", type: "word" },
    { letters: "PI + PA", answer: "PIPA", options: ["PIPA", "PATO", "PIPO", "PENA"], word: "pipa", type: "word" },
    { letters: "FO + CA", answer: "FOCA", options: ["FOCA", "FACA", "FITA", "FOTO"], word: "foca", type: "word" },
    { letters: "VA + CA", answer: "VACA", options: ["VACA", "VILA", "VAGA", "VELA"], word: "vaca", type: "word" },
    { letters: "Z + I", answer: "ZI", options: ["SI", "ZA", "ZI", "ZO"], word: "zi" },
    { letters: "CH + A", answer: "CHA", options: ["CA", "CHA", "XA", "JA"], word: "cha" },
    { letters: "LH + O", answer: "LHO", options: ["LO", "LHO", "RO", "LHA"], word: "lho" },
    { letters: "NH + A", answer: "NHA", options: ["NA", "NHA", "MA", "NHO"], word: "nha" },
    { letters: "BR + A", answer: "BRA", options: ["BA", "BRA", "BAR", "PRA"], word: "bra" },
    { letters: "PR + E", answer: "PRE", options: ["PE", "PER", "PRE", "BRE"], word: "pre" },
    { letters: "TR + I", answer: "TRI", options: ["TI", "TRI", "TIR", "DRI"], word: "tri" },
    { letters: "CL + O", answer: "CLO", options: ["CO", "CLO", "COL", "GLO"], word: "clo" },
    { letters: "FL + U", answer: "FLU", options: ["FU", "FUL", "FLU", "VLU"], word: "flu" },
    { letters: "GR + A", answer: "GRA", options: ["GA", "GAR", "GRA", "CRA"], word: "gra" },
    { letters: "PL + E", answer: "PLE", options: ["PE", "PLE", "PEL", "BLE"], word: "ple" },
    { letters: "DR + O", answer: "DRO", options: ["DO", "DRO", "DOR", "TRO"], word: "dro" },
    { letters: "FR + A", answer: "FRA", options: ["FA", "FRA", "FAR", "VRA"], word: "fra" },
    { letters: "CR + U", answer: "CRU", options: ["CU", "CUR", "CRU", "GRU"], word: "cru" },
    { letters: "BL + I", answer: "BLI", options: ["BI", "BIL", "BLI", "PLI"], word: "bli" },
    { letters: "GL + A", answer: "GLA", options: ["GA", "GLA", "GAL", "CLA"], word: "gla" },
    { letters: "VR + O", answer: "VRO", options: ["VO", "VOR", "VRO", "FRO"], word: "vro" },
    { letters: "QU + E", answer: "QUE", options: ["QE", "QUE", "CE", "GUE"], word: "que" }
];

let currentRound = 0;
let canContinue = false;
let answeredQuestions = 0;
let questionStartedAt = Date.now();

const getLevel = () => Math.min(Math.floor(answeredQuestions / 5) + 1, 8);

const letterSpeechNames = {
    A: "á",
    E: "ê",
    I: "i",
    O: "ó",
    U: "u",
    B: "bê",
    C: "cê",
    D: "dê",
    F: "éfe",
    G: "gê",
    J: "jóta",
    L: "éle",
    M: "ême",
    N: "êne",
    P: "pê",
    R: "érre",
    S: "ésse",
    T: "tê",
    V: "vê",
    Z: "zê"
};

const syllableSpeechNames = {
    AI: "ai",
    OI: "ói",
    AU: "au",
    EU: "êu",
    UA: "uá",
    BA: "bá",
    BE: "bê",
    BI: "bi",
    BO: "bô",
    CA: "cá",
    CE: "cê",
    CO: "cô",
    DA: "dá",
    DE: "dê",
    DO: "dô",
    FA: "fá",
    FE: "fê",
    FO: "fô",
    GA: "gá",
    GO: "gô",
    JA: "já",
    JO: "jó",
    LA: "lá",
    LE: "lê",
    LO: "lô",
    LU: "lu",
    MA: "má",
    ME: "mê",
    MI: "mi",
    MO: "mô",
    NA: "ná",
    NE: "nê",
    NI: "ni",
    NO: "nô",
    PA: "pá",
    PE: "pê",
    PI: "pi",
    PO: "pô",
    RA: "rá",
    RO: "rô",
    RU: "ru",
    SA: "sá",
    SO: "sô",
    SU: "su",
    TA: "tá",
    TO: "tô",
    TU: "tu",
    VE: "vê",
    VA: "vá",
    VO: "vô",
    ZA: "zá",
    ZI: "zi",
    ZO: "zô",
    CHA: "chá",
    LHO: "lhô",
    NHA: "nhá",
    NHO: "nhô",
    BRA: "brá",
    PRE: "prê",
    TRI: "tri",
    CLO: "clô",
    FLU: "flu",
    GRA: "grá",
    PLE: "plê",
    DRO: "drô",
    FRA: "frá",
    CRU: "cru",
    BLI: "bli",
    GLA: "glá",
    VRO: "vrô",
    QUE: "quê"
};

const getSpokenChunk = (chunk) => {
    const normalized = String(chunk || "").trim().toUpperCase();
    return syllableSpeechNames[normalized] || letterSpeechNames[normalized] || normalized.toLowerCase();
};

const getSpokenLetters = (letters) => String(letters || "")
    .split("+")
    .map(getSpokenChunk)
    .join(" mais ");

const getSpokenAnswer = (round) => {
    if (round.type === "word") {
        return round.word;
    }

    return syllableSpeechNames[round.answer] || round.word || round.answer.toLowerCase();
};

const speakSyllable = (text) => {
    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(text);
        return;
    }

    const utterance = window.InkluaSpeech?.createUtterance(text) || new SpeechSynthesisUtterance(text);
    utterance.lang = utterance.lang || "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1.16;
    window.speechSynthesis.speak(utterance);
};

const recordSyllable = (round, selected, isCorrect, completed = false) => {
    window.InkluaGameProgress?.record("silabas", {
        title: "Jogo das Silabas",
        skill: "Alfabetizacao",
        item: round.answer,
        selected,
        question: round.letters,
        correct: isCorrect,
        completed,
        totalItems: syllableRounds.length,
        level: getLevel(),
        maxLevel: 8,
        responseTimeMs: Date.now() - questionStartedAt
    });
};

const renderRound = () => {
    const round = syllableRounds[currentRound];
    const isWordRound = round.type === "word";

    canContinue = false;
    questionStartedAt = Date.now();
    syllableLetters.textContent = round.letters;
    if (syllablePrompt) {
        syllablePrompt.textContent = isWordRound ? "Qual palavra forma?" : "Qual silaba forma?";
    }
    syllableQuestion.innerHTML = `
        <span class="game-level-pill">Nivel ${getLevel()}</span>
        <strong>${round.letters}</strong>
        <small>${isWordRound ? "junta e forma..." : "forma..."}</small>
    `;
    syllableFeedback.textContent = "";
    syllableStep.textContent = String(currentRound + 1);
    syllableTotal.textContent = String(syllableRounds.length);
    nextSyllable.disabled = true;
    nextSyllable.textContent = currentRound === syllableRounds.length - 1 ? "Finalizar" : "Proxima";
    syllableOptions.innerHTML = round.options.map((option) => `
        <button class="syllable-option" type="button" data-option="${option}">${option}</button>
    `).join("");

    speakSyllable(`${getSpokenLetters(round.letters)}. ${isWordRound ? "Qual palavra forma?" : "Qual som forma?"}`);
};

const finishGame = () => {
    syllableLetters.textContent = "Muito bem!";
    syllableQuestion.textContent = "Atividade concluida";
    syllableOptions.innerHTML = "";
    syllableFeedback.textContent = "Voce completou o Jogo das Silabas.";
    nextSyllable.hidden = true;
    restartSyllable.hidden = false;

    window.InkluaGameProgress?.record("silabas", {
        title: "Jogo das Silabas",
        skill: "Alfabetizacao",
        item: "finalizado",
        completed: true,
        totalItems: syllableRounds.length,
        level: getLevel(),
        maxLevel: 8
    });

    speakSyllable("Atividade concluida. Muito bem!");
};

const selectOption = (button) => {
    const round = syllableRounds[currentRound];
    const selected = button.dataset.option || "";
    const isCorrect = selected === round.answer;

    answeredQuestions += 1;

    syllableOptions.querySelectorAll(".syllable-option").forEach((option) => {
        option.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    button.classList.add("is-selected");

    if (isCorrect) {
        button.classList.add("is-correct");
        syllableFeedback.textContent = `Isso mesmo! ${round.letters} forma ${round.answer}.`;
        canContinue = true;
        nextSyllable.disabled = false;
        recordSyllable(round, selected, true);
        speakSyllable(`${getSpokenAnswer(round)}. Muito bem.`);
        return;
    }

    button.classList.add("is-wrong");
    syllableFeedback.textContent = "Boa tentativa. Observe a plaquinha e tente novamente.";
    recordSyllable(round, selected, false);
    speakSyllable("Boa tentativa. Tente novamente.");
};

const goToNextRound = () => {
    if (!canContinue) {
        return;
    }

    if (currentRound === syllableRounds.length - 1) {
        finishGame();
        return;
    }

    currentRound += 1;
    renderRound();
};

const restartGame = () => {
    currentRound = 0;
    answeredQuestions = 0;
    nextSyllable.hidden = false;
    restartSyllable.hidden = true;
    renderRound();
};

syllableOptions.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".syllable-option") : null;

    if (button) {
        selectOption(button);
    }
});

nextSyllable.addEventListener("click", goToNextRound);
restartSyllable.addEventListener("click", restartGame);

renderRound();
