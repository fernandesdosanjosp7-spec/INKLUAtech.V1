<?php
session_start();

require __DIR__ . "/db.php";

if (empty($_SESSION["user_id"])) {
    header("Location: Index.html#login");
    exit;
}

$databaseError = "";
$savedMessage = "";
$user = [];

try {
    $pdo = getDatabase();
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id LIMIT 1");
    $stmt->execute([":id" => $_SESSION["user_id"]]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        $_SESSION = [];
        session_destroy();
        header("Location: Index.html#login");
        exit;
    }

    if (($_GET["status"] ?? "") === "registered") {
        $savedMessage = "Cadastro criado com sucesso.";
    }

    if (($_GET["status"] ?? "") === "profile_saved") {
        $savedMessage = "Formulario salvo com sucesso.";
    }
} catch (Throwable $e) {
    $databaseError = $e->getMessage();
}

function h(?string $value): string
{
    return htmlspecialchars($value ?? "", ENT_QUOTES, "UTF-8");
}

function selectedValue(array $user, string $key, string $value): string
{
    return (($user[$key] ?? "") === $value) ? " selected" : "";
}

function checkedValue(array $user, string $key, string $value): string
{
    $values = array_map("trim", explode(",", $user[$key] ?? ""));
    return in_array($value, $values, true) ? " checked" : "";
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
                <a href="#formulario">Formul&aacute;rio</a>
                <a href="#jogos">Jogos</a>
                <a href="#aprendizado">Aprendizado</a>
                <a href="#rotina">Rotina</a>
                <a href="#apoio">Apoio</a>
            </nav>

            <div class="student-card">
                <span>Perfil</span>
                <strong><?php echo h($user["aluno_nome"] ?: "Aluno"); ?></strong>
                <p>Atividades visuais, previs&iacute;veis e adaptadas.</p>
            </div>
        </aside>

        <section class="platform-content">
            <header class="topbar">
                <div>
                    <p class="eyebrow">Painel principal</p>
                    <h1>Jogos e aprendizado educativo</h1>
                </div>
                <a class="topbar-button" href="auth.php?action=logout">Sair</a>
            </header>

            <?php if (!empty($databaseError)) : ?>
                <p class="system-alert">Erro no banco de dados: <?php echo htmlspecialchars($databaseError, ENT_QUOTES, "UTF-8"); ?></p>
            <?php endif; ?>

            <?php if (!empty($savedMessage)) : ?>
                <p class="system-success"><?php echo htmlspecialchars($savedMessage, ENT_QUOTES, "UTF-8"); ?></p>
            <?php endif; ?>

            <section class="overview-grid platform-view is-active-view" id="inicio" data-view="inicio" aria-label="Resumo do dia">
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

            <section class="section-block platform-view" id="formulario" data-view="formulario" aria-labelledby="form-title">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">Perfil do aluno</p>
                        <h2 id="form-title">Formul&aacute;rio de adapta&ccedil;&atilde;o</h2>
                    </div>
                </div>

                <form class="platform-form" action="auth.php" method="post">
                    <input type="hidden" name="action" value="update_profile">
                    <div class="form-group">
                        <label for="platform-nivel-suporte">1&deg; Qual o n&iacute;vel de suporte do estudante?</label>
                        <select id="platform-nivel-suporte" name="nivel_suporte">
                            <option value="">Selecione</option>
                            <option value="nivel-1"<?php echo selectedValue($user, "nivel_suporte", "nivel-1"); ?>>N&iacute;vel 1 - necessita de pouco apoio</option>
                            <option value="nivel-2"<?php echo selectedValue($user, "nivel_suporte", "nivel-2"); ?>>N&iacute;vel 2 - necessita de apoio substancial</option>
                            <option value="nivel-3"<?php echo selectedValue($user, "nivel_suporte", "nivel-3"); ?>>N&iacute;vel 3 - necessita de apoio muito substancial</option>
                            <option value="nao-informado"<?php echo selectedValue($user, "nivel_suporte", "nao-informado"); ?>>N&atilde;o sei informar</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="platform-sensibilidades">2&deg; O usu&aacute;rio possui sensibilidade a sons altos, anima&ccedil;&otilde;es intensas ou excesso de informa&ccedil;&otilde;es na tela?</label>
                        <textarea id="platform-sensibilidades" name="sensibilidades" rows="3"><?php echo h($user["sensibilidades"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-preferencias-visuais">3&deg; Quais cores, temas ou estilos visuais deixam o usu&aacute;rio mais confort&aacute;vel durante o uso da plataforma?</label>
                        <textarea id="platform-preferencias-visuais" name="preferencias_visuais" rows="3"><?php echo h($user["preferencias_visuais"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-forma-aprendizado">4&deg; O usu&aacute;rio aprende melhor atrav&eacute;s de imagens, sons, textos, jogos ou atividades pr&aacute;ticas?</label>
                        <textarea id="platform-forma-aprendizado" name="forma_aprendizado" rows="3"><?php echo h($user["forma_aprendizado"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-comunicacao">5&deg; O usu&aacute;rio possui dificuldade de comunica&ccedil;&atilde;o verbal? Se sim, quais formas de comunica&ccedil;&atilde;o ele utiliza com mais facilidade?</label>
                        <textarea id="platform-comunicacao" name="comunicacao" rows="3"><?php echo h($user["comunicacao"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-hiperfocos">6&deg; Existem hiperfocos, interesses espec&iacute;ficos ou temas favoritos que possam ser usados para melhorar o aprendizado?</label>
                        <textarea id="platform-hiperfocos" name="hiperfocos" rows="3"><?php echo h($user["hiperfocos"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-rotina">7&deg; O usu&aacute;rio prefere rotinas bem organizadas e previs&iacute;veis durante as atividades?</label>
                        <textarea id="platform-rotina" name="rotina" rows="3"><?php echo h($user["rotina"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-desconfortos">8&deg; Quais situa&ccedil;&otilde;es normalmente causam desconforto, ansiedade ou distra&ccedil;&atilde;o durante o aprendizado?</label>
                        <textarea id="platform-desconfortos" name="desconfortos" rows="3"><?php echo h($user["desconfortos"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-autonomia">9&deg; O usu&aacute;rio necessita de apoio constante durante as atividades ou consegue realizar tarefas sozinho?</label>
                        <textarea id="platform-autonomia" name="autonomia" rows="3"><?php echo h($user["autonomia"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <span class="form-label">10&deg; Quais habilidades o respons&aacute;vel, professor ou terapeuta deseja desenvolver com maior prioridade?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="prioridades[]" value="fala"<?php echo checkedValue($user, "prioridades", "fala"); ?>> Fala</label>
                            <label><input type="checkbox" name="prioridades[]" value="coordenacao"<?php echo checkedValue($user, "prioridades", "coordenacao"); ?>> Coordena&ccedil;&atilde;o</label>
                            <label><input type="checkbox" name="prioridades[]" value="leitura"<?php echo checkedValue($user, "prioridades", "leitura"); ?>> Leitura</label>
                            <label><input type="checkbox" name="prioridades[]" value="socializacao"<?php echo checkedValue($user, "prioridades", "socializacao"); ?>> Socializa&ccedil;&atilde;o</label>
                            <label><input type="checkbox" name="prioridades[]" value="atencao"<?php echo checkedValue($user, "prioridades", "atencao"); ?>> Aten&ccedil;&atilde;o</label>
                            <label><input type="checkbox" name="prioridades[]" value="autonomia"<?php echo checkedValue($user, "prioridades", "autonomia"); ?>> Autonomia</label>
                            <label><input type="checkbox" name="prioridades[]" value="cores-numeros-letras"<?php echo checkedValue($user, "prioridades", "cores-numeros-letras"); ?>> Reconhecimento de cores/n&uacute;meros/letras</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="platform-estrategias">11&deg; Existe alguma estrat&eacute;gia, m&eacute;todo ou adapta&ccedil;&atilde;o que j&aacute; funciona bem com o usu&aacute;rio no dia a dia escolar ou terap&ecirc;utico?</label>
                        <textarea id="platform-estrategias" name="estrategias" rows="3"><?php echo h($user["estrategias"] ?? ""); ?></textarea>
                    </div>

                    <button class="complete-button form-submit" type="submit">Salvar respostas</button>
                    <p class="form-status" aria-live="polite"></p>
                </form>
            </section>

            <section class="section-block platform-view" id="jogos" data-view="jogos" aria-labelledby="games-title">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">Jogos educativos</p>
                        <h2 id="games-title">Escolha uma atividade para come&ccedil;ar</h2>
                    </div>
                </div>

                <div class="game-grid">
                    <article class="game-card">
                        <span class="game-badge">Emo&ccedil;&otilde;es</span>
                        <h3>Jogo das Emo&ccedil;&otilde;es</h3>
                        <p>Associe express&otilde;es, sentimentos e situa&ccedil;&otilde;es do cotidiano.</p>
                        <a class="game-button" href="emocoes.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-badge game-badge--mint">Rotina</span>
                        <h3>Sequ&ecirc;ncia da Rotina</h3>
                        <p>Organize passos como chegada, atividade, pausa e finaliza&ccedil;&atilde;o.</p>
                        <a class="game-button" href="rotina-jogo.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-badge game-badge--yellow">Percep&ccedil;&atilde;o</span>
                        <h3>Jogo das Cores</h3>
                        <p>Toque em uma cor para ouvir seu nome em voz alta.</p>
                        <a class="game-button" href="cores.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-badge game-badge--yellow">Formas</span>
                        <h3>Formas Faladas</h3>
                        <p>Toque em uma forma geom&eacute;trica para ouvir seu nome.</p>
                        <a class="game-button" href="formas.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-badge game-badge--pink">Letras</span>
                        <h3>Alfabeto Falado</h3>
                        <p>Toque em uma letra para ouvir seu nome em voz alta.</p>
                        <a class="game-button" href="alfabeto.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-badge game-badge--mint">N&uacute;meros</span>
                        <h3>N&uacute;meros Falados</h3>
                        <p>Toque em um n&uacute;mero de 0 a 10 para ouvir qual n&uacute;mero &eacute;.</p>
                        <a class="game-button" href="numeros.html">Jogar</a>
                    </article>
                </div>
            </section>

            <section class="section-block platform-view" id="aprendizado" data-view="aprendizado" aria-labelledby="learning-title">
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

                <article class="section-block platform-view" id="rotina" data-view="rotina">
                    <p class="eyebrow">Rotina</p>
                    <h2>Meu dia</h2>
                    <ol class="routine-list">
                        <li>Boas-vindas</li>
                        <li>Jogo educativo</li>
                        <li>Pausa sensorial</li>
                        <li>Atividade de comunica&ccedil;&atilde;o</li>
                    </ol>
                </article>

                <article class="section-block platform-view" id="apoio" data-view="apoio">
                    <p class="eyebrow">Apoio</p>
                    <h2>Prefer&ecirc;ncias do aluno</h2>
                    <p class="support-text">
                        Use as informa&ccedil;&otilde;es do cadastro para adaptar atividades, reduzir sobrecarga sensorial e registrar estrat&eacute;gias que ajudam.
                    </p>
                </article>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
