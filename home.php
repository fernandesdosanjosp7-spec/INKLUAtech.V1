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

function reportValue(array $user, string $key, string $fallback): string
{
    $value = trim((string) ($user[$key] ?? ""));

    if ($value === "") {
        return $fallback;
    }

    return h(str_replace("-", " ", $value));
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
                <a href="#relatorio">Relat&oacute;rio</a>
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

            <section class="platform-view is-active-view" id="inicio" data-view="inicio" aria-label="Resumo do dia">
                <div class="welcome-panel">
                    <p class="eyebrow">Boas-vindas</p>
                    <h2><span id="welcomeGreeting">Ol&aacute;</span>, <?php echo h($user["aluno_nome"] ?: "aluno"); ?>!</h2>
                    <p>Hoje separamos atividades curtas para praticar comunica&ccedil;&atilde;o, rotina e percep&ccedil;&atilde;o com calma.</p>
                    <div class="welcome-actions" aria-label="Atalhos de in&iacute;cio">
                        <a href="#jogos">Come&ccedil;ar pelos jogos</a>
                        <a href="#rotina">Ver rotina</a>
                        <a href="#aprendizado">Trilhas educativas</a>
                    </div>
                </div>

                <div class="overview-grid">
                <article class="overview-card">
                    <span class="overview-icon overview-icon--blue">1</span>
                    <div>
                        <strong>Atividades de hoje</strong>
                        <p>8 jogos recomendados</p>
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
                </div>
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
                        <span class="form-label">2&deg; Como o usu&aacute;rio se comunica melhor?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="comunicacao_melhor[]" value="fala"<?php echo checkedValue($user, "comunicacao_melhor", "fala"); ?>> Fala</label>
                            <label><input type="checkbox" name="comunicacao_melhor[]" value="gestos"<?php echo checkedValue($user, "comunicacao_melhor", "gestos"); ?>> Gestos</label>
                            <label><input type="checkbox" name="comunicacao_melhor[]" value="imagens"<?php echo checkedValue($user, "comunicacao_melhor", "imagens"); ?>> Imagens</label>
                            <label><input type="checkbox" name="comunicacao_melhor[]" value="escrita"<?php echo checkedValue($user, "comunicacao_melhor", "escrita"); ?>> Escrita</label>
                            <label><input type="checkbox" name="comunicacao_melhor[]" value="sons"<?php echo checkedValue($user, "comunicacao_melhor", "sons"); ?>> Sons</label>
                            <label><input type="checkbox" name="comunicacao_melhor[]" value="comunicacao-alternativa"<?php echo checkedValue($user, "comunicacao_melhor", "comunicacao-alternativa"); ?>> Comunica&ccedil;&atilde;o alternativa</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="form-label">3&deg; Ele compreende melhor:</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="compreensao_melhor[]" value="frases-curtas"<?php echo checkedValue($user, "compreensao_melhor", "frases-curtas"); ?>> Frases curtas</label>
                            <label><input type="checkbox" name="compreensao_melhor[]" value="imagens"<?php echo checkedValue($user, "compreensao_melhor", "imagens"); ?>> Imagens</label>
                            <label><input type="checkbox" name="compreensao_melhor[]" value="repeticao"<?php echo checkedValue($user, "compreensao_melhor", "repeticao"); ?>> Repeti&ccedil;&atilde;o</label>
                            <label><input type="checkbox" name="compreensao_melhor[]" value="demonstracao-pratica"<?php echo checkedValue($user, "compreensao_melhor", "demonstracao-pratica"); ?>> Demonstra&ccedil;&atilde;o pr&aacute;tica</label>
                            <label><input type="checkbox" name="compreensao_melhor[]" value="videos"<?php echo checkedValue($user, "compreensao_melhor", "videos"); ?>> V&iacute;deos</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="form-label">4&deg; Quais conte&uacute;dos ele j&aacute; reconhece?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="conteudos_reconhecidos[]" value="letras"<?php echo checkedValue($user, "conteudos_reconhecidos", "letras"); ?>> Letras</label>
                            <label><input type="checkbox" name="conteudos_reconhecidos[]" value="numeros"<?php echo checkedValue($user, "conteudos_reconhecidos", "numeros"); ?>> N&uacute;meros</label>
                            <label><input type="checkbox" name="conteudos_reconhecidos[]" value="cores"<?php echo checkedValue($user, "conteudos_reconhecidos", "cores"); ?>> Cores</label>
                            <label><input type="checkbox" name="conteudos_reconhecidos[]" value="animais"<?php echo checkedValue($user, "conteudos_reconhecidos", "animais"); ?>> Animais</label>
                            <label><input type="checkbox" name="conteudos_reconhecidos[]" value="formas"<?php echo checkedValue($user, "conteudos_reconhecidos", "formas"); ?>> Formas</label>
                            <label><input type="checkbox" name="conteudos_reconhecidos[]" value="objetos-dia-a-dia"<?php echo checkedValue($user, "conteudos_reconhecidos", "objetos-dia-a-dia"); ?>> Objetos do dia a dia</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="form-label">5&deg; Qual forma de atividade costuma funcionar melhor?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="atividade_funciona[]" value="jogos"<?php echo checkedValue($user, "atividade_funciona", "jogos"); ?>> Jogos</label>
                            <label><input type="checkbox" name="atividade_funciona[]" value="associacao-imagens"<?php echo checkedValue($user, "atividade_funciona", "associacao-imagens"); ?>> Associa&ccedil;&atilde;o de imagens</label>
                            <label><input type="checkbox" name="atividade_funciona[]" value="audios"<?php echo checkedValue($user, "atividade_funciona", "audios"); ?>> &Aacute;udios</label>
                            <label><input type="checkbox" name="atividade_funciona[]" value="videos"<?php echo checkedValue($user, "atividade_funciona", "videos"); ?>> V&iacute;deos</label>
                            <label><input type="checkbox" name="atividade_funciona[]" value="repeticao"<?php echo checkedValue($user, "atividade_funciona", "repeticao"); ?>> Atividades com repeti&ccedil;&atilde;o</label>
                            <label><input type="checkbox" name="atividade_funciona[]" value="curtas"<?php echo checkedValue($user, "atividade_funciona", "curtas"); ?>> Atividades curtas</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="form-label">6&deg; Existe alguma sensibilidade importante?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="sensibilidades_importantes[]" value="sons-altos"<?php echo checkedValue($user, "sensibilidades_importantes", "sons-altos"); ?>> Sons altos</label>
                            <label><input type="checkbox" name="sensibilidades_importantes[]" value="luz-forte"<?php echo checkedValue($user, "sensibilidades_importantes", "luz-forte"); ?>> Luz forte</label>
                            <label><input type="checkbox" name="sensibilidades_importantes[]" value="muitas-cores"<?php echo checkedValue($user, "sensibilidades_importantes", "muitas-cores"); ?>> Muitas cores</label>
                            <label><input type="checkbox" name="sensibilidades_importantes[]" value="toques"<?php echo checkedValue($user, "sensibilidades_importantes", "toques"); ?>> Toques</label>
                            <label><input type="checkbox" name="sensibilidades_importantes[]" value="ambientes-agitados"<?php echo checkedValue($user, "sensibilidades_importantes", "ambientes-agitados"); ?>> Ambientes agitados</label>
                            <label><input type="checkbox" name="sensibilidades_importantes[]" value="nenhuma-informada"<?php echo checkedValue($user, "sensibilidades_importantes", "nenhuma-informada"); ?>> Nenhuma informada</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="platform-sensibilidades">7&deg; Detalhe sensibilidades, desconfortos ou situa&ccedil;&otilde;es que causam distra&ccedil;&atilde;o.</label>
                        <textarea id="platform-sensibilidades" name="sensibilidades" rows="3"><?php echo h($user["sensibilidades"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <span class="form-label">8&deg; Quais elementos chamam mais a aten&ccedil;&atilde;o do usu&aacute;rio?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="elementos_atencao[]" value="cores-suaves"<?php echo checkedValue($user, "elementos_atencao", "cores-suaves"); ?>> Cores suaves</label>
                            <label><input type="checkbox" name="elementos_atencao[]" value="personagens"<?php echo checkedValue($user, "elementos_atencao", "personagens"); ?>> Personagens</label>
                            <label><input type="checkbox" name="elementos_atencao[]" value="musicas"<?php echo checkedValue($user, "elementos_atencao", "musicas"); ?>> M&uacute;sicas</label>
                            <label><input type="checkbox" name="elementos_atencao[]" value="imagens-reais"<?php echo checkedValue($user, "elementos_atencao", "imagens-reais"); ?>> Imagens reais</label>
                            <label><input type="checkbox" name="elementos_atencao[]" value="desenhos"<?php echo checkedValue($user, "elementos_atencao", "desenhos"); ?>> Desenhos</label>
                            <label><input type="checkbox" name="elementos_atencao[]" value="objetos-especificos"<?php echo checkedValue($user, "elementos_atencao", "objetos-especificos"); ?>> Objetos espec&iacute;ficos</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="platform-preferencias-visuais">9&deg; Quais cores, temas ou estilos visuais deixam o usu&aacute;rio mais confort&aacute;vel?</label>
                        <textarea id="platform-preferencias-visuais" name="preferencias_visuais" rows="3"><?php echo h($user["preferencias_visuais"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-hiperfocos">10&deg; Existem hiperfocos, interesses espec&iacute;ficos ou temas favoritos que possam ser usados para melhorar o aprendizado?</label>
                        <textarea id="platform-hiperfocos" name="hiperfocos" rows="3"><?php echo h($user["hiperfocos"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-adaptacao-rotina">11&deg; O usu&aacute;rio se adapta bem a mudan&ccedil;as na rotina?</label>
                        <select id="platform-adaptacao-rotina" name="adaptacao_rotina">
                            <option value="">Selecione</option>
                            <option value="sim"<?php echo selectedValue($user, "adaptacao_rotina", "sim"); ?>>Sim</option>
                            <option value="as-vezes"<?php echo selectedValue($user, "adaptacao_rotina", "as-vezes"); ?>>&Agrave;s vezes</option>
                            <option value="nao"<?php echo selectedValue($user, "adaptacao_rotina", "nao"); ?>>N&atilde;o</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="platform-rotina">12&deg; O usu&aacute;rio prefere rotinas bem organizadas e previs&iacute;veis durante as atividades?</label>
                        <textarea id="platform-rotina" name="rotina" rows="3"><?php echo h($user["rotina"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <span class="form-label">13&deg; O que ajuda em momentos de dificuldade?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="ajuda_dificuldade[]" value="pausa"<?php echo checkedValue($user, "ajuda_dificuldade", "pausa"); ?>> Pausa</label>
                            <label><input type="checkbox" name="ajuda_dificuldade[]" value="musica-calma"<?php echo checkedValue($user, "ajuda_dificuldade", "musica-calma"); ?>> M&uacute;sica calma</label>
                            <label><input type="checkbox" name="ajuda_dificuldade[]" value="imagem-explicativa"<?php echo checkedValue($user, "ajuda_dificuldade", "imagem-explicativa"); ?>> Imagem explicativa</label>
                            <label><input type="checkbox" name="ajuda_dificuldade[]" value="ajuda-adulto"<?php echo checkedValue($user, "ajuda_dificuldade", "ajuda-adulto"); ?>> Ajuda de adulto</label>
                            <label><input type="checkbox" name="ajuda_dificuldade[]" value="ambiente-silencioso"<?php echo checkedValue($user, "ajuda_dificuldade", "ambiente-silencioso"); ?>> Ambiente silencioso</label>
                            <label><input type="checkbox" name="ajuda_dificuldade[]" value="outra-estrategia"<?php echo checkedValue($user, "ajuda_dificuldade", "outra-estrategia"); ?>> Outra estrat&eacute;gia</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="platform-autonomia">14&deg; O usu&aacute;rio necessita de apoio constante durante as atividades ou consegue realizar tarefas sozinho?</label>
                        <textarea id="platform-autonomia" name="autonomia" rows="3"><?php echo h($user["autonomia"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <span class="form-label">15&deg; Quais recursos seriam mais &uacute;teis para esse usu&aacute;rio?</span>
                        <div class="check-grid">
                            <label><input type="checkbox" name="recursos_uteis[]" value="rotina-visual"<?php echo checkedValue($user, "recursos_uteis", "rotina-visual"); ?>> Rotina visual</label>
                            <label><input type="checkbox" name="recursos_uteis[]" value="atividades-audio"<?php echo checkedValue($user, "recursos_uteis", "atividades-audio"); ?>> Atividades com &aacute;udio</label>
                            <label><input type="checkbox" name="recursos_uteis[]" value="atividades-imagens"<?php echo checkedValue($user, "recursos_uteis", "atividades-imagens"); ?>> Atividades com imagens</label>
                            <label><input type="checkbox" name="recursos_uteis[]" value="reforco-positivo"<?php echo checkedValue($user, "recursos_uteis", "reforco-positivo"); ?>> Refor&ccedil;o positivo</label>
                            <label><input type="checkbox" name="recursos_uteis[]" value="relatorio-evolucao"<?php echo checkedValue($user, "recursos_uteis", "relatorio-evolucao"); ?>> Relat&oacute;rio de evolu&ccedil;&atilde;o</label>
                            <label><input type="checkbox" name="recursos_uteis[]" value="conteudos-personalizados"<?php echo checkedValue($user, "recursos_uteis", "conteudos-personalizados"); ?>> Conte&uacute;dos personalizados</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <span class="form-label">16&deg; Quais habilidades o respons&aacute;vel, professor ou terapeuta deseja desenvolver com maior prioridade?</span>
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
                        <label for="platform-estrategias">17&deg; Existe alguma estrat&eacute;gia, m&eacute;todo ou adapta&ccedil;&atilde;o que j&aacute; funciona bem com o usu&aacute;rio no dia a dia escolar ou terap&ecirc;utico?</label>
                        <textarea id="platform-estrategias" name="estrategias" rows="3"><?php echo h($user["estrategias"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-observacoes-usuario">18&deg; Observa&ccedil;&otilde;es importantes sobre o usu&aacute;rio:</label>
                        <textarea id="platform-observacoes-usuario" name="observacoes_usuario" rows="4"><?php echo h($user["observacoes_usuario"] ?? ""); ?></textarea>
                    </div>

                    <button class="complete-button form-submit" type="submit">Salvar respostas</button>
                    <p class="form-status" aria-live="polite"></p>
                </form>
            </section>

            <section class="section-block platform-view" id="relatorio" data-view="relatorio" aria-labelledby="report-title">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">Desenvolvimento do aluno</p>
                        <h2 id="report-title">Relat&oacute;rio de acompanhamento</h2>
                    </div>
                    <a class="topbar-button" href="relatorio.php">Abrir relat&oacute;rio completo</a>
                </div>

                <div class="report-summary">
                    <article class="report-card">
                        <span class="report-card__number">8</span>
                        <div>
                            <strong>Jogos educativos</strong>
                            <p>Emo&ccedil;&otilde;es, rotina, cores, formas, alfabeto, vogais, s&iacute;labas e n&uacute;meros.</p>
                        </div>
                    </article>
                    <article class="report-card">
                        <span class="report-card__number">3</span>
                        <div>
                            <strong>Trilhas educativas</strong>
                            <p>Comunica&ccedil;&atilde;o alternativa, matem&aacute;tica visual e leitura com imagens.</p>
                        </div>
                    </article>
                    <article class="report-card">
                        <span class="report-card__number">4</span>
                        <div>
                            <strong>Rotina do dia</strong>
                            <p>Boas-vindas, jogo educativo, pausa sensorial e comunica&ccedil;&atilde;o.</p>
                        </div>
                    </article>
                </div>

                <div class="report-grid">
                    <article class="report-panel">
                        <h3>Desenvolvimento por &aacute;rea</h3>
                        <div class="skill-progress">
                            <div class="skill-progress__row">
                                <span>Jogos de percep&ccedil;&atilde;o</span>
                                <strong>70%</strong>
                            </div>
                            <span class="skill-progress__bar"><span style="width: 70%"></span></span>
                        </div>
                        <div class="skill-progress">
                            <div class="skill-progress__row">
                                <span>Comunica&ccedil;&atilde;o e emo&ccedil;&otilde;es</span>
                                <strong>60%</strong>
                            </div>
                            <span class="skill-progress__bar"><span style="width: 60%"></span></span>
                        </div>
                        <div class="skill-progress">
                            <div class="skill-progress__row">
                                <span>Rotina e autonomia</span>
                                <strong>45%</strong>
                            </div>
                            <span class="skill-progress__bar"><span style="width: 45%"></span></span>
                        </div>
                    </article>

                    <article class="report-panel">
                        <h3>Perfil usado nas adapta&ccedil;&otilde;es</h3>
                        <dl class="report-details">
                            <div>
                                <dt>Conte&uacute;dos reconhecidos</dt>
                                <dd><?php echo reportValue($user, "conteudos_reconhecidos", "Preencha o formul&aacute;rio para registrar letras, n&uacute;meros, cores ou formas."); ?></dd>
                            </div>
                            <div>
                                <dt>Atividades que funcionam melhor</dt>
                                <dd><?php echo reportValue($user, "atividade_funciona", "Preencha o formul&aacute;rio para indicar jogos, imagens, &aacute;udios ou atividades curtas."); ?></dd>
                            </div>
                            <div>
                                <dt>Prioridades de desenvolvimento</dt>
                                <dd><?php echo reportValue($user, "prioridades", "Preencha o formul&aacute;rio para registrar fala, leitura, aten&ccedil;&atilde;o, autonomia ou socializa&ccedil;&atilde;o."); ?></dd>
                            </div>
                            <div>
                                <dt>Comunica&ccedil;&atilde;o preferencial</dt>
                                <dd><?php echo reportValue($user, "comunicacao_melhor", "Preencha o formul&aacute;rio para indicar fala, gestos, imagens, escrita, sons ou comunica&ccedil;&atilde;o alternativa."); ?></dd>
                            </div>
                            <div>
                                <dt>Compreens&atilde;o</dt>
                                <dd><?php echo reportValue($user, "compreensao_melhor", "Preencha o formul&aacute;rio para indicar frases curtas, imagens, repeti&ccedil;&atilde;o, demonstra&ccedil;&atilde;o pr&aacute;tica ou v&iacute;deos."); ?></dd>
                            </div>
                            <div>
                                <dt>Sensibilidades</dt>
                                <dd><?php echo reportValue($user, "sensibilidades_importantes", "Preencha o formul&aacute;rio para indicar sons altos, luz forte, muitas cores, toques ou ambientes agitados."); ?></dd>
                            </div>
                            <div>
                                <dt>Recursos &uacute;teis</dt>
                                <dd><?php echo reportValue($user, "recursos_uteis", "Preencha o formul&aacute;rio para indicar rotina visual, &aacute;udio, imagens, refor&ccedil;o positivo ou conte&uacute;dos personalizados."); ?></dd>
                            </div>
                        </dl>
                    </article>
                </div>

                <article class="report-panel report-panel--wide">
                    <h3>Plano sugerido pela plataforma</h3>
                    <div class="report-action-grid">
                        <article class="report-action-card">
                            <strong>Comunica&ccedil;&atilde;o e express&atilde;o</strong>
                            <p>Use jogos de emo&ccedil;&otilde;es, vogais, s&iacute;labas e alfabeto para ampliar escolhas, fala, escuta e comunica&ccedil;&atilde;o alternativa.</p>
                            <a href="#jogos">Ver jogos</a>
                        </article>
                        <article class="report-action-card">
                            <strong>Percep&ccedil;&atilde;o visual e matem&aacute;tica</strong>
                            <p>Use cores, formas e n&uacute;meros para trabalhar reconhecimento, associa&ccedil;&atilde;o, contagem e compara&ccedil;&atilde;o.</p>
                            <a href="#jogos">Praticar percep&ccedil;&atilde;o</a>
                        </article>
                        <article class="report-action-card">
                            <strong>Rotina e autonomia</strong>
                            <p>Use rotina visual, pausas e instru&ccedil;&otilde;es curtas para apoiar previsibilidade e participa&ccedil;&atilde;o.</p>
                            <a href="#rotina">Ver rotina</a>
                        </article>
                    </div>
                </article>

                <article class="report-panel report-panel--wide">
                    <h3>Alinhamento &agrave; BNCC</h3>
                    <ul class="report-timeline">
                        <li><strong>Direitos de aprendizagem:</strong> conviver, brincar, participar, explorar, expressar e conhecer-se.</li>
                        <li><strong>Campos de experi&ecirc;ncia:</strong> o eu, o outro e o n&oacute;s; corpo, gestos e movimentos; tra&ccedil;os, sons, cores e formas; escuta, fala, pensamento e imagina&ccedil;&atilde;o; espa&ccedil;os, tempos, quantidades, rela&ccedil;&otilde;es e transforma&ccedil;&otilde;es.</li>
                        <li><strong>Compet&ecirc;ncias gerais:</strong> comunica&ccedil;&atilde;o, pensamento criativo, autoconhecimento, empatia, coopera&ccedil;&atilde;o e autonomia.</li>
                    </ul>
                </article>

                <article class="report-panel report-panel--wide">
                    <h3>Como acompanhar dentro da plataforma</h3>
                    <ul class="report-timeline">
                        <li><strong>Jogos:</strong> observe interesse, autonomia e reconhecimento em emo&ccedil;&otilde;es, cores, formas, letras, vogais, s&iacute;labas e n&uacute;meros.</li>
                        <li><strong>Aprendizado:</strong> use as trilhas de comunica&ccedil;&atilde;o alternativa, matem&aacute;tica visual e leitura com imagens para refor&ccedil;ar habilidades.</li>
                        <li><strong>Rotina e apoio:</strong> compare o desempenho com as prefer&ecirc;ncias, sensibilidades e estrat&eacute;gias registradas no formul&aacute;rio.</li>
                    </ul>
                </article>
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
                        <span class="game-visual game-visual--emotions" aria-hidden="true">:)</span>
                        <span class="game-badge">Emo&ccedil;&otilde;es</span>
                        <h3><span class="card-icon card-icon--emotion" aria-hidden="true"></span>Jogo das Emo&ccedil;&otilde;es</h3>
                        <p>Associe express&otilde;es, sentimentos e situa&ccedil;&otilde;es do cotidiano.</p>
                        <a class="game-button" href="emocoes.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--routine" aria-hidden="true">1-2</span>
                        <span class="game-badge game-badge--mint">Rotina</span>
                        <h3><span class="card-icon card-icon--routine" aria-hidden="true"></span>Sequ&ecirc;ncia da Rotina</h3>
                        <p>Organize passos como chegada, atividade, pausa e finaliza&ccedil;&atilde;o.</p>
                        <a class="game-button" href="rotina-jogo.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--colors" aria-hidden="true"></span>
                        <span class="game-badge game-badge--yellow">Percep&ccedil;&atilde;o</span>
                        <h3><span class="card-icon card-icon--colors" aria-hidden="true"></span>Jogo das Cores</h3>
                        <p>Toque em uma cor para ouvir seu nome em voz alta.</p>
                        <a class="game-button" href="cores.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--shapes" aria-hidden="true"></span>
                        <span class="game-badge game-badge--yellow">Formas</span>
                        <h3><span class="card-icon card-icon--shapes" aria-hidden="true"></span>Formas Faladas</h3>
                        <p>Toque em uma forma geom&eacute;trica para ouvir seu nome.</p>
                        <a class="game-button" href="formas.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--letters" aria-hidden="true">Aa</span>
                        <span class="game-badge game-badge--pink">Letras</span>
                        <h3><span class="card-icon card-icon--letters" aria-hidden="true"></span>Alfabeto Falado</h3>
                        <p>Toque em uma letra para ouvir seu nome em voz alta.</p>
                        <a class="game-button" href="alfabeto.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--vowels" aria-hidden="true">AEIOU</span>
                        <span class="game-badge game-badge--pink">Vogais</span>
                        <h3><span class="card-icon card-icon--vowels" aria-hidden="true"></span>Jogo das Vogais</h3>
                        <p>Toque em uma vogal para ouvir qual letra &eacute;.</p>
                        <a class="game-button" href="vogais.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--syllables" aria-hidden="true">A+I</span>
                        <span class="game-badge game-badge--pink">S&iacute;labas</span>
                        <h3><span class="card-icon card-icon--letters" aria-hidden="true"></span>Jogo das S&iacute;labas</h3>
                        <p>Veja as letras na plaquinha e escolha qual som elas formam.</p>
                        <a class="game-button" href="silabas.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--numbers" aria-hidden="true">123</span>
                        <span class="game-badge game-badge--mint">N&uacute;meros</span>
                        <h3><span class="card-icon card-icon--numbers" aria-hidden="true"></span>N&uacute;meros Falados</h3>
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
                        <span class="learning-visual learning-visual--communication" aria-hidden="true">Oi</span>
                        <strong><span class="card-icon card-icon--communication" aria-hidden="true"></span>Comunica&ccedil;&atilde;o alternativa</strong>
                        <p>Cart&otilde;es visuais para expressar necessidades e escolhas.</p>
                    </article>
                    <article>
                        <span class="learning-visual learning-visual--math" aria-hidden="true">5</span>
                        <strong><span class="card-icon card-icon--math" aria-hidden="true"></span>Matem&aacute;tica visual</strong>
                        <p>Contagem, compara&ccedil;&atilde;o e associa&ccedil;&atilde;o com apoio visual.</p>
                    </article>
                    <article>
                        <span class="learning-visual learning-visual--reading" aria-hidden="true">A</span>
                        <strong><span class="card-icon card-icon--reading" aria-hidden="true"></span>Leitura e imagens</strong>
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
