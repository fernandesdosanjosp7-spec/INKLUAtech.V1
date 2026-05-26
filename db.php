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
    $pdo->exec("PRAGMA foreign_keys = ON");

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
            estrategias TEXT,
            comunicacao_melhor TEXT,
            compreensao_melhor TEXT,
            conteudos_reconhecidos TEXT,
            atividade_funciona TEXT,
            sensibilidades_importantes TEXT,
            elementos_atencao TEXT,
            adaptacao_rotina TEXT,
            ajuda_dificuldade TEXT,
            recursos_uteis TEXT,
            observacoes_usuario TEXT,
            criado_em TEXT,
            atualizado_em TEXT,
            ultimo_login_em TEXT
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
        "estrategias" => "TEXT",
        "comunicacao_melhor" => "TEXT",
        "compreensao_melhor" => "TEXT",
        "conteudos_reconhecidos" => "TEXT",
        "atividade_funciona" => "TEXT",
        "sensibilidades_importantes" => "TEXT",
        "elementos_atencao" => "TEXT",
        "adaptacao_rotina" => "TEXT",
        "ajuda_dificuldade" => "TEXT",
        "recursos_uteis" => "TEXT",
        "observacoes_usuario" => "TEXT",
        "criado_em" => "TEXT",
        "atualizado_em" => "TEXT",
        "ultimo_login_em" => "TEXT"
    ];

    foreach ($requiredColumns as $column => $type) {
        if (!in_array($column, $existingColumns, true)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN {$column} {$type}");
        }
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS progresso_jogos (
            user_id INTEGER PRIMARY KEY,
            dados TEXT NOT NULL,
            atualizado_em TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS relatorios (
            user_id INTEGER PRIMARY KEY,
            observacoes_professor TEXT,
            dados_json TEXT,
            atualizado_em TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
    ");

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_progresso_jogos_atualizado ON progresso_jogos(atualizado_em)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_relatorios_atualizado ON relatorios(atualizado_em)");
}

function normalizeCpf(string $cpf): string
{
    return preg_replace("/\D+/", "", $cpf) ?? "";
}

function collectProfileData(array $source): array
{
    $collectList = static function (string $key) use ($source): string {
        $value = $source[$key] ?? [];

        if (is_array($value)) {
            return implode(", ", $value);
        }

        return $value;
    };

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
        "prioridades" => $collectList("prioridades"),
        "estrategias" => $source["estrategias"] ?? "",
        "comunicacao_melhor" => $collectList("comunicacao_melhor"),
        "compreensao_melhor" => $collectList("compreensao_melhor"),
        "conteudos_reconhecidos" => $collectList("conteudos_reconhecidos"),
        "atividade_funciona" => $collectList("atividade_funciona"),
        "sensibilidades_importantes" => $collectList("sensibilidades_importantes"),
        "elementos_atencao" => $collectList("elementos_atencao"),
        "adaptacao_rotina" => $source["adaptacao_rotina"] ?? "",
        "ajuda_dificuldade" => $collectList("ajuda_dificuldade"),
        "recursos_uteis" => $collectList("recursos_uteis"),
        "observacoes_usuario" => $source["observacoes_usuario"] ?? ""
    ];
}
