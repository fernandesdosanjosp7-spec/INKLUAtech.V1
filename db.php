<?php
function getDatabase(): PDO
{
    if (!extension_loaded("pdo_sqlite")) {
        throw new RuntimeException("A extensao pdo_sqlite nao esta ativa no PHP.");
    }

    if (!is_writable(__DIR__)) {
        throw new RuntimeException("A pasta do projeto nao tem permissao de escrita para criar ou atualizar o banco.");
    }

    $databasePath = __DIR__ . DIRECTORY_SEPARATOR . "database.db";
    $pdo = new PDO("sqlite:" . $databasePath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    ensureSchema($pdo);

    return $pdo;
}

function ensureSchema(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT,
            cpf TEXT,
            senha TEXT,
            senha_hash TEXT,
            responsavel_nome TEXT,
            responsavel_vinculo TEXT,
            aluno_nome TEXT,
            aluno_idade INTEGER,
            preferencias TEXT,
            sensibilidades TEXT,
            comunicacao TEXT,
            rotina TEXT,
            nivel_suporte TEXT,
            preferencias_visuais TEXT,
            forma_aprendizado TEXT,
            hiperfocos TEXT,
            desconfortos TEXT,
            autonomia TEXT,
            prioridades TEXT,
            estrategias TEXT
        )
    ");

    $columns = $pdo->query("PRAGMA table_info(usuarios)")->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, "name");
    $requiredColumns = [
        "nome" => "TEXT",
        "email" => "TEXT",
        "cpf" => "TEXT",
        "senha" => "TEXT",
        "senha_hash" => "TEXT",
        "responsavel_nome" => "TEXT",
        "responsavel_vinculo" => "TEXT",
        "aluno_nome" => "TEXT",
        "aluno_idade" => "INTEGER",
        "preferencias" => "TEXT",
        "sensibilidades" => "TEXT",
        "comunicacao" => "TEXT",
        "rotina" => "TEXT",
        "nivel_suporte" => "TEXT",
        "preferencias_visuais" => "TEXT",
        "forma_aprendizado" => "TEXT",
        "hiperfocos" => "TEXT",
        "desconfortos" => "TEXT",
        "autonomia" => "TEXT",
        "prioridades" => "TEXT",
        "estrategias" => "TEXT"
    ];

    foreach ($requiredColumns as $column => $type) {
        if (!in_array($column, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN {$column} {$type}");
        }
    }
}

function normalizeCpf(string $cpf): string
{
    return preg_replace("/\D+/", "", $cpf) ?? "";
}

function collectProfileData(array $source): array
{
    $prioridades = $source["prioridades"] ?? [];

    if (is_array($prioridades)) {
        $prioridades = implode(", ", $prioridades);
    }

    return [
        "nivel_suporte" => $source["nivel_suporte"] ?? "",
        "sensibilidades" => $source["sensibilidades"] ?? "",
        "preferencias_visuais" => $source["preferencias_visuais"] ?? "",
        "forma_aprendizado" => $source["forma_aprendizado"] ?? "",
        "comunicacao" => $source["comunicacao"] ?? "",
        "hiperfocos" => $source["hiperfocos"] ?? "",
        "rotina" => $source["rotina"] ?? "",
        "desconfortos" => $source["desconfortos"] ?? "",
        "autonomia" => $source["autonomia"] ?? "",
        "prioridades" => $prioridades,
        "estrategias" => $source["estrategias"] ?? ""
    ];
}
