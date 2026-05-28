(function () {
    const storageKey = "inklua_game_progress_v1";
    const syncEndpoint = "game-progress-api.php";
    let speechRequestId = 0;
    let pageSessionStartedAt = Date.now();
    let syncTimer = 0;

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

    const normalizeProgress = (progress) => {
        const normalized = progress || { games: {}, sessions: [] };
        normalized.games = normalized.games || {};
        normalized.sessions = Array.isArray(normalized.sessions) ? normalized.sessions : [];

        Object.values(normalized.games).forEach((game) => {
            const gameSessions = normalized.sessions.filter((session) => session.gameId === game.id && typeof session.correct === "boolean");
            const sessionCorrect = gameSessions.filter((session) => session.correct === true).length;
            const sessionWrong = gameSessions.filter((session) => session.correct === false).length;
            const storedCorrect = Math.max(Number(game.correct) || 0, 0);
            const storedWrong = Math.max(Number(game.wrong) || 0, 0);

            game.correct = Math.max(storedCorrect, sessionCorrect);
            game.wrong = Math.max(storedWrong, sessionWrong);
            game.attempts = Math.max(Number(game.attempts) || 0, game.correct + game.wrong, gameSessions.length);
        });

        return normalized;
    };

    const readProgress = () => {
        try {
            return normalizeProgress(JSON.parse(localStorage.getItem(storageKey)) || { games: {}, sessions: [] });
        } catch (error) {
            return { games: {}, sessions: [] };
        }
    };

    const normalizeProgress = (progress = {}) => ({
        ...progress,
        games: progress.games && typeof progress.games === "object" ? progress.games : {},
        sessions: Array.isArray(progress.sessions) ? progress.sessions : [],
        totalTimeMs: Math.max(Number(progress.totalTimeMs) || 0, 0)
    });

    const saveProgress = (progress) => {
        const normalizedProgress = normalizeProgress(progress);
        localStorage.setItem(storageKey, JSON.stringify(normalizedProgress));
        scheduleServerSync(normalizedProgress);
    };

    const getSessionKey = (session) => [
        session.gameId || "",
        session.item || "",
        session.correct,
        session.createdAt || ""
    ].join("|");

    const mergeGameProgress = (localGame = {}, serverGame = {}) => {
        const items = uniqueValues([...(localGame.items || []), ...(serverGame.items || [])]);
        const correct = Math.max(Number(localGame.correct) || 0, Number(serverGame.correct) || 0);
        const levelState = getLevelState(correct);

        return {
            ...serverGame,
            ...localGame,
            interactions: Math.max(Number(localGame.interactions) || 0, Number(serverGame.interactions) || 0),
            correct,
            wrong: Math.max(Number(localGame.wrong) || 0, Number(serverGame.wrong) || 0),
            items,
            completed: Boolean(localGame.completed || serverGame.completed),
            totalItems: Math.max(Number(localGame.totalItems) || 0, Number(serverGame.totalItems) || 0, 1),
            level: Math.max(Number(localGame.level) || 1, Number(serverGame.level) || 1, levelState.level),
            levelStep: levelState.levelStep,
            progressInLevel: levelState.progressInLevel,
            correctToNextLevel: levelState.correctToNextLevel,
            levelUps: Math.max(Number(localGame.levelUps) || 0, Number(serverGame.levelUps) || 0),
            lastPlayed: [localGame.lastPlayed, serverGame.lastPlayed].filter(Boolean).sort().pop() || null,
            lastLevelUp: [localGame.lastLevelUp, serverGame.lastLevelUp].filter(Boolean).sort().pop() || null
        };
    };

    const mergeProgress = (localProgress, serverProgress) => {
        const local = normalizeProgress(localProgress);
        const server = normalizeProgress(serverProgress);
        const gameIds = uniqueValues([...Object.keys(local.games), ...Object.keys(server.games)]);
        const sessionsByKey = new Map();

        [...server.sessions, ...local.sessions].forEach((session) => {
            sessionsByKey.set(getSessionKey(session), session);
        });

        return {
            ...server,
            ...local,
            games: gameIds.reduce((games, gameId) => {
                games[gameId] = mergeGameProgress(local.games[gameId], server.games[gameId]);
                return games;
            }, {}),
            sessions: Array.from(sessionsByKey.values())
                .sort((first, second) => String(first.createdAt || "").localeCompare(String(second.createdAt || "")))
                .slice(-120),
            totalTimeMs: Math.max(local.totalTimeMs, server.totalTimeMs),
            lastActiveAt: [local.lastActiveAt, server.lastActiveAt].filter(Boolean).sort().pop() || null
        };
    };

    const canSyncWithServer = () => {
        const staticServerPorts = new Set(["5500", "5501"]);
        return window.location.protocol !== "file:" && !staticServerPorts.has(window.location.port) && typeof fetch === "function";
    };

    const preferPhpNavigation = () => {
        if (!canSyncWithServer()) {
            return;
        }

        document.querySelectorAll("a[href^='home.html']").forEach((link) => {
            const href = link.getAttribute("href") || "";
            link.setAttribute("href", href.replace("home.html", "home.php"));
        });

        document.querySelectorAll("a[href='relatorio.html']").forEach((link) => {
            link.setAttribute("href", "relatorio.php");
        });
    };

    const syncProgressToServer = (progress = readProgress()) => {
        if (!canSyncWithServer()) {
            return;
        }

        fetch(syncEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ progress: normalizeProgress(progress) })
        }).catch(() => {});
    };

    const scheduleServerSync = (progress) => {
        if (!canSyncWithServer()) {
            return;
        }

        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(() => syncProgressToServer(progress), 350);
    };

    const loadProgressFromServer = () => {
        if (!canSyncWithServer()) {
            return;
        }

        fetch(syncEndpoint, {
            credentials: "same-origin"
        })
            .then((response) => response.ok ? response.json() : null)
            .then((payload) => {
                if (!payload?.ok || !payload.progress) {
                    return;
                }

                const mergedProgress = mergeProgress(readProgress(), payload.progress);
                localStorage.setItem(storageKey, JSON.stringify(mergedProgress));
                syncProgressToServer(mergedProgress);
            })
            .catch(() => {});
    };

    const recordPlatformTime = () => {
        const now = Date.now();
        const elapsed = now - pageSessionStartedAt;

        if (elapsed < 1000) {
            return;
        }

        const progress = readProgress();
        progress.games = progress.games || {};
        progress.sessions = progress.sessions || [];
        progress.totalTimeMs = Math.max(Number(progress.totalTimeMs) || 0, 0) + elapsed;
        progress.lastActiveAt = new Date(now).toISOString();
        saveProgress(progress);
        pageSessionStartedAt = now;
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
            attempts: 0,
            correct: 0,
            wrong: 0,
            level: 1,
            maxLevel: payload.maxLevel || 4,
            levelStep,
            progressInLevel: 0,
            correctToNextLevel: levelStep,
            levelUps: 0,
            completed: false,
            items: [],
            totalItems: payload.totalItems || 1,
            lastPlayed: null
        };
        const previousCorrect = Math.max(Number(currentGame.correct) || 0, 0);
        const previousWrong = Math.max(Number(currentGame.wrong) || 0, 0);
        const previousAttempts = Math.max(Number(currentGame.attempts) || previousCorrect + previousWrong, previousCorrect + previousWrong, 0);

        currentGame.title = payload.title || currentGame.title;
        currentGame.skill = payload.skill || currentGame.skill;
        currentGame.totalItems = payload.totalItems || currentGame.totalItems;
        currentGame.maxLevel = payload.maxLevel || currentGame.maxLevel || 4;
        currentGame.interactions += 1;
        currentGame.lastPlayed = new Date().toISOString();
        currentGame.correct = previousCorrect;
        currentGame.wrong = previousWrong;
        currentGame.attempts = previousAttempts;

        if (typeof payload.correct === "boolean") {
            currentGame.attempts += 1;
        }

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
        currentGame.level = Math.min(Number(payload.level) || levelState.level, currentGame.maxLevel);
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
            question: payload.question || "",
            selected: payload.selected || "",
            correct: payload.correct,
            level: currentGame.level,
            difficulty: payload.difficulty || `Nivel ${currentGame.level}`,
            responseTimeMs: payload.responseTimeMs || null,
            helpUsed: Boolean(payload.helpUsed),
            leveledUp: currentGame.leveledUp,
            completed: currentGame.completed,
            createdAt: currentGame.lastPlayed
        });

        progress.sessions = progress.sessions.slice(-120);
        saveProgress(progress);
        renderLevelWidget(currentGame);
    };

    const getGameProgress = () => readProgress();

    const getPlatformUsageTime = () => {
        const progress = readProgress();
        const currentPageTime = document.visibilityState === "visible" ? Date.now() - pageSessionStartedAt : 0;

        return Math.max(Number(progress.totalTimeMs) || 0, 0) + Math.max(currentPageTime, 0);
    };

    const hydrateInitialServerProgress = () => {
        const serverProgress = window.InkluaServerGameProgress;

        if (!serverProgress || typeof serverProgress !== "object") {
            return;
        }

        const mergedProgress = mergeProgress(readProgress(), serverProgress);
        localStorage.setItem(storageKey, JSON.stringify(mergedProgress));
    };

    hydrateInitialServerProgress();
    preferPhpNavigation();

    window.InkluaGameProgress = {
        record: recordGameProgress,
        read: getGameProgress,
        recordPlatformTime,
        getPlatformUsageTime,
        getLevelState,
        storageKey
    };

    window.InkluaSpeech = {
        ...window.InkluaSpeech,
        createUtterance: window.InkluaSpeech?.createUtterance || createSoftVoiceUtterance,
        getFemaleVoice: window.InkluaSpeech?.getFemaleVoice || getPreferredVoice,
        speak: window.InkluaSpeech?.speak || speakWithSoftVoice
    };

    if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = () => getPreferredVoice();
    }

    loadProgressFromServer();

    window.addEventListener("pagehide", recordPlatformTime);
    window.addEventListener("beforeunload", recordPlatformTime);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            recordPlatformTime();
            return;
        }

        pageSessionStartedAt = Date.now();
    });
    window.setInterval(() => {
        if (document.visibilityState === "visible") {
            recordPlatformTime();
        }
    }, 15000);
}());
