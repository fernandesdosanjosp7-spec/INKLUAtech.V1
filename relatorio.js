const defaultEvolution = {
    "Comunicação": 78,
    "Coordenação motora": 64,
    "Interação social": 72,
    "Reconhecimento de cores": 86,
    "Alfabetização": 58,
    "Atenção e foco": 69
};

Object.keys(defaultEvolution).forEach((key) => {
    defaultEvolution[key] = 0;
});

const readGameProgress = () => {
    try {
        return JSON.parse(localStorage.getItem("inklua_game_progress_v1")) || { games: {}, sessions: [] };
    } catch (error) {
        return { games: {}, sessions: [] };
    }
};

const readPlatformTime = () => {
    window.InkluaPlatformTime?.commit?.();

    try {
        return JSON.parse(localStorage.getItem("inklua_platform_time_v1")) || { totalMs: 0, visits: 0 };
    } catch (error) {
        return { totalMs: 0, visits: 0 };
    }
};

const formatDuration = (milliseconds) => {
    const totalSeconds = Math.max(Math.round((Number(milliseconds) || 0) / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }

    if (minutes > 0) {
        return `${minutes}min ${seconds}s`;
    }

    return `${seconds}s`;
};

const gameProgress = readGameProgress();
const platformTime = readPlatformTime();
const hiddenGameIds = ["emocoes", "checkin-emocional", "rotina", "formas"];
const isVisibleGame = (game) => !hiddenGameIds.includes(game.id || game.gameId || "");
const games = Object.values(gameProgress.games || {}).filter(isVisibleGame);
const sessions = (gameProgress.sessions || []).filter(isVisibleGame);

const normalizeSkillName = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getTotalPlatformTime = () => {
    if (window.InkluaGameProgress?.getPlatformUsageTime) {
        return window.InkluaGameProgress.getPlatformUsageTime();
    }

    return Math.max(Number(gameProgress.totalTimeMs) || 0, 0);
};

const platformStats = {
    correctAnswers: games.reduce((sum, game) => sum + (Number(game.correct) || 0), 0),
    wrongAnswers: games.reduce((sum, game) => sum + (Number(game.wrong) || 0), 0),
    totalTimeMs: getTotalPlatformTime()
};

const getGameLevel = (game) => {
    const correct = Math.max(Number(game?.correct) || 0, 0);
    return Number(game?.level) || Math.floor(correct / 5) + 1;
};

const getCorrectToNextLevel = (game) => {
    const correct = Math.max(Number(game?.correct) || 0, 0);
    const step = Number(game?.levelStep) || 5;
    const progress = Number.isFinite(Number(game?.progressInLevel)) ? Number(game.progressInLevel) : correct % step;
    return Number(game?.correctToNextLevel) || step - progress;
};

const formatDuration = (milliseconds = 0) => {
    const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, "0")}min`;
    }

    if (minutes > 0) {
        return `${minutes}min ${String(seconds).padStart(2, "0")}s`;
    }

    return `${seconds}s`;
};

const readSavedProfile = () => {
    try {
        return JSON.parse(localStorage.getItem("inklua_formulario_adaptacao")) || {};
    } catch (error) {
        return {};
    }
};

const savedProfile = readSavedProfile();
const serverProfile = window.InkluaStudentProfile || {};
const serverReport = window.InkluaServerReport || {};

const firstFilled = (...values) => values.find((value) => String(value || "").trim() !== "") || "";

const normalizeList = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const formatList = (value) => normalizeList(value)
    .map((item) => item.replace(/-/g, " "))
    .join(", ");

const supportLabels = {
    "nivel-1": "Nivel 1 - necessita de pouco apoio",
    "nivel-2": "Nivel 2 - necessita de apoio substancial",
    "nivel-3": "Nivel 3 - necessita de apoio muito substancial",
    "nao-informado": "Nao informado"
};

const studentProfile = {
    name: firstFilled(serverProfile.aluno_nome, savedProfile.aluno_nome, "Aluno"),
    age: firstFilled(serverProfile.aluno_idade, savedProfile.aluno_idade),
    supportLevel: supportLabels[firstFilled(serverProfile.nivel_suporte, savedProfile.nivel_suporte)] || firstFilled(serverProfile.nivel_suporte, savedProfile.nivel_suporte, "Nao informado"),
    guardian: firstFilled(serverProfile.responsavel_nome, savedProfile.responsavel_nome, "Responsavel nao informado"),
    reportDate: firstFilled(serverProfile.report_date, new Date().toLocaleDateString("pt-BR")),
    communication: firstFilled(serverProfile.comunicacao_melhor, savedProfile.comunicacao_melhor, serverProfile.comunicacao, savedProfile.comunicacao),
    learningStyle: firstFilled(serverProfile.atividade_funciona, savedProfile.atividade_funciona, serverProfile.forma_aprendizado, savedProfile.forma_aprendizado),
    recognizedContent: firstFilled(serverProfile.conteudos_reconhecidos, savedProfile.conteudos_reconhecidos),
    sensitivities: firstFilled(serverProfile.sensibilidades_importantes, savedProfile.sensibilidades_importantes, serverProfile.sensibilidades, savedProfile.sensibilidades),
    attentionElements: firstFilled(serverProfile.elementos_atencao, savedProfile.elementos_atencao),
    priorities: firstFilled(serverProfile.prioridades, savedProfile.prioridades),
    strategies: firstFilled(serverProfile.estrategias, savedProfile.estrategias),
    routine: firstFilled(serverProfile.rotina, savedProfile.rotina),
    autonomy: firstFilled(serverProfile.autonomia, savedProfile.autonomia),
    observations: firstFilled(serverProfile.observacoes_usuario, savedProfile.observacoes_usuario)
};

const getInitials = (name) => {
    const parts = String(name || "Aluno").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AL";
};

const setText = (id, value) => {
    const element = document.getElementById(id);

    if (element && value) {
        element.textContent = value;
    }
};

const renderStudentProfile = () => {
    setText("studentInitials", getInitials(studentProfile.name));
    setText("student-name", studentProfile.name);
    setText("studentAge", studentProfile.age ? `${studentProfile.age} anos` : "Nao informado");
    setText("studentSupport", studentProfile.supportLevel);
    setText("studentGuardian", studentProfile.guardian);
    setText("reportDate", studentProfile.reportDate);

    const studentSummary = document.getElementById("studentSummary");
    if (studentSummary) {
        const learningText = formatList(studentProfile.learningStyle) || "atividades visuais e jogos educativos";
        studentSummary.textContent = `Resumo pedagogico de ${studentProfile.name}, com acompanhamento de ${learningText}.`;
    }

    const teacherNotes = document.getElementById("teacherNotes");
    if (teacherNotes) {
        if (serverReport.teacherNotes) {
            teacherNotes.value = serverReport.teacherNotes;
            return;
        }

        const notes = [
            studentProfile.observations,
            studentProfile.strategies ? `Apoios e estrategias que favorecem o desenvolvimento: ${studentProfile.strategies}.` : "",
            studentProfile.routine ? `Organizacao da rotina observada: ${studentProfile.routine}.` : "",
            studentProfile.autonomy ? `Autonomia e participacao: ${studentProfile.autonomy}.` : ""
        ].filter(Boolean).join("\n\n");

        if (notes) {
            teacherNotes.value = notes;
        }
    }
};

const renderAutomaticReport = () => {
    const automaticReportText = document.getElementById("automaticReportText");

    if (!automaticReportText) {
        return;
    }

    const priorities = formatList(studentProfile.priorities) || "as habilidades prioritarias";
    const learningStyle = formatList(studentProfile.learningStyle) || "atividades visuais e jogos educativos";
    const sensitivities = formatList(studentProfile.sensitivities);
    const strategies = studentProfile.strategies || "manter instrucoes curtas, reforco positivo e previsibilidade";
    const metrics = getOverallMetrics();
    const performanceText = metrics.attempts
        ? `Nos jogos, ha ${metrics.attempts} respostas registradas, com ${metrics.correct} acertos, ${metrics.wrong} erros e ${metrics.accuracy}% de acerto geral. O maior nivel alcancado foi ${metrics.maxLevel}. O tempo ativo na plataforma foi ${formatDuration(metrics.platformTimeMs)}. `
        : "";

    automaticReportText.textContent = `${studentProfile.name} apresenta acompanhamento direcionado para ${priorities}. O perfil indica melhor resposta a ${learningStyle}. ${performanceText}${sensitivities ? `Atencao especial para ${sensitivities}. ` : ""}Recomenda-se ${strategies}.`;
};

const getSkillScore = (skillName) => {
    const normalizedSkill = normalizeSkillName(skillName);
    const relatedGames = games.filter((game) => normalizeSkillName(game.skill) === normalizedSkill);

    if (!relatedGames.length) {
        return defaultEvolution[skillName];
    }

    const score = relatedGames.reduce((sum, game) => {
        const attempts = Number(game.attempts) || (Number(game.correct) || 0) + (Number(game.wrong) || 0);
        const totalItems = Math.max(Number(game.totalItems) || attempts || 1, 1);
        const itemProgress = Math.min(attempts / totalItems, 1);
        const answered = attempts;
        const accuracy = answered ? (game.correct || 0) / answered : itemProgress;
        const levelBoost = Math.min((Number(game.level) || 1) * 4, 16);
        const completionBoost = game.completed ? 8 : 0;

        return sum + Math.min(Math.round((itemProgress * 46) + (accuracy * 34) + levelBoost + completionBoost), 100);
    }, 0);

    return Math.round(score / relatedGames.length);
};

const getActivityDistribution = () => {
    if (!games.length) {
        return [0, 0, 0];
    }

    const completed = games.filter((game) => game.completed).length;
    const inProgress = games.filter((game) => !game.completed && ((game.attempts || 0) > 0 || (game.items?.length || 0) > 0)).length;
    const review = games.filter((game) => (game.wrong || 0) > 0).length;

    return [completed, inProgress, review];
};

const getWeeklyEvolution = () => {
    if (!sessions.length) {
        return [0, 0, 0, 0, 0, 0, 0];
    }

    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - index));
        const dayKey = day.toISOString().slice(0, 10);
        const daySessions = sessions.filter((session) => (session.createdAt || "").slice(0, 10) === dayKey);
        const correct = daySessions.filter((session) => session.correct === true).length;
        const wrong = daySessions.filter((session) => session.correct === false).length;
        const answered = correct + wrong;
        const accuracy = answered ? Math.round((correct / answered) * 100) : 0;

        return answered ? Math.min(100, Math.round((accuracy * 0.72) + (daySessions.length * 4))) : 0;
    });
};

const getOverallMetrics = () => {
    const totals = games.reduce((summary, game) => {
        const correct = Number(game.correct) || 0;
        const wrong = Number(game.wrong) || 0;
        const attempts = Number(game.attempts) || correct + wrong;

        summary.correct += correct;
        summary.wrong += wrong;
        summary.attempts += attempts;
        summary.maxLevel = Math.max(summary.maxLevel, Number(game.level) || 1);
        return summary;
    }, { correct: 0, wrong: 0, attempts: 0, maxLevel: 0 });

    totals.gameTimeMs = sessions.reduce((sum, session) => {
        return sum + Math.max(Number(session.responseTimeMs) || 0, 0);
    }, 0);

    totals.accuracy = totals.attempts ? Math.round((totals.correct / totals.attempts) * 100) : 0;
    totals.averageResponseMs = totals.attempts ? Math.round(totals.gameTimeMs / totals.attempts) : 0;
    totals.platformTimeMs = Math.max(Number(platformTime.totalMs) || 0, totals.gameTimeMs);
    totals.visits = Number(platformTime.visits) || 0;
    return totals;
};

const reportData = {
    student: {
        name: studentProfile.name,
        age: studentProfile.age,
        supportLevel: studentProfile.supportLevel,
        guardian: studentProfile.guardian,
        date: studentProfile.reportDate,
        characteristics: studentProfile
    },
    evolution: [
        { label: "Comunicação", value: getSkillScore("Comunicação"), color: "#5bb7f0", soft: "#e7f6ff", icon: "message" },
        { label: "Coordenação motora", value: getSkillScore("Coordenação motora"), color: "#7ccdb1", soft: "#e8fbf2", icon: "target" },
        { label: "Interação social", value: getSkillScore("Interação social"), color: "#9a8cff", soft: "#f1edff", icon: "users" },
        { label: "Reconhecimento de cores", value: getSkillScore("Reconhecimento de cores"), color: "#f0c95b", soft: "#fff7dc", icon: "palette" },
        { label: "Alfabetização", value: getSkillScore("Alfabetização"), color: "#f08ab3", soft: "#fff0f5", icon: "book" },
        { label: "Atenção e foco", value: getSkillScore("Atenção e foco"), color: "#5bb7f0", soft: "#e7f6ff", icon: "focus" }
    ],
    weekly: getWeeklyEvolution(),
    activities: getActivityDistribution(),
    platformStats,
    bnccAlignment,
    skills: [
        getSkillScore("Comunicação"),
        getSkillScore("Coordenação motora"),
        getSkillScore("Interação social"),
        getSkillScore("Reconhecimento de cores"),
        getSkillScore("Alfabetização"),
        getSkillScore("Atenção e foco")
    ]
};

renderStudentProfile();
renderAutomaticReport();

const icons = {
    message: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
        </svg>
    `,
    target: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8"></circle>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
        </svg>
    `,
    users: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    `,
    palette: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3a9 9 0 0 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1-2-2 2 2 0 0 1 2-2h1a8 8 0 0 0 8-8.1A9.4 9.4 0 0 0 12 3z"></path>
            <circle cx="7.5" cy="10.5" r=".5"></circle>
            <circle cx="10" cy="7.5" r=".5"></circle>
            <circle cx="14" cy="7.5" r=".5"></circle>
        </svg>
    `,
    book: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path>
        </svg>
    `,
    focus: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    `
};

const evolutionGrid = document.getElementById("evolutionGrid");

if (evolutionGrid) {
    evolutionGrid.innerHTML = reportData.evolution.map((item) => `
        <article class="evolution-card" style="--card-soft: ${item.soft}">
            <span class="evolution-icon">${icons[item.icon]}</span>
            <h3>${item.label}</h3>
            <div class="progress-row">
                <span>Evolução registrada</span>
                <strong>${item.value}%</strong>
            </div>
            <span class="progress-track" aria-hidden="true">
                <span style="--progress: ${item.value}%; background: linear-gradient(90deg, ${item.color}, #7ccdb1)"></span>
            </span>
        </article>
    `).join("");
}

const renderPlatformSummary = () => {
    const answered = platformStats.correctAnswers + platformStats.wrongAnswers;
    const accuracy = answered ? Math.round((platformStats.correctAnswers / answered) * 100) : 0;

    setText("correctAnswersMetric", String(platformStats.correctAnswers));
    setText("wrongAnswersMetric", String(platformStats.wrongAnswers));
    setText("platformTimeMetric", formatDuration(platformStats.totalTimeMs));
    setText(
        "correctAnswersText",
        answered ? `${accuracy}% de acerto nas perguntas respondidas.` : "Aguardando respostas dos jogos."
    );
    setText(
        "wrongAnswersText",
        answered ? `${platformStats.wrongAnswers} resposta(s) para revisar com reforco positivo.` : "Aguardando respostas dos jogos."
    );
    setText(
        "platformTimeText",
        platformStats.totalTimeMs ? "Tempo acumulado entre home, jogos e relatorio." : "O tempo sera contado conforme a plataforma for usada."
    );
    setText(
        "platformSummaryStatus",
        answered || platformStats.totalTimeMs ? "Dados atualizados" : "Aguardando uso"
    );
};

renderPlatformSummary();

const gamesReportGrid = document.getElementById("gamesReportGrid");
const gamesReportStatus = document.getElementById("gamesReportStatus");
const gameMetricsGrid = document.getElementById("gameMetricsGrid");
const overallMetrics = getOverallMetrics();

if (gameMetricsGrid) {
    gameMetricsGrid.innerHTML = `
        <article class="game-metric-card">
            <span>Tentativas</span>
            <strong>${overallMetrics.attempts}</strong>
            <p>Respostas registradas nos jogos.</p>
        </article>
        <article class="game-metric-card">
            <span>Acertos</span>
            <strong>${overallMetrics.correct}</strong>
            <p>Respostas corretas acumuladas.</p>
        </article>
        <article class="game-metric-card">
            <span>Erros</span>
            <strong>${overallMetrics.wrong}</strong>
            <p>Itens para revisar com calma.</p>
        </article>
        <article class="game-metric-card">
            <span>Acerto geral</span>
            <strong>${overallMetrics.accuracy}%</strong>
            <p>Maior nivel: ${overallMetrics.maxLevel || "Aguardando"}</p>
        </article>
        <article class="game-metric-card">
            <span>Tempo na plataforma</span>
            <strong>${formatDuration(overallMetrics.platformTimeMs)}</strong>
            <p>${overallMetrics.visits} acessos registrados.</p>
        </article>
        <article class="game-metric-card">
            <span>Tempo em respostas</span>
            <strong>${formatDuration(overallMetrics.gameTimeMs)}</strong>
            <p>Media: ${formatDuration(overallMetrics.averageResponseMs)} por resposta.</p>
        </article>
    `;
}

if (gamesReportGrid) {
    if (games.length) {
        gamesReportGrid.innerHTML = games.map((game) => {
            const attempts = Number(game.attempts) || (Number(game.correct) || 0) + (Number(game.wrong) || 0);
            const correct = Number(game.correct) || 0;
            const wrong = Number(game.wrong) || 0;
            const totalItems = Math.max(Number(game.totalItems) || attempts || 1, 1);
            const explored = Math.min(attempts, totalItems);
            const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
            const progress = Math.min(Math.round((explored / totalItems) * 100), 100);
            const gameSessions = sessions.filter((session) => session.gameId === game.id);
            const gameTimeMs = gameSessions.reduce((sum, session) => sum + Math.max(Number(session.responseTimeMs) || 0, 0), 0);
            const level = getGameLevel(game);
            const remaining = getCorrectToNextLevel(game);

            return `
                <article class="game-report-card">
                    <strong>${game.title}</strong>
                    <p>${game.skill}. Fase atual: ${level}. Acertou ${correct} e errou ${wrong} pergunta(s).</p>
                    <span class="game-report-card__bar" aria-hidden="true"><span style="width: ${progress}%"></span></span>
                    <div class="game-report-card__meta">
                        <span>${explored}/${totalItems} perguntas</span>
                        <span>${correct} acertos</span>
                        <span>${wrong} erros</span>
                        <span>${accuracy}% acerto</span>
                        <span>${remaining} para avancar</span>
                        <span>${formatDuration(gameTimeMs)} respondendo</span>
                        <span>${game.completed ? "Concluido" : "Em andamento"}</span>
                    </div>
                </article>
            `;
        }).join("");

        if (gamesReportStatus) {
            gamesReportStatus.textContent = `${overallMetrics.attempts} respostas em ${games.length} jogos`;
        }
    } else {
        gamesReportGrid.innerHTML = `
            <article class="game-report-card">
                <strong>Nenhum jogo registrado ainda</strong>
                <p>Ao jogar cores, letras, silabas, numeros ou matematica visual, os dados aparecerao automaticamente neste relatorio.</p>
                <div class="game-report-card__meta">
                    <span>Aguardando atividades</span>
                </div>
            </article>
        `;
    }
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: "#49657d",
                font: {
                    family: "Montserrat",
                    weight: 700
                },
                usePointStyle: true,
                boxWidth: 8
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: "#6b8095",
                font: { family: "Montserrat", weight: 600 }
            },
            grid: { display: false }
        },
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                color: "#6b8095",
                font: { family: "Montserrat", weight: 600 }
            },
            grid: { color: "rgba(87, 128, 166, 0.12)" }
        }
    }
};

const createCharts = () => {
    if (!window.Chart) {
        document.querySelectorAll(".chart-card").forEach((card) => {
            card.insertAdjacentHTML("beforeend", "<p class=\"chart-fallback\">Gráfico indisponível no momento.</p>");
        });
        return;
    }

    const weeklyChart = document.getElementById("weeklyChart");
    const activitiesChart = document.getElementById("activitiesChart");
    const skillsChart = document.getElementById("skillsChart");

    if (weeklyChart) {
        new Chart(weeklyChart, {
            type: "line",
            data: {
                labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
                datasets: [{
                    label: "Evolução",
                    data: reportData.weekly,
                    borderColor: "#2479b6",
                    backgroundColor: "rgba(91, 183, 240, 0.18)",
                    fill: true,
                    tension: 0.42,
                    pointRadius: 4,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#2479b6",
                    pointBorderWidth: 2
                }]
            },
            options: chartOptions
        });
    }

    if (activitiesChart) {
        new Chart(activitiesChart, {
            type: "doughnut",
            data: {
                labels: ["Concluídas", "Em andamento", "Revisar"],
                datasets: [{
                    data: reportData.activities,
                    backgroundColor: ["#5bb7f0", "#7ccdb1", "#f0c95b"],
                    borderColor: "#ffffff",
                    borderWidth: 5,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                plugins: chartOptions.plugins
            }
        });
    }

    if (skillsChart) {
        new Chart(skillsChart, {
            type: "bar",
            data: {
                labels: ["Comunicação", "Coordenação", "Social", "Cores", "Alfabetização", "Foco"],
                datasets: [{
                    label: "Desempenho",
                    data: reportData.skills,
                    backgroundColor: ["#5bb7f0", "#7ccdb1", "#9a8cff", "#f0c95b", "#f08ab3", "#72c4f4"],
                    borderRadius: 12,
                    borderSkipped: false
                }]
            },
            options: chartOptions
        });
    }
};

createCharts();

const getNotes = () => document.getElementById("teacherNotes")?.value.trim() || "";

const canSyncReport = () => {
    const staticServerPorts = new Set(["5500", "5501"]);
    return window.location.protocol !== "file:" && !staticServerPorts.has(window.location.port) && typeof fetch === "function";
};
let reportSyncTimer = 0;

const saveReportToServer = () => {
    if (!canSyncReport()) {
        return;
    }

    fetch("report-api.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
            teacherNotes: getNotes(),
            reportData
        })
    }).catch(() => {});
};

const scheduleReportSave = () => {
    window.clearTimeout(reportSyncTimer);
    reportSyncTimer = window.setTimeout(saveReportToServer, 500);
};

document.getElementById("teacherNotes")?.addEventListener("input", scheduleReportSave);
window.addEventListener("pagehide", saveReportToServer);

document.getElementById("pdfButton")?.addEventListener("click", () => {
    saveReportToServer();
    window.print();
});

document.getElementById("shareButton")?.addEventListener("click", async () => {
    const shareData = {
        title: "Relatório Educacional INKLUA Tech",
        text: `Relatório educacional de ${reportData.student.name}.`,
        url: window.location.href
    };

    if (navigator.share) {
        await navigator.share(shareData);
        return;
    }

    await navigator.clipboard?.writeText(window.location.href);
    alert("Link do relatório copiado.");
});

document.getElementById("exportButton")?.addEventListener("click", () => {
    saveReportToServer();
    const payload = {
        ...reportData,
        gameProgress,
        teacherNotes: getNotes(),
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-educacional-inklua-tech.json";
    link.click();
    URL.revokeObjectURL(url);
});
