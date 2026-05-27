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
                <a href="#relatorio">Relat&oacute;rio</a>
                <a href="#jogos">Jogos</a>
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
                    <div class="welcome-actions" aria-label="Atalhos de in&iacute;cio">
                        <a href="#jogos">Come&ccedil;ar pelos jogos</a>
                        <a href="#formulario">Atualizar perfil</a>
                        <a href="#jogos">Ver jogos</a>
                    </div>
                </div>

                <section class="mood-checkin" aria-labelledby="moodCheckinTitle">
                    <div>
                        <p class="eyebrow">Check-in</p>
                        <h3 id="moodCheckinTitle">Hoje</h3>
                        <p id="moodFeedback" class="visually-hidden">Escolha uma op&ccedil;&atilde;o.</p>
                    </div>
                    <div class="mood-options" aria-label="Op&ccedil;&otilde;es de humor">
                        <button type="button" data-mood="feliz" data-mood-label="Feliz" data-mood-feedback="Que bom. Voc&ecirc; est&aacute; pronto para brilhar."><span aria-hidden="true">😊</span><strong>Feliz</strong></button>
                        <button type="button" data-mood="triste" data-mood-label="Triste" data-mood-feedback="Tudo bem. Um passo de cada vez."><span aria-hidden="true">😢</span><strong>Triste</strong></button>
                        <button type="button" data-mood="doente" data-mood-label="Doente" data-mood-feedback="Voc&ecirc; consegue. Hoje vamos com calma."><span aria-hidden="true">🤒</span><strong>Doente</strong></button>
                        <button type="button" data-mood="bravo" data-mood-label="Bravo" data-mood-feedback="Respire. Voc&ecirc; consegue tentar de novo."><span aria-hidden="true">😠</span><strong>Bravo</strong></button>
                    </div>
                </section>

                <div class="overview-grid">
                <article class="overview-card">
                    <span class="overview-icon overview-icon--blue">1</span>
                    <div>
                        <strong>Atividades de hoje</strong>
                        <p>6 jogos recomendados</p>
                    </div>
                </article>
                <article class="overview-card">
                    <span class="overview-icon overview-icon--mint">2</span>
                    <div>
                        <strong>Objetivo</strong>
                        <p>Comunica&ccedil;&atilde;o e autonomia</p>
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
                    <h3 class="form-subtitle">Dados do respons&aacute;vel</h3>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="platform-responsavel-nome">Nome completo</label>
                            <input type="text" id="platform-responsavel-nome" name="responsavel_nome" value="<?php echo h($user["responsavel_nome"] ?? ""); ?>" placeholder="Nome do respons&aacute;vel" required>
                        </div>

                        <div class="form-group">
                            <label for="platform-responsavel-vinculo">V&iacute;nculo com o aluno</label>
                            <select id="platform-responsavel-vinculo" name="responsavel_vinculo">
                                <option value="">Selecione</option>
                                <option value="mae"<?php echo selectedValue($user, "responsavel_vinculo", "mae"); ?>>M&atilde;e</option>
                                <option value="pai"<?php echo selectedValue($user, "responsavel_vinculo", "pai"); ?>>Pai</option>
                                <option value="responsavel"<?php echo selectedValue($user, "responsavel_vinculo", "responsavel"); ?>>Respons&aacute;vel legal</option>
                                <option value="terapeuta"<?php echo selectedValue($user, "responsavel_vinculo", "terapeuta"); ?>>Terapeuta</option>
                                <option value="professor"<?php echo selectedValue($user, "responsavel_vinculo", "professor"); ?>>Professor(a)</option>
                            </select>
                        </div>
                    </div>

                    <h3 class="form-subtitle">Perfil do aluno</h3>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="platform-aluno-nome">Nome do aluno</label>
                            <input type="text" id="platform-aluno-nome" name="aluno_nome" value="<?php echo h($user["aluno_nome"] ?? ""); ?>" placeholder="Nome do aluno" required>
                        </div>

                        <div class="form-group">
                            <label for="platform-aluno-idade">Idade</label>
                            <input type="number" id="platform-aluno-idade" name="aluno_idade" min="1" max="99" value="<?php echo h((string) ($user["aluno_idade"] ?? "")); ?>" placeholder="Idade">
                        </div>
                    </div>

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
                        <label for="platform-forma-aprendizado">Forma de aprendizado registrada no cadastro</label>
                        <textarea id="platform-forma-aprendizado" name="forma_aprendizado" rows="3" placeholder="Ex.: imagens, sons, textos curtos, jogos, atividades pr&aacute;ticas"><?php echo h($user["forma_aprendizado"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-comunicacao">Comunica&ccedil;&atilde;o registrada no cadastro</label>
                        <textarea id="platform-comunicacao" name="comunicacao" rows="3" placeholder="Ex.: fala, gestos, figuras, escrita, comunica&ccedil;&atilde;o alternativa"><?php echo h($user["comunicacao"] ?? ""); ?></textarea>
                    </div>

                    <div class="form-group">
                        <label for="platform-desconfortos">Situa&ccedil;&otilde;es de desconforto, ansiedade ou distra&ccedil;&atilde;o</label>
                        <textarea id="platform-desconfortos" name="desconfortos" rows="3" placeholder="Ex.: barulho, mudan&ccedil;a de rotina, espera, excesso de comandos, telas muito cheias"><?php echo h($user["desconfortos"] ?? ""); ?></textarea>
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
                        <span class="form-label">16&deg; Quais habilidades o respons&aacute;vel, professor ou terapeuta precisa desenvolver com maior prioridade?</span>
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
                        <span class="report-card__number">6</span>
                        <div>
                            <strong>Jogos educativos</strong>
                        </div>
                    </article>
                    <article class="report-card">
                        <span class="report-card__number">3</span>
                        <div>
                            <strong>Jogos de apoio</strong>
                        </div>
                    </article>
                    <article class="report-card">
                        <span class="report-card__number">4</span>
                        <div>
                            <strong>Perfil do aluno</strong>
                        </div>
                    </article>
                </div>

                <div class="report-grid">
                    <article class="report-panel">
                        <h3>Desenvolvimento por &aacute;rea</h3>
                        <div class="skill-progress" data-development-area="percepcao">
                            <div class="skill-progress__row">
                                <span>Jogos de percep&ccedil;&atilde;o</span>
                                <strong data-development-value>0%</strong>
                            </div>
                            <span class="skill-progress__bar"><span data-development-bar style="width: 0%"></span></span>
                        </div>
                        <div class="skill-progress" data-development-area="linguagem">
                            <div class="skill-progress__row">
                                <span>Comunica&ccedil;&atilde;o e linguagem</span>
                                <strong data-development-value>0%</strong>
                            </div>
                            <span class="skill-progress__bar"><span data-development-bar style="width: 0%"></span></span>
                        </div>
                        <div class="skill-progress" data-development-area="matematica">
                            <div class="skill-progress__row">
                                <span>Matem&aacute;tica e n&uacute;meros</span>
                                <strong data-development-value>0%</strong>
                            </div>
                            <span class="skill-progress__bar"><span data-development-bar style="width: 0%"></span></span>
                        </div>
                    </article>

                </div>

                <article class="report-panel report-panel--wide">
                    <h3>Resumo</h3>
                    <div class="report-metrics-grid" aria-label="Resumo consolidado dos jogos">
                        <article class="report-metric-card">
                            <span>Tentativas</span>
                            <strong id="attemptsMetric">0</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Acertos</span>
                            <strong id="correctMetric">0</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Erros</span>
                            <strong id="wrongMetric">0</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Taxa de acerto</span>
                            <strong id="accuracyMetric">0%</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Tempo na plataforma</span>
                            <strong id="platformTimeMetric">0s</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Tempo respondendo</span>
                            <strong id="answerTimeMetric">0s</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Atividades conclu&iacute;das</span>
                            <strong id="completedActivitiesMetric">0 de 6</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Frequ&ecirc;ncia de uso</span>
                            <strong id="usageFrequencyMetric">Sem uso recente</strong>
                        </article>
                        <article class="report-metric-card">
                            <span>Desenvolvimento</span>
                            <strong id="developmentMetric">Aguardando dados</strong>
                        </article>
                    </div>
                </article>
            </section>

            <section class="section-block platform-view" id="jogos" data-view="jogos" aria-labelledby="games-title">
                <div class="section-heading">
                    <div>
                        <p class="eyebrow">Jogos educativos</p>
                        <h2 id="games-title">Jogos</h2>
                    </div>
                </div>

                <div class="game-grid">
                    <article class="game-card">
                        <span class="game-visual game-visual--colors" aria-hidden="true"></span>
                        <span class="game-badge game-badge--yellow">Percep&ccedil;&atilde;o</span>
                        <h3><span class="card-icon card-icon--colors" aria-hidden="true"></span>Jogo das Cores</h3>
                        <a class="game-button" href="cores.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--letters" aria-hidden="true">Aa</span>
                        <span class="game-badge game-badge--pink">Letras</span>
                        <h3><span class="card-icon card-icon--letters" aria-hidden="true"></span>Alfabeto Falado</h3>
                        <a class="game-button" href="alfabeto.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--vowels" aria-hidden="true">AEIOU</span>
                        <span class="game-badge game-badge--pink">Vogais</span>
                        <h3><span class="card-icon card-icon--vowels" aria-hidden="true"></span>Jogo das Vogais</h3>
                        <a class="game-button" href="vogais.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--syllables" aria-hidden="true">A+I</span>
                        <span class="game-badge game-badge--pink">S&iacute;labas</span>
                        <h3><span class="card-icon card-icon--letters" aria-hidden="true"></span>Jogo das S&iacute;labas</h3>
                        <a class="game-button" href="silabas.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--numbers" aria-hidden="true">123</span>
                        <span class="game-badge game-badge--mint">N&uacute;meros</span>
                        <h3><span class="card-icon card-icon--numbers" aria-hidden="true"></span>N&uacute;meros Falados</h3>
                        <a class="game-button" href="numeros.html">Jogar</a>
                    </article>

                    <article class="game-card">
                        <span class="game-visual game-visual--math" aria-hidden="true">
                            <span class="game-math-scene">
                                <span class="game-math-group">
                                    <span></span>
                                    <span></span>
                                </span>
                                <span class="game-math-symbol">+</span>
                                <span class="game-math-group game-math-group--second">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                                <span class="game-math-symbol">=</span>
                                <span class="game-math-result">5</span>
                            </span>
                        </span>
                        <span class="game-badge game-badge--mint">Matem&aacute;tica</span>
                        <h3><span class="card-icon card-icon--math" aria-hidden="true"></span>Matem&aacute;tica Visual</h3>
                        <a class="game-button" href="matematica.html">Jogar</a>
                    </article>
                </div>
            </section>

        </section>
    </main>

    <script src="platform-time.js"></script>
    <script src="inklua-speech.js"></script>
    <script src="app.js"></script>
</body>
</html>
