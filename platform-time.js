(function () {
    const storageKey = "inklua_platform_time_v1";
    const tickMs = 15000;
    let startedAt = Date.now();

    const readTime = () => {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || { totalMs: 0, visits: 0, lastSeen: null };
        } catch (error) {
            return { totalMs: 0, visits: 0, lastSeen: null };
        }
    };

    const saveTime = (payload) => {
        localStorage.setItem(storageKey, JSON.stringify(payload));
    };

    const commitTime = () => {
        if (document.visibilityState === "hidden") {
            startedAt = Date.now();
            return;
        }

        const now = Date.now();
        const elapsed = Math.max(now - startedAt, 0);

        if (elapsed < 1000) {
            return;
        }

        const current = readTime();
        saveTime({
            totalMs: Math.max(Number(current.totalMs) || 0, 0) + elapsed,
            visits: Math.max(Number(current.visits) || 0, 0) + (current.lastSeen ? 0 : 1),
            lastSeen: new Date(now).toISOString()
        });

        startedAt = now;
    };

    const current = readTime();
    saveTime({
        ...current,
        visits: Math.max(Number(current.visits) || 0, 0) + 1,
        lastSeen: current.lastSeen || new Date().toISOString()
    });

    window.setInterval(commitTime, tickMs);
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            commitTime();
            return;
        }

        startedAt = Date.now();
    });
    window.addEventListener("pagehide", commitTime);

    window.InkluaPlatformTime = {
        read: readTime,
        commit: commitTime,
        storageKey
    };
}());
