<?php
$databaseError = "";
$savedMessage = "";

try {
    if (!extension_loaded("pdo_sqlite")) {
        throw new RuntimeException("A extensao pdo_sqlite nao esta ativa no PHP.");
    }

    if (!is_writable(__DIR__)) {
        throw new RuntimeException("A pasta do projeto nao tem permissao de escrita para criar ou atualizar o banco.");
    }

    $databasePath = __DIR__ . DIRECTORY_SEPARATOR . "database.db";
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT,
            cpf TEXT,
            senha TEXT,
            responsavel_nome TEXT,
            responsavel_vinculo TEXT,
            aluno_nome TEXT,
            aluno_idade INTEGER,
            preferencias TEXT,
            sensibilidades TEXT,
            comunicacao TEXT,
            rotina TEXT
        )
    ");

    $columns = $pdo->query("PRAGMA table_info(usuarios)")->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, "name");
    $requiredColumns = [
        "nome" => "TEXT",
        "email" => "TEXT",
        "cpf" => "TEXT",
        "senha" => "TEXT",
        "responsavel_nome" => "TEXT",
        "responsavel_vinculo" => "TEXT",
        "aluno_nome" => "TEXT",
        "aluno_idade" => "INTEGER",
        "preferencias" => "TEXT",
        "sensibilidades" => "TEXT",
        "comunicacao" => "TEXT",
        "rotina" => "TEXT"
    ];

    foreach ($requiredColumns as $column => $type) {
        if (!in_array($column, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN {$column} {$type}");
        }
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST" && !empty($_POST["responsavel_nome"])) {
        $alunoIdade = $_POST["aluno_idade"] ?? null;
        $alunoIdade = $alunoIdade === "" ? null : $alunoIdade;

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (
                nome,
                email,
                cpf,
                senha,
                responsavel_nome,
                responsavel_vinculo,
                aluno_nome,
                aluno_idade,
                preferencias,
                sensibilidades,
                comunicacao,
                rotina
            ) VALUES (
                :nome,
                :email,
                :cpf,
                :senha,
                :responsavel_nome,
                :responsavel_vinculo,
                :aluno_nome,
                :aluno_idade,
                :preferencias,
                :sensibilidades,
                :comunicacao,
                :rotina
            )
        ");

        $stmt->execute([
            ":nome" => $_POST["responsavel_nome"] ?? "",
            ":email" => "",
            ":cpf" => $_POST["cpf"] ?? "",
            ":senha" => $_POST["senha"] ?? "",
            ":responsavel_nome" => $_POST["responsavel_nome"] ?? "",
            ":responsavel_vinculo" => $_POST["responsavel_vinculo"] ?? "",
            ":aluno_nome" => $_POST["aluno_nome"] ?? "",
            ":aluno_idade" => $alunoIdade,
            ":preferencias" => $_POST["preferencias"] ?? "",
            ":sensibilidades" => $_POST["sensibilidades"] ?? "",
            ":comunicacao" => $_POST["comunicacao"] ?? "",
            ":rotina" => $_POST["rotina"] ?? ""
        ]);

        $savedMessage = "Cadastro salvo com sucesso.";
    }
} catch (Throwable $e) {
    $databaseError = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INKLUAtech | Plataforma</title>
    <link rel="stylesheet" href="home.css">
</head>
<body>
    <main class="platform-shell">
        <aside class="sidebar" aria-label="Navega&ccedil;&atilde;o da plataforma">
            <a class="brand" href="Index.html">
                <img src="assets/ink-logo.png" alt="Logo Inklua Tech">
                <span>Inklua Tech</span>
            </a>

            <nav class="nav-menu">
                <a class="is-active" href="#inicio">In&iacute;cio</a>
                <a href="#jogos">Jogos</a>
                <a href="#aprendizado">Aprendizado</a>
                <a href="#rotina">Rotina</a>
                <a href="#apoio">Apoio</a>
            </nav>

            <div class="student-card">
                <span>Perfil</span>
                <strong>Aluno</strong>
                <p>Atividades visuais, previs&iacute;veis e adaptadas.</p>
            </div>
        </aside>

        <section class="platform-content">
            <header class="topbar" id="inicio">
                <div>
                    <p class="eyebrow">Painel principal</p>
                    <h1>Jogos e aprendizado educativo</h1>
                </div>
                <a class="topbar-button" href="Index.html">Sair</a>
            </header>

            <?php if (!empty($databaseError)) : ?>
                <p class="system-alert">Erro no banco de dados: <?php echo htmlspecialchars($databaseError, ENT_QUOTES, "UTF-8"); ?></p>
            <?php endif; ?>

            <?php if (!empty($savedMessage)) : ?>
                <p class="system-success"><?php echo htmlspecialchars($savedMessage, ENT_QUOTES, "UTF-8"); ?></p>
            <?php endif; ?>

            <section class="overview-grid" aria-label="Resumo do dia">
                <article class="overview-card">
                    <span class="overview-icon overview-icon--blue">1</span>
                    <div>
                        <strong>Atividades de hoje</strong>
                        <p>5 jogos recomendados</p>
                    </div>
                </article>
                <article class="overview-card">
                    <span class="overview-icon overview-icon--mint">2</span>
                    <div>
                        <strong>Objetivo</strong>
                        <p>Comunica&ccedil;&atilde;o e rotina</p>
                    </div>
                </article>
                <article class="overview-card">
                    <span class="overview-icon overview-icon--yellow">3</span>
                    <div>
                        <strong>Progresso</strong>
                        <p><span id="progressCount">0</span> atividades conclu&iacute;das</p>
                    </div>
                </article>
            </section>

            <section class="section-block" id="jogos" aria-labelledby="games-title">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">Jogos educativos</p>
                        <h2 id="games-title">Escolha uma atividade para come&ccedil;ar</h2>
                    </div>
                </div>

                <div class="game-grid">
                    <article class="game-card" data-activity="emocoes">
                        <span class="game-badge">Emo&ccedil;&otilde;es</span>
                        <h3>Jogo das Emo&ccedil;&otilde;es</h3>
                        <p>Associe express&otilde;es, sentimentos e situa&ccedil;&otilde;es do cotidiano.</p>
                        <button class="game-button" type="button">Iniciar</button>
                    </article>

                    <article class="game-card" data-activity="rotina">
                        <span class="game-badge game-badge--mint">Rotina</span>
                        <h3>Sequ&ecirc;ncia da Rotina</h3>
                        <p>Organize passos como chegada, atividade, pausa e finaliza&ccedil;&atilde;o.</p>
                        <button class="game-button" type="button">Iniciar</button>
                    </article>

                    <article class="game-card" data-activity="formas">
                        <span class="game-badge game-badge--yellow">Percep&ccedil;&atilde;o</span>
                        <h3>Cores e Formas</h3>
                        <p>Reconhe&ccedil;a padr&otilde;es visuais com instru&ccedil;&otilde;es simples.</p>
                        <button class="game-button" type="button">Iniciar</button>
                    </article>

                    <article class="game-card" data-activity="alfabeto">
                        <span class="game-badge game-badge--pink">Letras</span>
                        <h3>Alfabeto Falado</h3>
                        <p>Toque em uma letra para ouvir seu nome em voz alta.</p>
                        <a class="game-button" href="alfabeto.html">Jogar</a>
                    </article>

                    <article class="game-card" data-activity="numeros">
                        <span class="game-badge game-badge--mint">N&uacute;meros</span>
                        <h3>N&uacute;meros Falados</h3>
                        <p>Toque em um n&uacute;mero de 0 a 10 para ouvir qual n&uacute;mero &eacute;.</p>
                        <a class="game-button" href="numeros.html">Jogar</a>
                    </article>
                </div>
            </section>

            <section class="activity-board" aria-live="polite">
                <div class="activity-board__header">
                    <div>
                        <p class="eyebrow">Atividade aberta</p>
                        <h2 id="activityTitle">Selecione um jogo</h2>
                    </div>
                    <button class="complete-button" id="completeActivity" type="button" disabled>Concluir atividade</button>
                </div>

                <div class="activity-panel" id="activityPanel">
                    <p>Ao iniciar um jogo, as instru&ccedil;&otilde;es aparecem aqui com uma experi&ecirc;ncia simples e previs&iacute;vel.</p>
                </div>
            </section>

            <section class="section-block" id="aprendizado" aria-labelledby="learning-title">
                <p class="eyebrow">Aprendizado</p>
                <h2 id="learning-title">Trilhas educativas</h2>
                <div class="learning-list">
                    <article>
                        <strong>Comunica&ccedil;&atilde;o alternativa</strong>
                        <p>Cart&otilde;es visuais para expressar necessidades e escolhas.</p>
                    </article>
                    <article>
                        <strong>Matem&aacute;tica visual</strong>
                        <p>Contagem, compara&ccedil;&atilde;o e associa&ccedil;&atilde;o com apoio visual.</p>
                    </article>
                    <article>
                        <strong>Leitura e imagens</strong>
                        <p>Palavras, figuras e frases curtas com refor&ccedil;o positivo.</p>
                    </article>
                </div>
            </section>

            <section class="two-column">
                <article class="section-block" id="rotina">
                    <p class="eyebrow">Rotina</p>
                    <h2>Meu dia</h2>
                    <ol class="routine-list">
                        <li>Boas-vindas</li>
                        <li>Jogo educativo</li>
                        <li>Pausa sensorial</li>
                        <li>Atividade de comunica&ccedil;&atilde;o</li>
                    </ol>
                </article>

                <article class="section-block" id="apoio">
                    <p class="eyebrow">Apoio</p>
                    <h2>Prefer&ecirc;ncias do aluno</h2>
                    <p class="support-text">
                        Use as informa&ccedil;&otilde;es do cadastro para adaptar atividades, reduzir sobrecarga sensorial e registrar estrat&eacute;gias que ajudam.
                    </p>
                </article>
            </section>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
