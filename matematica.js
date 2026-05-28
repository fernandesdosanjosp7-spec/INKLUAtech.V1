const gameId = "matematica-visual";
const totalItems = 100;
const preferencesKey = "inklua_math_preferences_v1";
const savedMathProgress = window.InkluaGameProgress?.read?.()?.games?.[gameId] || {};
let nextQuestionTimer = null;

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
    addition: "Soma",
    subtraction: "Subtracao"
};

const motivationalMessages = {
    correct: [
        "Muito bom! Continue assim!",
        "Voce conseguiu avancar!",
        "Fantastico! Voce acertou!",
        "Boa! Vamos para a proxima?",
        "Seu esforco esta valendo a pena!",
        "Voce esta indo muito bem!",
        "Excelente trabalho!",
        "Que legal, voce encontrou a resposta!",
        "Muito bem pensado!",
        "Voce esta ficando cada vez melhor nisso!",
        "Parabens pela atencao!",
        "Isso mesmo, voce resolveu com calma!",
        "Otima resposta!",
        "Voce contou direitinho!",
        "Boa conquista! Vamos continuar?"
    ],
    wrong: [
        "Quase la! Vamos tentar juntos?",
        "Nao tem problema errar, vamos aprender juntos.",
        "Excelente tentativa!",
        "Observe com atencao, voce consegue.",
        "Cada tentativa ajuda voce a aprender mais.",
        "Aprender leva tempo, e voce esta evoluindo.",
        "Vamos resolver com calma?",
        "Tudo bem, vamos olhar as macas de novo.",
        "Foi uma boa tentativa. Agora vamos conferir juntos.",
        "Respire com calma. Voce consegue tentar outra vez.",
        "Errar faz parte do aprendizado.",
        "Vamos descobrir a resposta passo a passo.",
        "Voce esta praticando, e isso e muito importante.",
        "Continue tentando, seu caminho esta ficando mais claro.",
        "Vamos contar juntos mais uma vez?"
    ],
    retry: [
        "Tente novamente com calma.",
        "Mais uma tentativa e voce consegue.",
        "Observe as macas com calma.",
        "Continue praticando, voce esta evoluindo!",
        "Vamos tentar mais uma vez?",
        "Olhe devagar e conte uma maca por vez.",
        "Sem pressa. O importante e aprender.",
        "Voce pode tentar de novo quando estiver pronto.",
        "Conte com tranquilidade.",
        "Vamos fazer juntos, passo por passo.",
        "Confie no seu raciocinio.",
        "Uma nova tentativa pode ajudar bastante.",
        "Preste atencao nas macas que ficam.",
        "Continue, voce esta no caminho.",
        "Vamos olhar de novo com carinho?"
    ],
    phase: [
        "Voce concluiu uma fase com muito esforco!",
        "Boa! Voce avancou para um novo desafio.",
        "Seu progresso esta aparecendo.",
        "Voce esta evoluindo com calma e dedicacao.",
        "Mais uma etapa vencida!",
        "Muito bem, voce ganhou mais confianca.",
        "Vamos para uma fase um pouco mais desafiadora.",
        "Seu treino esta dando resultado.",
        "Cada fase mostra o quanto voce esta aprendendo.",
        "Que bom ver voce avancando!",
        "Voce terminou essa parte com muita atencao.",
        "Parabens pela persistencia.",
        "Agora vamos continuar com calma.",
        "Voce esta construindo seu aprendizado.",
        "Excelente evolucao ate aqui!"
    ]
};

const lastMotivationalMessage = {};

const getMotivationalMessage = (type) => {
    const messages = motivationalMessages[type] || motivationalMessages.retry;
    const availableMessages = messages.filter((message) => message !== lastMotivationalMessage[type]);
    const options = availableMessages.length ? availableMessages : messages;
    const message = options[randomInt(0, options.length - 1)];

    lastMotivationalMessage[type] = message;
    return message;
};

const createQuestionBank = () => {
    const maxByLevel = [5, 8, 12, 16, 20];
    const bank = [];

    for (let level = 1; level <= 5; level += 1) {
        const max = maxByLevel[level - 1];

        for (let index = 0; index < 20; index += 1) {
            const isAddition = index % 2 === 0;

            if (isAddition) {
                const first = (index % Math.max(2, Math.floor(max / 2))) + 1 + Math.floor(level / 3);
                const second = ((index * 2 + level) % Math.max(2, Math.floor(max / 2))) + 1;
                const answer = first + second;

                bank.push({
                    id: `soma-${level}-${index}`,
                    mode: "addition",
                    difficulty: level,
                    operands: [first, second],
                    groups: [first, second],
                    answer,
                    expression: `${first} + ${second}`
                });
                continue;
            }

            const first = Math.max(3, ((index * 3 + level) % max) + 2);
            const second = Math.min(first - 1, ((index + level) % Math.max(2, first - 1)) + 1);
            const answer = first - second;

            bank.push({
                id: `subtracao-${level}-${index}`,
                mode: "subtraction",
                difficulty: level,
                operands: [first, second],
                groups: [first, -second],
                answer,
                expression: `${first} - ${second}`
            });
        }
    }

    return bank.slice(0, totalItems);
};

const questionBank = createQuestionBank();

let state = {
    difficulty: Math.min(Math.max(Number(savedMathProgress.level) || 1, 1), 5),
    correct: Number(savedMathProgress.correct) || 0,
    wrong: Number(savedMathProgress.wrong) || 0,
    answeredQuestions: Number(savedMathProgress.attempts) || 0,
    streak: 0,
    wrongStreak: 0,
    askedIds: new Set(),
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

const formatExpressionForSpeech = (expression) => String(expression || "")
    .replace(/\s*\+\s*/g, " mais ")
    .replace(/\s*-\s*/g, " menos ")
    .replace(/\s*x\s*/gi, " vezes ")
    .replace(/\s*\/\s*/g, " dividido por ")
    .replace(/\?/g, "qual numero")
    .replace(/\s+/g, " ")
    .trim();

const speakCurrentQuestion = () => {
    speak(`${labels[state.current.mode]}. ${elements.title.textContent}. ${formatExpressionForSpeech(state.current.expression)}.`);
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

const createOptions = (answer) => {
    const options = new Set([answer]);
    while (options.size < 4) {
        options.add(clamp(answer + randomInt(-4, 4), 0, 40));
    }
    return shuffle(Array.from(options));
};

const createQuestion = () => {
    let availableQuestions = questionBank.filter((question) => {
        return question.difficulty === state.difficulty && !state.askedIds.has(question.id);
    });

    if (!availableQuestions.length) {
        questionBank
            .filter((question) => question.difficulty === state.difficulty)
            .forEach((question) => state.askedIds.delete(question.id));

        availableQuestions = questionBank.filter((question) => {
            return question.difficulty === state.difficulty && !state.askedIds.has(question.id);
        });
    }

    const question = { ...shuffle(availableQuestions)[0] };
    state.askedIds.add(question.id);
    question.options = createOptions(question.answer);
    return question;
};

const renderObjects = (count, removed = false) => {
    return Array.from({ length: Math.abs(count) }, () => `
        <span class="math-object math-object--apple math-object--real-apple ${removed ? "is-removed" : ""}" role="img" aria-label="maca">
            <span class="math-apple__body"></span>
            <span class="math-apple__leaf"></span>
            <span class="math-apple__stem"></span>
        </span>
    `).join("");
};

const renderScene = () => {
    const question = state.current;

    elements.scene.innerHTML = question.groups.map((group, index) => `
        <div class="math-object-row">
            ${index > 0 ? `<strong>${group < 0 ? "-" : "+"}</strong>` : ""}
            <div>${renderObjects(group, group < 0)}</div>
        </div>
    `).join("");
};

const renderAppleStep = (count, removed = false) => `
    <div class="math-step-apples">
        ${renderObjects(count, removed)}
    </div>
`;

const getErrorExplanation = (question) => {
    const [first, second] = question.operands;

    if (question.mode === "addition") {
        return {
            title: `${first} mais ${second} e igual a ${question.answer}.`,
            speech: `Temos ${first} macas. Juntamos mais ${second} macas. Agora contamos todas juntas e chegamos em ${question.answer}.`,
            steps: [
                `Primeiro observe ${first} maca(s).`,
                `Depois junte mais ${second} maca(s).`,
                `Conte todas as macas: ${first} mais ${second} e igual a ${question.answer}.`
            ],
            visual: `
                ${renderAppleStep(first)}
                <strong class="math-step-symbol">+</strong>
                ${renderAppleStep(second)}
                <strong class="math-step-symbol">=</strong>
                ${renderAppleStep(question.answer)}
            `
        };
    }

    return {
        title: `${first} menos ${second} e igual a ${question.answer}.`,
        speech: `Comecamos com ${first} macas. Tiramos ${second} macas. Ficaram ${question.answer} macas.`,
        steps: [
            `Primeiro observe ${first} maca(s).`,
            `Depois tire ${second} maca(s).`,
            `Conte as macas que ficaram: ${first} menos ${second} e igual a ${question.answer}.`
        ],
        visual: `
            ${renderAppleStep(first)}
            <strong class="math-step-symbol">-</strong>
            ${renderAppleStep(second, true)}
            <strong class="math-step-symbol">=</strong>
            ${renderAppleStep(question.answer)}
        `
    };
};

const renderErrorFeedback = (selectedAnswer) => {
    const message = getMotivationalMessage("wrong");
    const retryMessage = getMotivationalMessage("retry");
    const explanation = getErrorExplanation(state.current);

    elements.feedback.innerHTML = `
        <article class="math-explanation">
            <strong>${message}</strong>
            <p>Voce escolheu ${selectedAnswer}. A resposta correta e ${state.current.answer}.</p>
            <div class="math-step-visual" aria-hidden="true">${explanation.visual}</div>
            <ol>
                ${explanation.steps.map((step) => `<li>${step}</li>`).join("")}
            </ol>
            <p>${retryMessage}</p>
        </article>
    `;
    elements.guide.textContent = message;
    speak(`${message} ${explanation.speech} ${retryMessage}`);
};

const updateAdaptiveDifficulty = (wasCorrect) => {
    if (wasCorrect) {
        state.streak += 1;
        state.wrongStreak = 0;

        if (state.streak >= 3) {
            state.difficulty = clamp(state.difficulty + 1, 1, 5);
            state.streak = 0;
            return getMotivationalMessage("phase");
        }

        return "";
    }

    state.streak = 0;
    state.wrongStreak += 1;

    if (state.wrongStreak >= 2) {
        state.difficulty = clamp(state.difficulty - 1, 1, 5);
        state.wrongStreak = 0;
    }

    return getMotivationalMessage("retry");
};

const getEvolutionLabel = (accuracy, total) => {
    if (!total) return "Inicio";
    if (accuracy >= 85 && state.difficulty >= 4) return "Avancando";
    if (accuracy >= 70) return "Boa evolucao";
    if (accuracy >= 45) return "Em progresso";
    return "Com apoio";
};

const updatePanel = () => {
    const progress = window.InkluaGameProgress?.read?.();
    const game = progress?.games?.[gameId];
    const correct = Number(game?.correct) || state.correct;
    const wrong = Number(game?.wrong) || state.wrong;
    const total = Number(game?.attempts) || correct + wrong;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    elements.level.textContent = state.difficulty;
    elements.correct.textContent = correct;
    elements.wrong.textContent = wrong;
    elements.accuracy.textContent = `${accuracy}%`;
    elements.difficulty.textContent = state.difficulty;
    elements.medal.textContent = getEvolutionLabel(accuracy, total);
    elements.progress.style.width = `${Math.min((state.answeredQuestions / totalItems) * 100, 100)}%`;
};

const renderQuestion = () => {
    window.clearTimeout(nextQuestionTimer);
    state.current = createQuestion();
    state.answered = false;
    state.helped = false;
    state.startedAt = Date.now();

    elements.mode.textContent = labels[state.current.mode];
    elements.title.textContent = state.current.mode === "subtraction" ? "Quantas macas ficam?" : "Quantas macas tem ao todo?";
    elements.expression.textContent = state.current.expression;
    elements.feedback.textContent = "";
    elements.guide.textContent = "Observe as macas com calma.";
    elements.scene.classList.remove("is-celebrating", "is-helping");
    elements.next.disabled = true;

    renderScene();
    elements.options.innerHTML = state.current.options.map((option) => `<button class="math-option" type="button" data-answer="${option}">${option}</button>`).join("");
    elements.options.querySelectorAll(".math-option").forEach((button) => button.addEventListener("click", () => answerQuestion(Number(button.dataset.answer), button)));
    updatePanel();
    speakCurrentQuestion();
};

const scheduleNextQuestion = () => {
    window.clearTimeout(nextQuestionTimer);
    nextQuestionTimer = window.setTimeout(renderQuestion, 5000);
};

const recordProgress = (correct) => {
    window.InkluaGameProgress?.record(gameId, {
        title: "Matematica Visual",
        skill: "Matematica visual",
        item: labels[state.current.mode],
        correct,
        totalItems,
        level: state.difficulty,
        maxLevel: 5,
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
        const feedback = getMotivationalMessage("correct");
        state.correct += 1;
        elements.scene.classList.add("is-celebrating");
        window.setTimeout(() => elements.scene.classList.remove("is-celebrating"), 900);
        state.answeredQuestions += 1;
        const phaseMessage = updateAdaptiveDifficulty(true);
        const finalFeedback = phaseMessage ? `${feedback} ${phaseMessage}` : feedback;
        elements.feedback.textContent = finalFeedback;
        elements.guide.textContent = phaseMessage || feedback;
        playTone(true);
        speak(finalFeedback);
        recordProgress(true);
        updatePanel();
        elements.next.disabled = true;
        scheduleNextQuestion();
        return;
    } else {
        state.wrong += 1;
        state.answeredQuestions += 1;
        const retryMessage = updateAdaptiveDifficulty(false);
        elements.options.querySelector(`[data-answer="${state.current.answer}"]`)?.classList.add("is-correct");
        playTone(false);
        renderErrorFeedback(answer);
        if (retryMessage) {
            elements.guide.textContent = retryMessage;
        }
        recordProgress(false);
        updatePanel();
        elements.next.disabled = true;
        scheduleNextQuestion();
    }
};

elements.help.addEventListener("click", () => {
    state.helped = true;
    const retryMessage = getMotivationalMessage("retry");
    const hint = state.current.mode === "subtraction"
        ? "Dica: conte as macas que nao estao apagadas."
        : "Dica: conte todas as macas dos dois grupos.";

    elements.feedback.textContent = `${retryMessage} ${hint}`;
    elements.guide.textContent = retryMessage;
    elements.scene.classList.add("is-helping");
    speak(state.current.mode === "subtraction"
        ? `${retryMessage} Conte as macas que nao estao apagadas com calma.`
        : `${retryMessage} Conte todas as macas dos dois grupos com calma.`);
    window.setTimeout(() => elements.scene.classList.remove("is-helping"), 900);
});

elements.repeat.addEventListener("click", speakCurrentQuestion);
elements.next.addEventListener("click", () => {
    window.clearTimeout(nextQuestionTimer);
    renderQuestion();
});
[elements.theme, elements.voice, elements.sound, elements.volume].forEach((input) => input.addEventListener("change", savePreferences));

loadPreferences();
renderQuestion();
