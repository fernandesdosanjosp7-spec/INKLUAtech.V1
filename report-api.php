<?php
session_start();

require __DIR__ . "/db.php";

header("Content-Type: application/json; charset=utf-8");

function respondReport(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (empty($_SESSION["user_id"])) {
    respondReport(401, [
        "ok" => false,
        "message" => "Usuario nao autenticado."
    ]);
}

try {
    $pdo = getDatabase();
    $userId = (int) $_SESSION["user_id"];

    if (($_SERVER["REQUEST_METHOD"] ?? "") === "GET") {
        $stmt = $pdo->prepare("SELECT observacoes_professor, dados_json, atualizado_em FROM relatorios WHERE user_id = :user_id LIMIT 1");
        $stmt->execute([":user_id" => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        respondReport(200, [
            "ok" => true,
            "report" => [
                "teacherNotes" => $row["observacoes_professor"] ?? "",
                "data" => !empty($row["dados_json"]) ? json_decode($row["dados_json"], true) : null,
                "updatedAt" => $row["atualizado_em"] ?? null
            ]
        ]);
    }

    if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
        respondReport(405, [
            "ok" => false,
            "message" => "Metodo nao permitido."
        ]);
    }

    $payload = json_decode(file_get_contents("php://input"), true);
    $teacherNotes = trim((string) ($payload["teacherNotes"] ?? ""));
    $reportData = is_array($payload["reportData"] ?? null) ? $payload["reportData"] : [];
    $updatedAt = date("c");

    $stmt = $pdo->prepare("SELECT user_id FROM relatorios WHERE user_id = :user_id LIMIT 1");
    $stmt->execute([":user_id" => $userId]);

    if ($stmt->fetch()) {
        $stmt = $pdo->prepare("
            UPDATE relatorios
            SET observacoes_professor = :observacoes_professor,
                dados_json = :dados_json,
                atualizado_em = :atualizado_em
            WHERE user_id = :user_id
        ");
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO relatorios (user_id, observacoes_professor, dados_json, atualizado_em)
            VALUES (:user_id, :observacoes_professor, :dados_json, :atualizado_em)
        ");
    }

    $stmt->execute([
        ":user_id" => $userId,
        ":observacoes_professor" => $teacherNotes,
        ":dados_json" => json_encode($reportData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ":atualizado_em" => $updatedAt
    ]);

    respondReport(200, [
        "ok" => true,
        "updatedAt" => $updatedAt
    ]);
} catch (Throwable $e) {
    respondReport(500, [
        "ok" => false,
        "message" => "Nao foi possivel salvar o relatorio."
    ]);
}
