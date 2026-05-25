const defaultEvolution = {
    "Comunicação": 78,
    "Coordenação motora": 64,
    "Interação social": 72,
    "Reconhecimento de cores": 86,
    "Alfabetização": 58,
    "Atenção e foco": 69
};

const readGameProgress = () => {
    try {
        return JSON.parse(localStorage.getItem("inklua_game_progress_v1")) || { games: {}, sessions: [] };
    } catch (error) {
        return { games: {}, sessions: [] };
    }
};

const gameProgress = readGameProgress();
const games = Object.values(gameProgress.games || {});
const sessions = gameProgress.sessions || [];

const getSkillScore = (skillName) => {
    const relatedGames = games.filter((game) => game.skill === skillName);

    if (!relatedGames.length) {
        return defaultEvolution[skillName];
    }

    const score = relatedGames.reduce((sum, game) => {
        const totalItems = Math.max(Number(game.totalItems) || 1, 1);
        const itemProgress = Math.min((game.items?.length || 0) / totalItems, 1);
        const answered = (game.correct || 0) + (game.wrong || 0);
        const accuracy = answered ? (game.correct || 0) / answered : itemProgress;
        const completionBoost = game.completed ? 10 : 0;

        return sum + Math.min(Math.round((itemProgress * 65) + (accuracy * 25) + completionBoost), 100);
    }, 0);

    return Math.round(score / relatedGames.length);
};

const getActivityDistribution = () => {
    if (!games.length) {
        return [34, 10, 6];
    }

    const completed = games.filter((game) => game.completed).length;
    const inProgress = games.filter((game) => !game.completed && (game.items?.length || 0) > 0).length;
    const review = games.filter((game) => (game.wrong || 0) > 0).length;

    return [completed, inProgress, review];
};

const getWeeklyEvolution = () => {
    if (!sessions.length) {
        return [42, 48, 55, 61, 66, 72, 78];
    }

    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - index));
        const dayKey = day.toISOString().slice(0, 10);
        const daySessions = sessions.filter((session) => (session.createdAt || "").slice(0, 10) === dayKey);
        const correct = daySessions.filter((session) => session.correct === true).length;
        const completed = daySessions.filter((session) => session.completed).length;

        return Math.min(100, 35 + (daySessions.length * 7) + (correct * 4) + (completed * 8));
    });
};

const reportData = {
    student: {
        name: "Lucas Andrade",
        age: "8 anos",
        grade: "3º ano",
        supportLevel: "Nível 1",
        guardian: "Mariana Andrade",
        date: "25/05/2026"
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
    skills: [
        getSkillScore("Comunicação"),
        getSkillScore("Coordenação motora"),
        getSkillScore("Interação social"),
        getSkillScore("Reconhecimento de cores"),
        getSkillScore("Alfabetização"),
        getSkillScore("Atenção e foco")
    ]
};

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

const gamesReportGrid = document.getElementById("gamesReportGrid");
const gamesReportStatus = document.getElementById("gamesReportStatus");

if (gamesReportGrid) {
    if (games.length) {
        gamesReportGrid.innerHTML = games.map((game) => {
            const totalItems = Math.max(Number(game.totalItems) || 1, 1);
            const explored = game.items?.length || 0;
            const accuracyTotal = (game.correct || 0) + (game.wrong || 0);
            const accuracy = accuracyTotal ? Math.round(((game.correct || 0) / accuracyTotal) * 100) : 100;

            return `
                <article class="game-report-card">
                    <strong>${game.title}</strong>
                    <p>${game.skill}</p>
                    <div class="game-report-card__meta">
                        <span>${explored}/${totalItems} itens</span>
                        <span>${accuracy}% acerto</span>
                        <span>${game.completed ? "Concluido" : "Em andamento"}</span>
                    </div>
                </article>
            `;
        }).join("");

        if (gamesReportStatus) {
            gamesReportStatus.textContent = `${games.length} jogos com dados`;
        }
    } else {
        gamesReportGrid.innerHTML = `
            <article class="game-report-card">
                <strong>Nenhum jogo registrado ainda</strong>
                <p>Ao jogar cores, formas, letras, numeros, rotina ou emocoes, os dados aparecerao automaticamente neste relatorio.</p>
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

document.getElementById("pdfButton")?.addEventListener("click", () => {
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
