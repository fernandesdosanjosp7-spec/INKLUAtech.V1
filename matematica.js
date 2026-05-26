const elements = {
    body: document.body,
    modeLabel: document.getElementById("mathModeLabel"),
    title: document.getElementById("math-question-title"),
    expression: document.getElementById("mathExpression"),
    scene: document.getElementById("visualScene"),
    options: document.getElementById("mathOptions"),
    feedback: document.getElementById("mathFeedback"),
    guide: document.getElementById("guideMessage"),
    stars: document.getElementById("mathStars"),
    progressBar: document.getElementById("mathProgressBar"),
    helpButton: document.getElementById("helpButton"),
    repeatButton: document.getElementById("repeatButton"),
    nextButton: document.getElementById("nextButton"),
    themeSelect: document.getElementById("themeSelect"),
    colorSelect: document.getElementById("colorSelect"),
    stimulusSelect: document.getElementById("stimulusSelect"),
    soundToggle: document.getElementById("soundToggle"),
    voiceToggle: document.getElementById("voiceToggle"),
    volumeControl: document.getElementById("volumeControl"),
    panelLevel: document.getElementById("panelLevel"),
    panelCorrect: document.getElementById("panelCorrect"),
    panelWrong: document.getElementById("panelWrong"),
    panelAccuracy: document.getElementById("panelAccuracy"),
    panelTime: document.getElementById("panelTime"),
    panelDifficulty: document.getElementById("panelDifficulty"),
    panelMedal: document.getElementById("panelMedal"),
    difficultyNote: document.getElementById("difficultyNote")
};

const preferencesKey = "inklua_math_preferences_v1";
const gameId = "matematica-visual";
const totalItems = 36;

const themes = {
    natureza: [
        { id: "apple", label: "maca" },
        { id: "flower", label: "flor" },
        { id: "leaf", label: "folha" },
        { id: "sun", label: "sol" }
    ],
    espaco: [
        { id: "star", label: "estrela" },
        { id: "planet", label: "planeta" },
        { id: "moon", label: "lua" },
        { id: "rocket", label: "foguete" }
    ],
    animais: [
        { id: "fish", label: "peixe" },
        { id: "bird", label: "passaro" },
        { id: "cat", label: "gatinho" },
        { id: "rabbit", label: "coelho" }
    ],
    dinossauros: [
        { id: "egg", label: "ovo" },
        { id: "footprint", label: "pegada" },
        { id: "leaf", label: "folha" },
        { id: "dino", label: "dino" }
    ],
    carros: [
        { id: "car", label: "carro" },
        { id: "wheel", label: "roda" },
        { id: "cone", label: "cone" },
        { id: "light", label: "farol" }
    ],
    tecnologia: [
        { id: "block", label: "bloco" },
        { id: "button", label: "botao" },
        { id: "chip", label: "chip" },
        { id: "robot", label: "robo" }
    ]
};

const modeLabels = {
    counting: "Contagem",
    number: "Reconhecimento numerico",
    association: "Quantidade e numero",
    addition: "Soma",
    subtraction: "Subtracao",
    sequence: "Sequencia logica",
    multiplication: "Multiplicacao",
    division: "Divisao"
};

const modeSkills = {
    counting: "Contagem",
    number: "Reconhecimento numerico",
    association: "Associacao quantidade-numero",
    addition: "Soma",
    subtraction: "Subtracao",
    sequence: "Sequencia logica",
    multiplication: "Multiplicacao",
    division: "Divisao"
};

let state = {
    level: 1,
    difficulty: 1,
    correct: 0,
    wrong: 0,
    streak: 0,
    mistakes: {},
    current: null,
    answered: false,
    helped: false,
    startedAt: Date.now()
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
let speechRequestId = 0;

const normalizeVoiceText = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const scoreSoftFemaleVoice = (voice) => {
    const text = normalizeVoiceText(`${voice.name} ${voice.voiceURI}`);
    const femaleNames = ["ana", "beatriz", "camila", "carolina", "francisca", "fernanda", "helena", "luciana", "maria", "patricia", "raquel", "vitoria"];
    const maleNames = ["antonio", "bruno", "carlos", "daniel", "felipe", "joaquim", "paulo", "ricardo", "thiago"];
    let score = 0;

    if (voice.lang?.toLowerCase() === "pt-br") score += 50;
    if (voice.lang?.toLowerCase().startsWith("pt")) score += 30;
    if (femaleNames.some((name) => text.includes(name))) score += 500;
    if (maleNames.some((name) => text.includes(name))) score -= 1000;
    if (text.includes("female") || text.includes("feminina") || text.includes("woman")) score += 450;
    if (text.includes("male") || text.includes("masculina") || text.includes("homem")) score -= 1000;
    if (text.includes("suave") || text.includes("soft") || text.includes("doce")) score += 140;
    if (text.includes("natural") || text.includes("neural")) score += 90;
    if (text.includes("microsoft") || text.includes("google")) score += 25;

    return score;
};

const getSoftFemaleVoice = () => {
    if (!("speechSynthesis" in window)) {
        return null;
    }

    const voices = window.speechSynthesis.getVoices();
    const portugueseVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt"));

    return [...portugueseVoices, ...voices]
        .sort((first, second) => scoreSoftFemaleVoice(second) - scoreSoftFemaleVoice(first))[0] || null;
};

const createMathUtterance = (text) => {
    const utterance = window.InkluaSpeech?.createUtterance(text) || new SpeechSynthesisUtterance(text);
    const voice = getSoftFemaleVoice();

    utterance.lang = voice?.lang || "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1.18;
    utterance.volume = Number(elements.volumeControl.value) || 0.6;

    if (voice) {
        utterance.voice = voice;
    }

    return utterance;
};

const readPreferences = () => {
    try {
        return JSON.parse(localStorage.getItem(preferencesKey)) || {};
    } catch (error) {
        return {};
    }
};

const savePreferences = () => {
    const preferences = {
        theme: elements.themeSelect.value,
        color: elements.colorSelect.value,
        stimulus: elements.stimulusSelect.value,
        sound: elements.soundToggle.checked,
        voice: elements.voiceToggle.checked,
        volume: elements.volumeControl.value
    };

    localStorage.setItem(preferencesKey, JSON.stringify(preferences));
    applyPreferences();
};

const applyPreferences = () => {
    elements.body.dataset.mathTheme = elements.themeSelect.value;
    elements.body.dataset.mathColor = elements.colorSelect.value;
    elements.body.dataset.mathStimulus = elements.stimulusSelect.value;
};

const hydratePreferences = () => {
    const preferences = readPreferences();

    if (preferences.theme) elements.themeSelect.value = preferences.theme;
    if (preferences.color) elements.colorSelect.value = preferences.color;
    if (preferences.stimulus) elements.stimulusSelect.value = preferences.stimulus;
    if (typeof preferences.sound === "boolean") elements.soundToggle.checked = preferences.sound;
    if (typeof preferences.voice === "boolean") elements.voiceToggle.checked = preferences.voice;
    if (preferences.volume) elements.volumeControl.value = preferences.volume;

    applyPreferences();
};

const speak = (text) => {
    if (!elements.voiceToggle.checked || !("speechSynthesis" in window)) {
        return;
    }

    speechRequestId += 1;
    const currentRequestId = speechRequestId;
    const speakNow = () => {
        if (currentRequestId !== speechRequestId) {
            return;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(createMathUtterance(text));
    };

    if (window.speechSynthesis.getVoices().length > 0) {
        speakNow();
        return;
    }

    const previousVoiceHandler = window.speechSynthesis.onvoiceschanged;

    window.speechSynthesis.onvoiceschanged = () => {
        if (typeof previousVoiceHandler === "function") {
            previousVoiceHandler.call(window.speechSynthesis);
        }

        window.speechSynthesis.onvoiceschanged = previousVoiceHandler;
        speakNow();
    };

    window.setTimeout(speakNow, 450);
};

const playTone = (correct) => {
    if (!elements.soundToggle.checked || !window.AudioContext) {
        return;
    }

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const volume = Number(elements.volumeControl.value) || 0.6;

    oscillator.type = "sine";
    oscillator.frequency.value = correct ? 520 : 260;
    gain.gain.value = 0.035 * volume;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
    oscillator.stop(context.currentTime + 0.24);
};

const getAvailableModes = () => {
    if (state.difficulty <= 1) return ["counting", "number", "association"];
    if (state.difficulty === 2) return ["counting", "association", "addition", "subtraction", "sequence"];
    if (state.difficulty === 3) return ["addition", "subtraction", "sequence", "multiplication"];
    return ["addition", "subtraction", "multiplication", "division", "sequence"];
};

const chooseMode = () => {
    const repeatedMode = Object.entries(state.mistakes)
        .filter(([, count]) => count >= 2)
        .sort((first, second) => second[1] - first[1])[0]?.[0];

    if (repeatedMode && Math.random() < 0.55) {
        return repeatedMode;
    }

    return shuffle(getAvailableModes())[0];
};

const getMaxNumber = () => [5, 8, 12, 20][clamp(state.difficulty - 1, 0, 3)];

const createQuestion = () => {
    const mode = chooseMode();
    const max = getMaxNumber();
    let question = { mode, answer: 0, groups: [], sequence: [], prompt: "", expression: "" };

    if (mode === "counting" || mode === "association") {
        const total = randomInt(1, max);
        question = {
            ...question,
            answer: total,
            groups: [total],
            prompt: mode === "counting" ? "Quantos objetos aparecem?" : "Qual numero combina com a quantidade?",
            expression: "Conte os objetos com calma."
        };
    }

    if (mode === "number") {
        const number = randomInt(0, max);
        question = {
            ...question,
            answer: number,
            groups: [number],
            prompt: "Encontre o numero mostrado.",
            expression: `Numero ${number}`
        };
    }

    if (mode === "addition") {
        const first = randomInt(1, Math.max(2, Math.floor(max / 2)));
        const second = randomInt(1, Math.max(2, max - first));
        question = {
            ...question,
            answer: first + second,
            groups: [first, second],
            prompt: "Quanto fica juntando os dois grupos?",
            expression: `${first} + ${second}`
        };
    }

    if (mode === "subtraction") {
        const first = randomInt(3, max);
        const second = randomInt(1, first - 1);
        question = {
            ...question,
            answer: first - second,
            groups: [first, -second],
            prompt: "Quantos ficam depois de tirar?",
            expression: `${first} - ${second}`
        };
    }

    if (mode === "multiplication") {
        const first = randomInt(2, clamp(state.difficulty + 1, 2, 5));
        const second = randomInt(2, 5);
        question = {
            ...question,
            answer: first * second,
            groups: Array.from({ length: first }, () => second),
            prompt: "Quanto fica com grupos iguais?",
            expression: `${first} x ${second}`
        };
    }

    if (mode === "division") {
        const divisor = randomInt(2, 5);
        const answer = randomInt(2, 5);
        question = {
            ...question,
            answer,
            groups: Array.from({ length: divisor }, () => answer),
            prompt: "Dividindo em partes iguais, quanto fica em cada grupo?",
            expression: `${divisor * answer} / ${divisor}`
        };
    }

    if (mode === "sequence") {
        const step = randomInt(1, state.difficulty >= 3 ? 4 : 2);
        const start = randomInt(1, 6);
        const missingIndex = randomInt(2, 4);
        const sequence = Array.from({ length: 5 }, (_, index) => start + (index * step));
        question = {
            ...question,
            answer: sequence[missingIndex],
            sequence,
            missingIndex,
            groups: [],
            prompt: "Qual numero completa a sequencia?",
            expression: sequence.map((item, index) => index === missingIndex ? "?" : item).join("  ")
        };
    }

    question.options = createOptions(question.answer, max);
    return question;
};

const createOptions = (answer, max) => {
    const options = new Set([answer]);
    const spread = Math.max(3, Math.ceil(max / 2));

    while (options.size < 4) {
        options.add(clamp(answer + randomInt(-spread, spread), 0, Math.max(max + 8, answer + spread)));
    }

    return shuffle(Array.from(options));
};

const getThemeItems = () => themes[elements.themeSelect.value] || themes.natureza;

const renderObjects = (count, crossed = false) => {
    const items = getThemeItems();
    const maxVisible = elements.stimulusSelect.value === "baixo" ? 12 : 20;
    const visibleCount = Math.min(Math.abs(count), maxVisible);

    return Array.from({ length: visibleCount }, (_, index) => `
        <span class="math-object math-object--${items[index % items.length].id} ${crossed ? "math-object--removed" : ""}" role="img" aria-label="${items[index % items.length].label}">
            <span aria-hidden="true"></span>
        </span>
    `).join("");
};

const renderScene = (question) => {
    if (question.mode === "sequence") {
        elements.scene.innerHTML = `
            <div class="math-sequence">
                ${question.sequence.map((item, index) => `
                    <span class="${index === question.missingIndex ? "is-missing" : ""}">${index === question.missingIndex ? "?" : item}</span>
                `).join("")}
            </div>
        `;
        return;
    }

    if (question.mode === "number") {
        elements.scene.innerHTML = `<div class="math-big-number">${question.answer}</div>`;
        return;
    }

    elements.scene.innerHTML = question.groups.map((group, index) => `
        <div class="math-object-group">
            ${index > 0 ? `<span class="math-group-sign">${group < 0 ? "-" : "+"}</span>` : ""}
            <div>${renderObjects(group, group < 0)}</div>
        </div>
    `).join("");
};

const renderQuestion = () => {
    state.current = createQuestion();
    state.answered = false;
    state.helped = false;
    state.startedAt = Date.now();

    elements.modeLabel.textContent = modeLabels[state.current.mode];
    elements.title.textContent = state.current.prompt;
    elements.expression.textContent = state.current.expression;
    elements.feedback.textContent = "";
    elements.guide.textContent = "Observe primeiro. Depois escolha uma resposta.";
    elements.nextButton.disabled = true;

    renderScene(state.current);
    renderOptions();
    updatePanel();
    speak(`${modeLabels[state.current.mode]}. ${state.current.prompt}. ${state.current.expression}.`);
};

const renderOptions = () => {
    elements.options.innerHTML = state.current.options.map((option) => `
        <button class="math-option" type="button" data-answer="${option}">${option}</button>
    `).join("");

    elements.options.querySelectorAll(".math-option").forEach((button) => {
        button.addEventListener("click", () => answerQuestion(Number(button.dataset.answer), button));
    });
};

const answerQuestion = (answer, button) => {
    if (state.answered) {
        return;
    }

    const correct = answer === state.current.answer;
    const responseTimeMs = Date.now() - state.startedAt;
    state.answered = true;
    button.classList.add(correct ? "is-correct" : "is-wrong");

    if (correct) {
        state.correct += 1;
        state.streak += 1;
        elements.feedback.textContent = "Muito bem. Voce conseguiu.";
        elements.guide.textContent = "Resposta certa. Vamos para a proxima com calma.";
        playTone(true);
        adaptAfterCorrect();
    } else {
        state.wrong += 1;
        state.streak = 0;
        state.mistakes[state.current.mode] = (state.mistakes[state.current.mode] || 0) + 1;
        elements.feedback.textContent = `Quase. A resposta era ${state.current.answer}. Vamos repetir com apoio visual.`;
        elements.guide.textContent = "Tudo bem errar. O jogo vai oferecer uma atividade mais simples.";
        elements.options.querySelector(`[data-answer="${state.current.answer}"]`)?.classList.add("is-correct");
        playTone(false);
        adaptAfterWrong();
    }

    elements.nextButton.disabled = false;
    recordProgress(correct, responseTimeMs);
    updatePanel();
    speak(correct ? "Muito bem. Voce conseguiu." : `Quase. A resposta era ${state.current.answer}. Vamos tentar com mais apoio.`);
};

const adaptAfterCorrect = () => {
    if (state.streak >= 4) {
        state.difficulty = clamp(state.difficulty + 1, 1, 4);
        state.streak = 0;
    }
};

const adaptAfterWrong = () => {
    if (state.mistakes[state.current.mode] >= 2 || state.wrong > state.correct) {
        state.difficulty = clamp(state.difficulty - 1, 1, 4);
    }
};

const recordProgress = (correct, responseTimeMs) => {
    const game = window.InkluaGameProgress?.read?.().games?.[gameId];
    const level = window.InkluaGameProgress?.getLevelState?.(Number(game?.correct) || 0)?.level || 1;

    window.InkluaGameProgress?.record(gameId, {
        title: "Matematica Visual",
        skill: "Matematica visual",
        item: modeSkills[state.current.mode],
        correct,
        totalItems,
        mode: modeLabels[state.current.mode],
        difficulty: `Nivel adaptativo ${state.difficulty}`,
        responseTimeMs,
        helpUsed: state.helped,
        completed: level >= 6
    });
};

const updatePanel = () => {
    const progress = window.InkluaGameProgress?.read?.();
    const game = progress?.games?.[gameId];
    const correct = Number(game?.correct) || state.correct;
    const wrong = Number(game?.wrong) || state.wrong;
    const answered = correct + wrong;
    const level = Number(game?.level) || window.InkluaGameProgress?.getLevelState?.(correct)?.level || 1;
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    const averageMs = Number(game?.averageResponseMs) || 0;
    const stars = Math.min(Math.floor(correct / 3), 3);

    elements.panelLevel.textContent = level;
    elements.panelCorrect.textContent = correct;
    elements.panelWrong.textContent = wrong;
    elements.panelAccuracy.textContent = `${accuracy}%`;
    elements.panelTime.textContent = averageMs ? `${(averageMs / 1000).toFixed(1)}s` : "0s";
    elements.panelDifficulty.textContent = `Nivel ${state.difficulty}`;
    elements.panelMedal.textContent = getMedal(correct);
    elements.stars.textContent = `${"★ ".repeat(stars)}${"☆ ".repeat(3 - stars)}`.trim();
    elements.progressBar.style.width = `${Math.min(((correct % 5) / 5) * 100, 100)}%`;
    elements.difficultyNote.textContent = getDifficultyNote();
};

const getMedal = (correct) => {
    if (correct >= 25) return "Ouro";
    if (correct >= 15) return "Prata";
    if (correct >= 8) return "Bronze";
    return "Inicio";
};

const getDifficultyNote = () => {
    const repeated = Object.entries(state.mistakes).filter(([, count]) => count >= 2).map(([mode]) => modeLabels[mode]);

    if (repeated.length) {
        return `Reforco planejado em: ${repeated.join(", ")}.`;
    }

    if (state.difficulty <= 1) {
        return "Atividades com mais apoio visual e numeros menores.";
    }

    if (state.difficulty >= 4) {
        return "O aluno esta pronto para desafios maiores.";
    }

    return "O jogo ajusta a dificuldade conforme acertos, erros e repeticoes.";
};

const showHelp = () => {
    state.helped = true;
    elements.feedback.textContent = "Dica: conte os objetos um por um ou observe os grupos separados.";
    elements.scene.classList.add("is-helping");
    speak("Dica. Conte os objetos um por um. Voce pode usar os grupos para ajudar.");

    window.setTimeout(() => elements.scene.classList.remove("is-helping"), 1200);
};

hydratePreferences();
renderQuestion();

[elements.themeSelect, elements.colorSelect, elements.stimulusSelect, elements.soundToggle, elements.voiceToggle, elements.volumeControl]
    .forEach((control) => control.addEventListener("change", savePreferences));

elements.helpButton.addEventListener("click", showHelp);
elements.repeatButton.addEventListener("click", () => speak(`${state.current.prompt}. ${state.current.expression}.`));
elements.nextButton.addEventListener("click", renderQuestion);
