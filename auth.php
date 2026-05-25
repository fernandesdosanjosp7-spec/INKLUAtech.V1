<?php
session_start();

require __DIR__ . "/db.php";

function redirectTo(string $path): void
{
    header("Location: " . $path);
    exit;
}

function requirePostAction(string $expected): bool
{
    return ($_SERVER["REQUEST_METHOD"] ?? "") === "POST" && ($_POST["action"] ?? "") === $expected;
}

try {
    $pdo = getDatabase();

    if (requirePostAction("register")) {
        $cpf = normalizeCpf($_POST["cpf"] ?? "");
        $password = $_POST["senha"] ?? "";

        if ($cpf === "" || $password === "" || empty($_POST["responsavel_nome"])) {
            redirectTo("Index.html#cadastro");
        }

        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE cpf = :cpf LIMIT 1");
        $stmt->execute([":cpf" => $cpf]);

        if ($stmt->fetch()) {
            redirectTo("Index.html#cadastro");
        }

        $profile = collectProfileData($_POST);
        $alunoIdade = $_POST["aluno_idade"] ?? null;
        $alunoIdade = $alunoIdade === "" ? null : $alunoIdade;

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (
                nome,
                cpf,
                senha_hash,
                responsavel_nome,
                responsavel_vinculo,
                aluno_nome,
                aluno_idade,
                preferencias,
                sensibilidades,
                comunicacao,
                rotina,
                nivel_suporte,
                preferencias_visuais,
                forma_aprendizado,
                hiperfocos,
                desconfortos,
                autonomia,
                prioridades,
                estrategias,
                comunicacao_melhor,
                compreensao_melhor,
                conteudos_reconhecidos,
                atividade_funciona,
                sensibilidades_importantes,
                elementos_atencao,
                adaptacao_rotina,
                ajuda_dificuldade,
                recursos_uteis,
                observacoes_usuario
            ) VALUES (
                :nome,
                :cpf,
                :senha_hash,
                :responsavel_nome,
                :responsavel_vinculo,
                :aluno_nome,
                :aluno_idade,
                :preferencias,
                :sensibilidades,
                :comunicacao,
                :rotina,
                :nivel_suporte,
                :preferencias_visuais,
                :forma_aprendizado,
                :hiperfocos,
                :desconfortos,
                :autonomia,
                :prioridades,
                :estrategias,
                :comunicacao_melhor,
                :compreensao_melhor,
                :conteudos_reconhecidos,
                :atividade_funciona,
                :sensibilidades_importantes,
                :elementos_atencao,
                :adaptacao_rotina,
                :ajuda_dificuldade,
                :recursos_uteis,
                :observacoes_usuario
            )
        ");

        $stmt->execute([
            ":nome" => $_POST["responsavel_nome"] ?? "",
            ":cpf" => $cpf,
            ":senha_hash" => password_hash($password, PASSWORD_DEFAULT),
            ":responsavel_nome" => $_POST["responsavel_nome"] ?? "",
            ":responsavel_vinculo" => $_POST["responsavel_vinculo"] ?? "",
            ":aluno_nome" => $_POST["aluno_nome"] ?? "",
            ":aluno_idade" => $alunoIdade,
            ":preferencias" => $profile["preferencias_visuais"],
            ":sensibilidades" => $profile["sensibilidades"],
            ":comunicacao" => $profile["comunicacao"],
            ":rotina" => $profile["rotina"],
            ":nivel_suporte" => $profile["nivel_suporte"],
            ":preferencias_visuais" => $profile["preferencias_visuais"],
            ":forma_aprendizado" => $profile["forma_aprendizado"],
            ":hiperfocos" => $profile["hiperfocos"],
            ":desconfortos" => $profile["desconfortos"],
            ":autonomia" => $profile["autonomia"],
            ":prioridades" => $profile["prioridades"],
            ":estrategias" => $profile["estrategias"],
            ":comunicacao_melhor" => $profile["comunicacao_melhor"],
            ":compreensao_melhor" => $profile["compreensao_melhor"],
            ":conteudos_reconhecidos" => $profile["conteudos_reconhecidos"],
            ":atividade_funciona" => $profile["atividade_funciona"],
            ":sensibilidades_importantes" => $profile["sensibilidades_importantes"],
            ":elementos_atencao" => $profile["elementos_atencao"],
            ":adaptacao_rotina" => $profile["adaptacao_rotina"],
            ":ajuda_dificuldade" => $profile["ajuda_dificuldade"],
            ":recursos_uteis" => $profile["recursos_uteis"],
            ":observacoes_usuario" => $profile["observacoes_usuario"]
        ]);

        $_SESSION["user_id"] = (int) $pdo->lastInsertId();
        redirectTo("home.php?status=registered#formulario");
    }

    if (requirePostAction("login")) {
        $cpf = normalizeCpf($_POST["cpf"] ?? "");
        $password = $_POST["password"] ?? "";

        $stmt = $pdo->prepare("SELECT id, senha_hash, senha FROM usuarios WHERE cpf = :cpf ORDER BY id DESC LIMIT 1");
        $stmt->execute([":cpf" => $cpf]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        $validPassword = false;

        if ($user && !empty($user["senha_hash"])) {
            $validPassword = password_verify($password, $user["senha_hash"]);
        }

        if ($user && !$validPassword && !empty($user["senha"]) && hash_equals($user["senha"], $password)) {
            $validPassword = true;
            $stmt = $pdo->prepare("UPDATE usuarios SET senha_hash = :senha_hash, senha = '' WHERE id = :id");
            $stmt->execute([
                ":senha_hash" => password_hash($password, PASSWORD_DEFAULT),
                ":id" => $user["id"]
            ]);
        }

        if (!$user || !$validPassword) {
            redirectTo("Index.html#login");
        }

        $_SESSION["user_id"] = (int) $user["id"];
        redirectTo("home.php");
    }

    if (requirePostAction("update_profile")) {
        if (empty($_SESSION["user_id"])) {
            redirectTo("Index.html#login");
        }

        $profile = collectProfileData($_POST);
        $stmt = $pdo->prepare("
            UPDATE usuarios SET
                sensibilidades = :sensibilidades,
                comunicacao = :comunicacao,
                rotina = :rotina,
                nivel_suporte = :nivel_suporte,
                preferencias_visuais = :preferencias_visuais,
                forma_aprendizado = :forma_aprendizado,
                hiperfocos = :hiperfocos,
                desconfortos = :desconfortos,
                autonomia = :autonomia,
                prioridades = :prioridades,
                estrategias = :estrategias,
                comunicacao_melhor = :comunicacao_melhor,
                compreensao_melhor = :compreensao_melhor,
                conteudos_reconhecidos = :conteudos_reconhecidos,
                atividade_funciona = :atividade_funciona,
                sensibilidades_importantes = :sensibilidades_importantes,
                elementos_atencao = :elementos_atencao,
                adaptacao_rotina = :adaptacao_rotina,
                ajuda_dificuldade = :ajuda_dificuldade,
                recursos_uteis = :recursos_uteis,
                observacoes_usuario = :observacoes_usuario
            WHERE id = :id
        ");

        $stmt->execute([
            ":sensibilidades" => $profile["sensibilidades"],
            ":comunicacao" => $profile["comunicacao"],
            ":rotina" => $profile["rotina"],
            ":nivel_suporte" => $profile["nivel_suporte"],
            ":preferencias_visuais" => $profile["preferencias_visuais"],
            ":forma_aprendizado" => $profile["forma_aprendizado"],
            ":hiperfocos" => $profile["hiperfocos"],
            ":desconfortos" => $profile["desconfortos"],
            ":autonomia" => $profile["autonomia"],
            ":prioridades" => $profile["prioridades"],
            ":estrategias" => $profile["estrategias"],
            ":comunicacao_melhor" => $profile["comunicacao_melhor"],
            ":compreensao_melhor" => $profile["compreensao_melhor"],
            ":conteudos_reconhecidos" => $profile["conteudos_reconhecidos"],
            ":atividade_funciona" => $profile["atividade_funciona"],
            ":sensibilidades_importantes" => $profile["sensibilidades_importantes"],
            ":elementos_atencao" => $profile["elementos_atencao"],
            ":adaptacao_rotina" => $profile["adaptacao_rotina"],
            ":ajuda_dificuldade" => $profile["ajuda_dificuldade"],
            ":recursos_uteis" => $profile["recursos_uteis"],
            ":observacoes_usuario" => $profile["observacoes_usuario"],
            ":id" => $_SESSION["user_id"]
        ]);

        redirectTo("home.php?status=profile_saved#formulario");
    }

    if (($_GET["action"] ?? "") === "logout") {
        $_SESSION = [];
        session_destroy();
        redirectTo("Index.html#login");
    }
} catch (Throwable $e) {
    redirectTo("Index.html#login");
}

redirectTo("Index.html#login");
