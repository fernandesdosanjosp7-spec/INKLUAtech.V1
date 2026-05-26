(function () {
    const storageKey = "inklua_game_progress_v1";
    let speechRequestId = 0;

    const scoreVoice = (voice) => {
        const name = voice.name.toLowerCase();
        const uri = String(voice.voiceURI || "").toLowerCase();
        const normalizeText = (value) => String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        const text = normalizeText(`${name} ${uri}`);
        let score = 0;
        const femaleNames = [
            "ana",
            "beatriz",
            "bruna",
            "camila",
            "carolina",
            "claudia",
            "francisca",
            "fernanda",
            "gabriela",
            "helena",
            "heloisa",
            "ines",
            "juliana",
            "leticia",
            "livia",
            "luciana",
            "maria",
            "manuela",
            "joana",
            "patricia",
            "sandra",
            "thalita",
            "yara",
            "raquel",
            "teresa",
            "catarina",
            "amalia",
            "vitoria"
        ];
        const maleNames = [
            "antonio",
            "daniel",
            "felipe",
            "joaquim",
            "ricardo",
            "paulo",
            "thiago",
            "tiago",
            "bruno",
            "carlos",
            "jorge"
        ];

        if (voice.lang?.toLowerCase() === "pt-br") score += 40;
        if (voice.lang?.toLowerCase().startsWith("pt")) score += 25;
        if (femaleNames.some((femaleName) => text.includes(femaleName))) score += 500;
        if (maleNames.some((maleName) => text.includes(maleName))) score -= 1000;
        if (text.includes("female") || text.includes("feminina") || text.includes("mulher") || text.includes("woman")) score += 400;
        if (text.includes("male") || text.includes("masculina") || text.includes("homem")) score -= 1000;
        if (text.includes("doce") || text.includes("suave") || text.includes("soft")) score += 100;
        if (text.includes("natural")) score += 80;
        if (text.includes("neural")) score += 70;
        if (text.includes("online")) score += 55;
        if (voice.localService === false) score += 45;
        if (text.includes("microsoft")) score += 24;
        if (text.includes("google")) score += 22;
        if (text.includes("francisca") || text.includes("maria") || text.includes("luciana") || text.includes("helena")) score += 35;
        if (text.includes("female") || text.includes("feminina")) score += 10;
        if (voice.localService === true && !text.includes("natural")) score -= 30;

        return score;
    };

    const getPreferredVoice = () => {
        if (!("speechSynthesis" in window)) {
            return null;
        }

        const voices = window.speechSynthesis.getVoices();
        const portugueseVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("pt"));
        const femaleVoice = portugueseVoices
            .filter((voice) => scoreVoice(voice) > 450)
            .sort((first, second) => scoreVoice(second) - scoreVoice(first))[0];

        if (femaleVoice) {
            return femaleVoice;
        }

        const anyFemaleVoice = voices
            .filter((voice) => scoreVoice(voice) > 450)
            .sort((first, second) => scoreVoice(second) - scoreVoice(first))[0];

        if (anyFemaleVoice) {
            return anyFemaleVoice;
        }

        return portugueseVoices
            .sort((first, second) => scoreVoice(second) - scoreVoice(first))[0] || null;
    };

    const createSoftVoiceUtterance = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getPreferredVoice();

        utterance.lang = voice?.lang || "pt-BR";
        utterance.rate = 0.86;
        utterance.pitch = 1.16;
        utterance.volume = 1;

        if (voice) {
            utterance.voice = voice;
        }

        return utterance;
    };

    const speakWithSoftVoice = (text) => {
        if (!("speechSynthesis" in window)) {
            return;
        }

        speechRequestId += 1;
        const currentSpeechRequestId = speechRequestId;
        let didSpeak = false;
        const speakNow = () => {
            if (didSpeak || currentSpeechRequestId !== speechRequestId) {
                return;
            }

            didSpeak = true;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(createSoftVoiceUtterance(text));
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

        let voiceLoadAttempts = 0;
        const waitForVoices = () => {
            voiceLoadAttempts += 1;

            if (window.speechSynthesis.getVoices().length > 0 || voiceLoadAttempts >= 20) {
                speakNow();
                return;
            }

            window.setTimeout(waitForVoices, 150);
        };

        window.setTimeout(waitForVoices, 150);
    };

    const readProgress = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || { games: {}, sessions: [] };
        } catch (error) {
            return { games: {}, sessions: [] };
        }
    };

    const saveProgress = (progress) => {
        localStorage.setItem(storageKey, JSON.stringify(progress));
    };

    const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean)));

    const levelStep = 5;

    const getLevelState = (correct = 0) => {
        const safeCorrect = Math.max(Number(correct) || 0, 0);
        const level = Math.floor(safeCorrect / levelStep) + 1;
        const progressInLevel = safeCorrect % levelStep;

        return {
            level,
            progressInLevel,
            correctToNextLevel: levelStep - progressInLevel,
            levelStep
        };
    };

    const renderLevelWidget = (game) => {
        if (!game || !document.body) {
            return;
        }

        const target = document.querySelector(".number-intro, .alphabet-intro, .emotion-intro, .syllable-intro, .simple-game-focus, main");

        if (!target) {
            return;
        }

        let widget = document.querySelector(".level-progress-card");

        if (!widget) {
            widget = document.createElement("aside");
            widget.className = "level-progress-card";
            widget.setAttribute("aria-live", "polite");
            target.insertAdjacentElement("afterend", widget);
        }

        const progress = Math.min(((game.progressInLevel || 0) / (game.levelStep || levelStep)) * 100, 100);
        const remaining = game.correctToNextLevel || levelStep;
        const levelUpText = game.leveledUp
            ? `<p class="level-progress-card__status">Nova fase desbloqueada.</p>`
            : `<p class="level-progress-card__status">Faltam ${remaining} acerto(s) para a proxima fase.</p>`;

        widget.innerHTML = `
            <div>
                <span>Fase de aprendizagem</span>
                <strong>Fase ${game.level || 1}</strong>
            </div>
            <div class="level-progress-card__meter" aria-hidden="true">
                <span style="width: ${progress}%"></span>
            </div>
            ${levelUpText}
        `;
    };

    const recordGameProgress = (gameId, payload = {}) => {
        if (!gameId) {
            return;
        }

        const progress = readProgress();
        const currentGame = progress.games[gameId] || {
            id: gameId,
            title: payload.title || gameId,
            skill: payload.skill || "Atencao e foco",
            interactions: 0,
            correct: 0,
            wrong: 0,
            level: 1,
            levelStep,
            progressInLevel: 0,
            correctToNextLevel: levelStep,
            levelUps: 0,
            completed: false,
            items: [],
            totalItems: payload.totalItems || 1,
            lastPlayed: null
        };

        currentGame.title = payload.title || currentGame.title;
        currentGame.skill = payload.skill || currentGame.skill;
        currentGame.totalItems = payload.totalItems || currentGame.totalItems;
        currentGame.interactions += 1;
        currentGame.lastPlayed = new Date().toISOString();

        const previousLevel = currentGame.level || getLevelState(currentGame.correct).level;

        if (payload.item && payload.correct !== false && payload.item !== "finalizado") {
            currentGame.items = uniqueValues([...currentGame.items, String(payload.item)]);
        }

        if (payload.correct === true) {
            currentGame.correct += 1;
        }

        if (payload.correct === false) {
            currentGame.wrong += 1;
        }

        const levelState = getLevelState(currentGame.correct);
        currentGame.level = levelState.level;
        currentGame.levelStep = levelState.levelStep;
        currentGame.progressInLevel = levelState.progressInLevel;
        currentGame.correctToNextLevel = levelState.correctToNextLevel;
        currentGame.leveledUp = payload.correct === true && currentGame.level > previousLevel;

        if (currentGame.leveledUp) {
            currentGame.levelUps = (currentGame.levelUps || 0) + 1;
            currentGame.lastLevelUp = currentGame.lastPlayed;
        }

        if (payload.completed || currentGame.items.length >= currentGame.totalItems) {
            currentGame.completed = true;
        }

        progress.games[gameId] = currentGame;
        progress.sessions.push({
            gameId,
            title: currentGame.title,
            skill: currentGame.skill,
            item: payload.item || "",
            correct: payload.correct,
            level: currentGame.level,
            leveledUp: currentGame.leveledUp,
            completed: currentGame.completed,
            createdAt: currentGame.lastPlayed
        });

        progress.sessions = progress.sessions.slice(-120);
        saveProgress(progress);
        renderLevelWidget(currentGame);
    };

    const getGameProgress = () => readProgress();

    window.InkluaGameProgress = {
        record: recordGameProgress,
        read: getGameProgress,
        getLevelState,
        storageKey
    };

    window.InkluaSpeech = {
        createUtterance: createSoftVoiceUtterance,
        speak: speakWithSoftVoice
    };

    if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => getPreferredVoice();
    }
}());
