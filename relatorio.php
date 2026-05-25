<?php
session_start();

require __DIR__ . "/db.php";

if (empty($_SESSION["user_id"])) {
    header("Location: Index.html#login");
    exit;
}

$user = [];

try {
    $pdo = getDatabase();
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id LIMIT 1");
    $stmt->execute([":id" => $_SESSION["user_id"]]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
} catch (Throwable $e) {
    $user = [];
}

$profile = [
    "aluno_nome" => $user["aluno_nome"] ?? "",
    "aluno_idade" => $user["aluno_idade"] ?? "",
    "serie" => $user["serie"] ?? "",
    "nivel_suporte" => $user["nivel_suporte"] ?? "",
    "responsavel_nome" => $user["responsavel_nome"] ?? "",
    "responsavel_vinculo" => $user["responsavel_vinculo"] ?? "",
    "sensibilidades" => $user["sensibilidades"] ?? "",
    "preferencias_visuais" => $user["preferencias_visuais"] ?? "",
    "forma_aprendizado" => $user["forma_aprendizado"] ?? "",
    "comunicacao" => $user["comunicacao"] ?? "",
    "comunicacao_melhor" => $user["comunicacao_melhor"] ?? "",
    "compreensao_melhor" => $user["compreensao_melhor"] ?? "",
    "conteudos_reconhecidos" => $user["conteudos_reconhecidos"] ?? "",
    "atividade_funciona" => $user["atividade_funciona"] ?? "",
    "sensibilidades_importantes" => $user["sensibilidades_importantes"] ?? "",
    "elementos_atencao" => $user["elementos_atencao"] ?? "",
    "adaptacao_rotina" => $user["adaptacao_rotina"] ?? "",
    "ajuda_dificuldade" => $user["ajuda_dificuldade"] ?? "",
    "recursos_uteis" => $user["recursos_uteis"] ?? "",
    "prioridades" => $user["prioridades"] ?? "",
    "estrategias" => $user["estrategias"] ?? "",
    "rotina" => $user["rotina"] ?? "",
    "autonomia" => $user["autonomia"] ?? "",
    "observacoes_usuario" => $user["observacoes_usuario"] ?? "",
    "report_date" => date("d/m/Y")
];

$html = file_get_contents(__DIR__ . "/relatorio.html");
$profileScript = "<script>window.InkluaStudentProfile = " . json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";</script>\n    ";

echo str_replace(
    '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
    $profileScript . '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
    $html
);
