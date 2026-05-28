const emotionSituation = document.getElementById("emotionSituation");
const emotionOptions = document.getElementById("emotionOptions");
const emotionFeedback = document.getElementById("emotionFeedback");
const emotionStep = document.getElementById("emotionStep");
const emotionTotal = document.getElementById("emotionTotal");
const nextEmotion = document.getElementById("nextEmotion");
const restartEmotion = document.getElementById("restartEmotion");
const emotionCheckin = document.getElementById("emotionCheckin");
const checkinOptions = document.getElementById("checkinOptions");
const checkinFeedback = document.getElementById("checkinFeedback");

const emotions = [
    { id: "feliz", label: "Feliz", face: "\u{1F600}", phrase: "alegria" },
    { id: "triste", label: "Triste", face: "\u{1F622}", phrase: "tristeza" },
    { id: "bravo", label: "Bravo", face: "\u{1F620}", phrase: "raiva" },
    { id: "medo", label: "Com medo", face: "\u{1F628}", phrase: "medo" },
    { id: "calmo", label: "Calmo", face: "\u{1F642}", phrase: "calma" },
    { id: "surpreso", label: "Surpreso", face: "\u{1F62E}", phrase: "surpresa" }
];

const emotionLevels = [
    [
        {
            situation: "Ana ganhou um presente.",
            correct: "feliz",
            hint: "Quando ganhamos algo legal, podemos sentir alegria."
        },
        {
            situation: "Pedro perdeu seu brinquedo favorito.",
            correct: "triste",
            hint: "Quando perdemos algo importante, podemos sentir tristeza."
        },
        {
            situation: "Lia ouviu um barulho muito alto de repente.",
            correct: "medo",
            hint: "Quando algo assusta, podemos sentir medo."
        },
        {
            situation: "Rafa respirou fundo e descansou em um lugar tranquilo.",
            correct: "calmo",
            hint: "Quando o corpo descansa, podemos sentir calma."
        },
        {
            situation: "Bia viu uma festa surpresa.",
            correct: "surpreso",
            hint: "Quando algo inesperado acontece, podemos ficar surpresos."
        }
    ],
    [
        {
            situation: "Joao esperou sua vez e conseguiu brincar.",
            correct: "feliz",
            hint: "Quando conseguimos participar, podemos sentir alegria."
        },
        {
            situation: "Mila queria continuar brincando, mas a atividade acabou.",
            correct: "triste",
            hint: "Quando algo que gostamos acaba, podemos sentir tristeza."
        },
        {
            situation: "Davi ouviu um estouro e tapou os ouvidos.",
            correct: "medo",
            hint: "Barulhos repentinos podem assustar."
        },
        {
            situation: "Nina respirou devagar depois de uma pausa.",
            correct: "calmo",
            hint: "Respirar devagar pode ajudar o corpo a ficar calmo."
        },
        {
            situation: "Leo ficou sem seu brinquedo porque alguem pegou sem pedir.",
            correct: "bravo",
            hint: "Quando algo parece injusto, podemos sentir raiva."
        }
    ],
    [
        {
            situation: "Sofia recebeu ajuda para terminar uma tarefa dificil.",
            correct: "feliz",
            hint: "Receber ajuda e concluir uma tarefa pode trazer alegria."
        },
        {
            situation: "Caio nao encontrou o amigo no recreio.",
            correct: "triste",
            hint: "Sentir falta de alguem pode trazer tristeza."
        },
        {
            situation: "Uma sala cheia e barulhenta deixou Tom preocupado.",
            correct: "medo",
            hint: "Ambientes agitados podem causar inseguranca ou medo."
        },
        {
            situation: "Lara terminou a atividade e ficou descansando em silencio.",
            correct: "calmo",
            hint: "Silencio e descanso podem ajudar a sentir calma."
        },
        {
            situation: "Gui viu um desenho novo aparecer na tela.",
            correct: "surpreso",
            hint: "Coisas novas e inesperadas podem causar surpresa."
        }
    ]
];

let currentRound = 0;
let canContinue = false;
let currentLevel = 1;
let rounds = [];

const getStoredGameLevel = (gameId) => {
    const progress = window.InkluaGameProgress?.read?.();
    return Math.max(Number(progress?.games?.[gameId]?.level) || 1, 1);
};

const getRoundsForLevel = (level) => emotionLevels[(level - 1) % emotionLevels.length];

const loadCurrentLevel = () => {
    currentLevel = getStoredGameLevel("emocoes");
    rounds = getRoundsForLevel(currentLevel);
};

const speak = (text) => {
    if (window.InkluaSpeech?.speak) {
        window.InkluaSpeech.speak(text);
        return;
    }

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = window.InkluaSpeech?.createUtterance(text) || new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
};

const getEmotion = (emotionId) => emotions.find((emotion) => emotion.id === emotionId);

const getRoundOptions = (correctEmotionId) => {
    const correctEmotion = getEmotion(correctEmotionId);
    const distractors = emotions.filter((emotion) => emotion.id !== correctEmotionId).slice(0, 3);

    return [correctEmotion, ...distractors].sort((first, second) => first.label.localeCompare(second.label));
};

const createEmotionButton = (emotion, type = "answer") => {
    const button = document.createElement("button");
    button.className = "emotion-button";
    button.type = "button";
    button.dataset.emotion = emotion.id;
    button.dataset.type = type;
    button.innerHTML = `
        <span class="emotion-face" aria-hidden="true">${emotion.face}</span>
        <span>${emotion.label}</span>
    `;

    return button;
};

const renderRound = () => {
    const round = rounds[currentRound];

    canContinue = false;
    emotionSituation.textContent = round.situation;
    emotionFeedback.textContent = "";
    emotionStep.textContent = String(currentRound + 1);
    emotionTotal.textContent = String(rounds.length);
    nextEmotion.disabled = true;
    nextEmotion.textContent = currentRound === rounds.length - 1 ? "Finalizar fase" : "Pr\u00f3xima situa\u00e7\u00e3o";
    emotionOptions.innerHTML = "";

    getRoundOptions(round.correct).forEach((emotion) => {
        emotionOptions.appendChild(createEmotionButton(emotion));
    });

    speak(round.situation);
};

const selectAnswer = (button) => {
    const round = rounds[currentRound];
    const selectedEmotion = getEmotion(button.dataset.emotion);
    const correctEmotion = getEmotion(round.correct);

    emotionOptions.querySelectorAll(".emotion-button").forEach((item) => {
        item.classList.remove("is-selected", "is-correct", "is-wrong");
    });

    button.classList.add("is-selected");

    if (selectedEmotion.id === round.correct) {
        button.classList.add("is-correct");
        emotionFeedback.textContent = `Muito bem! Essa situa\u00e7\u00e3o combina com ${correctEmotion.label.toLowerCase()}.`;
        speak(`Muito bem. ${correctEmotion.label}.`);
        window.InkluaGameProgress?.record("emocoes", {
            title: "Jogo das Emoções",
            skill: "Comunicação",
            item: round.situation,
            correct: true,
            totalItems: rounds.length
        });
        canContinue = true;
        nextEmotion.disabled = false;
        return;
    }

    button.classList.add("is-wrong");
    emotionFeedback.textContent = `Boa tentativa. ${round.hint}`;
    speak(round.hint);
    window.InkluaGameProgress?.record("emocoes", {
        title: "Jogo das Emoções",
        skill: "Comunicação",
        item: `${round.situation}:${selectedEmotion.id}`,
        correct: false,
        totalItems: rounds.length
    });
};

const finishGame = () => {
    const nextLevel = getStoredGameLevel("emocoes");

    emotionSituation.textContent = "Voc\u00ea completou as situa\u00e7\u00f5es.";
    emotionOptions.innerHTML = "";
    emotionFeedback.textContent = nextLevel > currentLevel
        ? `Muito bem! A fase ${nextLevel} foi desbloqueada com novas perguntas.`
        : "Agora voc\u00ea pode escolher como se sente hoje.";
    nextEmotion.hidden = true;
    restartEmotion.hidden = false;
    restartEmotion.textContent = nextLevel > currentLevel ? `Come\u00e7ar fase ${nextLevel}` : "Jogar novamente";
    emotionCheckin.hidden = false;
    speak("Atividade conclu\u00edda. Como voc\u00ea se sente hoje?");
    window.InkluaGameProgress?.record("emocoes", {
        title: "Jogo das Emoções",
        skill: "Comunicação",
        item: "finalizado",
        completed: true,
        totalItems: rounds.length
    });
};

const goToNextRound = () => {
    if (!canContinue) {
        return;
    }

    if (currentRound === rounds.length - 1) {
        finishGame();
        return;
    }

    currentRound += 1;
    renderRound();
};

const restartGame = () => {
    currentRound = 0;
    loadCurrentLevel();
    nextEmotion.hidden = false;
    restartEmotion.hidden = true;
    emotionCheckin.hidden = true;
    checkinFeedback.textContent = "";
    renderRound();
};

emotions.forEach((emotion) => {
    checkinOptions.appendChild(createEmotionButton(emotion, "checkin"));
});

emotionOptions.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".emotion-button") : null;

    if (button) {
        selectAnswer(button);
    }
});

checkinOptions.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".emotion-button") : null;

    if (!button) {
        return;
    }

    const selectedEmotion = getEmotion(button.dataset.emotion);

    checkinOptions.querySelectorAll(".emotion-button").forEach((item) => {
        item.classList.remove("is-selected");
    });

    button.classList.add("is-selected");
    checkinFeedback.textContent = `Entendi. Hoje voc\u00ea escolheu: ${selectedEmotion.label}.`;
    speak(`Hoje voc\u00ea se sente ${selectedEmotion.phrase}.`);
    window.InkluaGameProgress?.record("checkin-emocional", {
        title: "Check-in emocional",
        skill: "Interação social",
        item: selectedEmotion.label,
        correct: true,
        completed: true,
        totalItems: 1
    });
});

nextEmotion.addEventListener("click", goToNextRound);
restartEmotion.addEventListener("click", restartGame);

loadCurrentLevel();
renderRound();
