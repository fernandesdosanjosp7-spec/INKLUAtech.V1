(function () {
    const storageKey = "inklua_game_progress_v1";

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

    const saveProgress = (progress) => {
        localStorage.setItem(storageKey, JSON.stringify(progress));
    };

    const uniqueValues = (values) => Array.from(new Set(values.filter(Boolean)));

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

        if (payload.item && payload.correct !== false && payload.item !== "finalizado") {
            currentGame.items = uniqueValues([...currentGame.items, String(payload.item)]);
        }

        if (payload.correct === true) {
            currentGame.correct += 1;
        }

        if (payload.correct === false) {
            currentGame.wrong += 1;
        }

        currentGame.level = Math.min(
            Math.max(Number(payload.level) || Math.floor((currentGame.attempts || 0) / 5) + 1, 1),
            currentGame.maxLevel
        );

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
            completed: currentGame.completed,
            createdAt: currentGame.lastPlayed
        });

        progress.sessions = progress.sessions.slice(-120);
        saveProgress(progress);
    };

    const getGameProgress = () => readProgress();

    window.InkluaGameProgress = {
        record: recordGameProgress,
        read: getGameProgress,
        storageKey
    };
}());
