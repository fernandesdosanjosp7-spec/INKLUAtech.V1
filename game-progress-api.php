<?php
session_start();

require __DIR__ . "/db.php";

header("Content-Type: application/json; charset=utf-8");

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (empty($_SESSION["user_id"])) {
    respond(401, [
        "ok" => false,
        "message" => "Usuario nao autenticado."
    ]);
}

try {
    $pdo = getDatabase();
    $userId = (int) $_SESSION["user_id"];

    if (($_SERVER["REQUEST_METHOD"] ?? "") === "GET") {
        $stmt = $pdo->prepare("SELECT dados, atualizado_em FROM progresso_jogos WHERE user_id = :user_id LIMIT 1");
        $stmt->execute([":user_id" => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        respond(200, [
            "ok" => true,
            "progress" => $row ? json_decode($row["dados"], true) : ["games" => [], "sessions" => []],
            "updatedAt" => $row["atualizado_em"] ?? null
        ]);
    }

    if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
        respond(405, [
            "ok" => false,
            "message" => "Metodo nao permitido."
        ]);
    }

    $payload = json_decode(file_get_contents("php://input"), true);
    $progress = is_array($payload["progress"] ?? null) ? $payload["progress"] : null;

    if (!$progress) {
        respond(422, [
            "ok" => false,
            "message" => "Progresso invalido."
        ]);
    }

    $progress["games"] = is_array($progress["games"] ?? null) ? $progress["games"] : [];
    $progress["sessions"] = is_array($progress["sessions"] ?? null) ? array_slice($progress["sessions"], -120) : [];

    $encodedProgress = json_encode($progress, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $updatedAt = date("c");

    $stmt = $pdo->prepare("SELECT user_id FROM progresso_jogos WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([":user_id" => $userId]);

    if ($stmt->fetch()) {
        $stmt = $pdo->prepare("
            UPDATE progresso_jogos
            SET dados = :dados, atualizado_em = :atualizado_em
            WHERE user_id = :user_id
        ");
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO progresso_jogos (user_id, dados, atualizado_em)
            VALUES (:user_id, :dados, :atualizado_em)
        ");
    }

    $stmt->execute([
        ":user_id" => $userId,
        ":dados" => $encodedProgress,
        ":atualizado_em" => $updatedAt
    ]);

    respond(200, [
        "ok" => true,
        "updatedAt" => $updatedAt
    ]);
} catch (Throwable $e) {
    respond(500, [
        "ok" => false,
        "message" => "Nao foi possivel salvar o progresso."
    ]);
}
