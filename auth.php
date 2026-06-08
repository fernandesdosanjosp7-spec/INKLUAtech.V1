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

function loginErrorPath(string $code): string
{
    $source = basename((string) ($_POST["login_source"] ?? "Index.html"));
    $page = $source === "login.html" ? "login.html" : "Index.html";
    $hash = $page === "Index.html" ? "#login" : "";

    return $page . "?login_error=" . rawurlencode($code) . $hash;
}

function recoveryStatusPath(string $code, string $recoveryCode = ""): string
{
    $source = basename((string) ($_POST["recovery_source"] ?? "Index.html"));
    $page = $source === "login.html" ? "login.html" : "Index.html";
    $hash = $page === "Index.html" ? "#recuperar-senha" : "#recover-password";
    $query = "?recovery_status=" . rawurlencode($code);

    if ($recoveryCode !== "") {
        $query .= "&recovery_code=" . rawurlencode($recoveryCode);
    }

    return $page . $query . $hash;
}

function resetStatusPath(string $code): string
{
    $source = basename((string) ($_POST["reset_source"] ?? "Index.html"));
    $page = $source === "login.html" ? "login.html" : "Index.html";
    $hash = $page === "Index.html" ? "#recuperar-senha" : "#recover-password";

    return $page . "?reset_status=" . rawurlencode($code) . $hash;
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
                email,
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
                observacoes_usuario,
                criado_em,
                atualizado_em,
                ultimo_login_em
            ) VALUES (
                :nome,
                :email,
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
                :observacoes_usuario,
                :criado_em,
                :atualizado_em,
                :ultimo_login_em
            )
        ");

        $now = date("c");
        $stmt->execute([
            ":nome" => $_POST["responsavel_nome"] ?? "",
            ":email" => null,
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
            ":observacoes_usuario" => $profile["observacoes_usuario"],
            ":criado_em" => $now,
            ":atualizado_em" => $now,
            ":ultimo_login_em" => $now
        ]);

        $_SESSION["user_id"] = (int) $pdo->lastInsertId();
        redirectTo("home.php?status=registered#formulario");
    }

    if (requirePostAction("login")) {
        $cpf = normalizeCpf($_POST["cpf"] ?? "");
        $password = (string) ($_POST["password"] ?? "");

        if ($cpf === "" || trim($password) === "") {
            redirectTo(loginErrorPath("required"));
        }

        $stmt = $pdo->prepare("SELECT id, senha_hash, senha FROM usuarios WHERE cpf = :cpf ORDER BY id DESC LIMIT 1");
        $stmt->execute([":cpf" => $cpf]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            redirectTo(loginErrorPath("cpf"));
        }

        $validPassword = false;

        if (!empty($user["senha_hash"])) {
            $validPassword = password_verify($password, $user["senha_hash"]);
        }

        if (!$validPassword && !empty($user["senha"]) && hash_equals($user["senha"], $password)) {
            $validPassword = true;
            $stmt = $pdo->prepare("UPDATE usuarios SET senha_hash = :senha_hash, senha = '' WHERE id = :id");
            $stmt->execute([
                ":senha_hash" => password_hash($password, PASSWORD_DEFAULT),
                ":id" => $user["id"]
            ]);
        }

        if (!$validPassword) {
            redirectTo(loginErrorPath("senha"));
        }

        $_SESSION["user_id"] = (int) $user["id"];
        $stmt = $pdo->prepare("UPDATE usuarios SET ultimo_login_em = :ultimo_login_em WHERE id = :id");
        $stmt->execute([
            ":ultimo_login_em" => date("c"),
            ":id" => $user["id"]
        ]);
        redirectTo("home.php");
    }

    if (requirePostAction("recover_password")) {
        $email = trim((string) ($_POST["email"] ?? ""));

        if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            redirectTo(recoveryStatusPath("invalid"));
        }

        $recoveryCode = (string) random_int(100000, 999999);
        $_SESSION["recovery_email"] = $email;
        $_SESSION["recovery_code"] = $recoveryCode;
        $_SESSION["recovery_code_expires"] = time() + 900;

        $subject = "Codigo de recuperacao INKLUAtech";
        $message = "Seu codigo de recuperacao da INKLUAtech e: " . $recoveryCode;
        $headers = "From: no-reply@inkluatech.local\r\nContent-Type: text/plain; charset=UTF-8";

        @mail($email, $subject, $message, $headers);

        redirectTo(recoveryStatusPath("sent", $recoveryCode));
    }

    if (requirePostAction("reset_password")) {
        $newPassword = (string) ($_POST["new_password"] ?? "");
        $confirmPassword = (string) ($_POST["confirm_password"] ?? "");
        $email = (string) ($_SESSION["recovery_email"] ?? "");
        $expiresAt = (int) ($_SESSION["recovery_code_expires"] ?? 0);

        if (trim($newPassword) === "" || $newPassword !== $confirmPassword || strlen($newPassword) < 4) {
            redirectTo(resetStatusPath("invalid"));
        }

        if ($email === "" || $expiresAt < time()) {
            redirectTo(resetStatusPath("expired"));
        }

        $stmt = $pdo->prepare("UPDATE usuarios SET senha_hash = :senha_hash, senha = '' WHERE lower(email) = lower(:email)");
        $stmt->execute([
            ":senha_hash" => password_hash($newPassword, PASSWORD_DEFAULT),
            ":email" => $email
        ]);

        unset($_SESSION["recovery_email"], $_SESSION["recovery_code"], $_SESSION["recovery_code_expires"]);

        redirectTo(resetStatusPath("saved"));
    }

    if (requirePostAction("update_profile")) {
        if (empty($_SESSION["user_id"])) {
            redirectTo("Index.html#login");
        }

        $profile = collectProfileData($_POST);
        $alunoIdade = $_POST["aluno_idade"] ?? null;
        $alunoIdade = $alunoIdade === "" ? null : $alunoIdade;

        $stmt = $pdo->prepare("
            UPDATE usuarios SET
                nome = :nome,
                responsavel_nome = :responsavel_nome,
                responsavel_vinculo = :responsavel_vinculo,
                aluno_nome = :aluno_nome,
                aluno_idade = :aluno_idade,
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
                observacoes_usuario = :observacoes_usuario,
                atualizado_em = :atualizado_em
            WHERE id = :id
        ");

        $stmt->execute([
            ":nome" => $_POST["responsavel_nome"] ?? "",
            ":responsavel_nome" => $_POST["responsavel_nome"] ?? "",
            ":responsavel_vinculo" => $_POST["responsavel_vinculo"] ?? "",
            ":aluno_nome" => $_POST["aluno_nome"] ?? "",
            ":aluno_idade" => $alunoIdade,
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
            ":atualizado_em" => date("c"),
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
