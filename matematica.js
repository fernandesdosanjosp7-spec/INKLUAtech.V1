const gameId = "matematica-visual";
const totalItems = 36;
const preferencesKey = "inklua_math_preferences_v1";

const elements = {
    mode: document.getElementById("mathModeLabel"),
    title: document.getElementById("mathQuestionTitle"),
    expression: document.getElementById("mathExpression"),
    scene: document.getElementById("visualScene"),
    options: document.getElementById("mathOptions"),
    feedback: document.getElementById("mathFeedback"),
    guide: document.getElementById("guideMessage"),
    progress: document.getElementById("mathProgressBar"),
    help: document.getElementById("helpButton"),
    repeat: document.getElementById("repeatButton"),
    next: document.getElementById("nextButton"),
    theme: document.getElementById("themeSelect"),
    voice: document.getElementById("voiceToggle"),
    sound: document.getElementById("soundToggle"),
    volume: document.getElementById("volumeControl"),
    level: document.getElementById("panelLevel"),
    correct: document.getElementById("panelCorrect"),
    wrong: document.getElementById("panelWrong"),
    accuracy: document.getElementById("panelAccuracy"),
    difficulty: document.getElementById("panelDifficulty"),
    medal: document.getElementById("panelMedal")
};

const themeObjects = {
    natureza: [
        { id: "apple", icon: "🍎", label: "maca" },
        { id: "flower", icon: "🌸", label: "flor" },
        { id: "leaf", icon: "🍃", label: "folha" },
        { id: "sun", icon: "☀️", label: "sol" }
    ],
    espaco: [
        { id: "star", icon: "⭐", label: "estrela" },
        { id: "planet", icon: "🪐", label: "planeta" },
        { id: "moon", icon: "🌙", label: "lua" },
        { id: "rocket", icon: "🚀", label: "foguete" }
    ],
    animais: [
        { id: "fish", icon: "🐟", label: "peixe" },
        { id: "bird", icon: "🐦", label: "passaro" },
        { id: "cat", icon: "🐱", label: "gato" },
        { id: "rabbit", icon: "🐰", label: "coelho" }
    ],
    carros: [
        { id: "car", icon: "🚗", label: "carro" },
        { id: "wheel", icon: "⚙️", label: "roda" },
        { id: "cone", icon: "🔺", label: "cone" },
        { id: "light", icon: "💡", label: "luz" }
    ],
    tecnologia: [
        { id: "block", icon: "🟦", label: "bloco" },
        { id: "button", icon: "🔘", label: "botao" },
        { id: "chip", icon: "🔲", label: "chip" },
        { id: "robot", icon: "🤖", label: "robo" }
    ]
};

const labels = {
    counting: "Contagem",
    addition: "Soma",
    subtraction: "Subtracao",
    sequence: "Sequencia logica",
    multiplication: "Multiplicacao",
    division: "Divisao"
};

let state = {
    difficulty: 1,
    correct: 0,
    wrong: 0,
    answeredQuestions: Number(window.InkluaGameProgress?.read?.()?.games?.[gameId]?.attempts) || 0,
    streak: 0,
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

const scoreFemaleVoice = (voice) => {
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

    return score;
};

const getFemaleVoice = () => {
    if (!("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    const portugueseVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt"));

    return [...portugueseVoices, ...voices]
        .sort((first, second) => scoreFemaleVoice(second) - scoreFemaleVoice(first))[0] || null;
};

const createFemaleUtterance = (text) => {
    const utterance = window.InkluaSpeech?.createUtterance(text) || new SpeechSynthesisUtterance(text);
    const voice = getFemaleVoice();

    utterance.lang = voice?.lang || "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1.18;
    utterance.volume = Number(elements.volume.value) || 0.6;

    if (voice) {
        utterance.voice = voice;
    }

    return utterance;
};

const loadPreferences = () => {
    try {
        const preferences = JSON.parse(localStorage.getItem(preferencesKey)) || {};
        if (preferences.theme && Array.from(elements.theme.options).some((option) => option.value === preferences.theme)) {
            elements.theme.value = preferences.theme;
        }
        if (typeof preferences.voice === "boolean") elements.voice.checked = preferences.voice;
        if (typeof preferences.sound === "boolean") elements.sound.checked = preferences.sound;
        if (preferences.volume) elements.volume.value = preferences.volume;
    } catch (error) {}
};

const savePreferences = () => {
    localStorage.setItem(preferencesKey, JSON.stringify({
        theme: elements.theme.value,
        voice: elements.voice.checked,
        sound: elements.sound.checked,
        volume: elements.volume.value
    }));
};

const speak = (text) => {
    if (!elements.voice.checked || !("speechSynthesis" in window)) return;

    speechRequestId += 1;
    const currentRequestId = speechRequestId;
    const speakNow = () => {
        if (currentRequestId !== speechRequestId) return;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(createFemaleUtterance(text));
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
    if (!elements.sound.checked || !window.AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = correct ? 520 : 260;
    gain.gain.value = 0.025 * (Number(elements.volume.value) || 0.6);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
    oscillator.stop(context.currentTime + 0.22);
};

const getModes = () => {
    if (state.difficulty === 1) return ["counting", "addition"];
    if (state.difficulty === 2) return ["counting", "addition", "subtraction", "sequence"];
    if (state.difficulty === 3) return ["addition", "subtraction", "sequence", "multiplication"];
    return ["addition", "subtraction", "multiplication", "division", "sequence"];
};

const createOptions = (answer) => {
    const options = new Set([answer]);
    while (options.size < 4) {
        options.add(clamp(answer + randomInt(-4, 4), 0, 40));
    }
    return shuffle(Array.from(options));
};

const createQuestion = () => {
    const mode = shuffle(getModes())[0];
    const max = [5, 9, 12, 18][state.difficulty - 1];
    let question = { mode, groups: [], answer: 0, expression: "", sequence: null };

    if (mode === "counting") {
        question.answer = randomInt(1, max);
        question.groups = [question.answer];
        question.expression = "Conte os objetos.";
    }

    if (mode === "addition") {
        const first = randomInt(1, Math.ceil(max / 2));
        const second = randomInt(1, Math.ceil(max / 2));
        question.answer = first + second;
        question.groups = [first, second];
        question.expression = `${first} + ${second}`;
    }

    if (mode === "subtraction") {
        const first = randomInt(3, max);
        const second = randomInt(1, first - 1);
        question.answer = first - second;
        question.groups = [first, -second];
        question.expression = `${first} - ${second}`;
    }

    if (mode === "multiplication") {
        const first = randomInt(2, 4);
        const second = randomInt(2, 4);
        question.answer = first * second;
        question.groups = Array.from({ length: first }, () => second);
        question.expression = `${first} x ${second}`;
    }

    if (mode === "division") {
        const divisor = randomInt(2, 4);
        const answer = randomInt(2, 4);
        question.answer = answer;
        question.groups = Array.from({ length: divisor }, () => answer);
        question.expression = `${divisor * answer} / ${divisor}`;
    }

    if (mode === "sequence") {
        const start = randomInt(1, 5);
        const step = randomInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, index) => start + (index * step));
        const missing = randomInt(1, 3);
        question.answer = sequence[missing];
        question.sequence = { values: sequence, missing };
        question.expression = sequence.map((value, index) => index === missing ? "?" : value).join("  ");
    }

    question.options = createOptions(question.answer);
    return question;
};

const renderObjects = (count, removed = false) => {
    return Array.from({ length: Math.abs(count) }, () => `
        <span class="math-object math-object--apple ${removed ? "is-removed" : ""}" role="img" aria-label="maca">
            <span></span>
        </span>
    `).join("");
};

const renderScene = () => {
    const question = state.current;

    if (question.sequence) {
        elements.scene.innerHTML = `
            <div class="math-sequence">
                ${question.sequence.values.map((value, index) => `<span>${index === question.sequence.missing ? "?" : value}</span>`).join("")}
            </div>
        `;
        return;
    }

    elements.scene.innerHTML = question.groups.map((group, index) => `
        <div class="math-object-row">
            ${index > 0 ? `<strong>${group < 0 ? "-" : "+"}</strong>` : ""}
            <div>${renderObjects(group, group < 0)}</div>
        </div>
    `).join("");
};

const updatePanel = () => {
    const progress = window.InkluaGameProgress?.read?.();
    const game = progress?.games?.[gameId];
    const correct = Number(game?.correct) || state.correct;
    const wrong = Number(game?.wrong) || state.wrong;
    const total = Number(game?.attempts) || correct + wrong;
    const level = Number(game?.level) || Math.floor(total / 5) + 1;

    elements.level.textContent = level;
    elements.correct.textContent = correct;
    elements.wrong.textContent = wrong;
    elements.accuracy.textContent = total ? `${Math.round((correct / total) * 100)}%` : "0%";
    elements.difficulty.textContent = state.difficulty;
    elements.medal.textContent = correct >= 15 ? "Ouro" : correct >= 8 ? "Prata" : correct >= 4 ? "Bronze" : "Inicio";
    elements.progress.style.width = `${Math.min((total % 5) * 20, 100)}%`;
};

const renderQuestion = () => {
    state.difficulty = clamp(Math.floor(state.answeredQuestions / 5) + 1, 1, 4);
    state.current = createQuestion();
    state.answered = false;
    state.helped = false;
    state.startedAt = Date.now();

    elements.mode.textContent = labels[state.current.mode];
    elements.title.textContent = state.current.mode === "sequence" ? "Qual numero completa a sequencia?" : "Qual e a resposta?";
    elements.expression.textContent = state.current.expression;
    elements.feedback.textContent = "";
    elements.guide.textContent = "Observe os objetos e escolha a resposta.";
    elements.next.disabled = true;

    renderScene();
    elements.options.innerHTML = state.current.options.map((option) => `<button class="math-option" type="button" data-answer="${option}">${option}</button>`).join("");
    elements.options.querySelectorAll(".math-option").forEach((button) => button.addEventListener("click", () => answerQuestion(Number(button.dataset.answer), button)));
    updatePanel();
    speak(`${labels[state.current.mode]}. ${elements.title.textContent}. ${state.current.expression}.`);
};

const recordProgress = (correct) => {
    window.InkluaGameProgress?.record(gameId, {
        title: "Matematica Visual",
        skill: "Matematica visual",
        item: labels[state.current.mode],
        correct,
        totalItems,
        level: state.difficulty,
        maxLevel: 4,
        difficulty: `Nivel ${state.difficulty}`,
        responseTimeMs: Date.now() - state.startedAt,
        helpUsed: state.helped
    });
};

const answerQuestion = (answer, button) => {
    if (state.answered) return;

    const correct = answer === state.current.answer;
    state.answered = true;
    button.classList.add(correct ? "is-correct" : "is-wrong");

    if (correct) {
        state.correct += 1;
        elements.feedback.textContent = "Muito bem. Voce conseguiu.";
        elements.guide.textContent = "Resposta certa. Vamos para a proxima.";
    } else {
        state.wrong += 1;
        elements.feedback.textContent = `Quase. A resposta era ${state.current.answer}.`;
        elements.options.querySelector(`[data-answer="${state.current.answer}"]`)?.classList.add("is-correct");
    }

    state.answeredQuestions += 1;
    state.difficulty = clamp(Math.floor(state.answeredQuestions / 5) + 1, 1, 4);
    playTone(correct);
    speak(correct ? "Muito bem. Voce conseguiu." : `Quase. A resposta era ${state.current.answer}.`);
    recordProgress(correct);
    updatePanel();
    elements.next.disabled = false;
};

elements.help.addEventListener("click", () => {
    state.helped = true;
    elements.feedback.textContent = "Dica: conte cada objeto com calma.";
    elements.scene.classList.add("is-helping");
    speak("Dica. Conte cada objeto com calma.");
    window.setTimeout(() => elements.scene.classList.remove("is-helping"), 900);
});

elements.repeat.addEventListener("click", () => speak(`${labels[state.current.mode]}. ${elements.title.textContent}. ${state.current.expression}.`));
elements.next.addEventListener("click", renderQuestion);
[elements.theme, elements.voice, elements.sound, elements.volume].forEach((input) => input.addEventListener("change", savePreferences));

loadPreferences();
renderQuestion();
