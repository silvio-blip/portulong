"""
Configurador Universal multiplataforma para Portulong (Windows, Linux, macOS, Android/Termux).
Configura ícones do sistema, associações de ficheiros .ptg, coloração de sintaxe e regras de indentação.
"""

import os
import sys
import json
import shutil
import platform

SNIPPETS_PORTULONG = {
    "Escrever no Terminal": {
        "prefix": ["escrever", "imprimir"],
        "body": ["escrever(\"$1\")"],
        "description": "Imprime texto ou variável no terminal"
    },
    "Criar Bot Discord": {
        "prefix": ["discord.CriarBot"],
        "body": [
            "importar discord",
            "bot = discord.CriarBot(prefixo=\"${1:!}\")",
            "ao bot.quando_pronto:",
            "    funcao ao_ligar():",
            "        escrever(\"Bot conectado!\")",
            "bot.iniciar(\"${2:TOKEN}\")"
        ],
        "description": "Cria um bot Discord em Portulong"
    },
    "Comando Discord por Prefixo": {
        "prefix": ["comando", "bot.comando"],
        "body": [
            "comando bot.comando(\"${1:ola}\"):",
            "    funcao responder_${1:ola}(ctx):",
            "        ctx.responder(\"${2:Olá do Portulong!}\")"
        ],
        "description": "Regista comando por prefixo no Discord"
    },
    "Comando de Barra Discord (Slash)": {
        "prefix": ["barra", "bot.comando_barra"],
        "body": [
            "barra bot.comando_barra(\"${1:ajuda}\", \"${2:Exibe ajuda}\"):",
            "    funcao responder_${1:ajuda}(ctx):",
            "        ctx.responder(\"${3:Comando de barra ativo!}\")"
        ],
        "description": "Regista Slash Command no Discord"
    },
    "Loop Enquanto": {
        "prefix": ["enquanto", "while"],
        "body": [
            "enquanto ${1:contador <= 10}:",
            "    $0"
        ],
        "description": "Loop de repetição enquanto verdadeiro"
    },
    "Condicional Se / Senao": {
        "prefix": ["se", "senao"],
        "body": [
            "se ${1:condicao}:",
            "    $2",
            "senao:",
            "    $3"
        ],
        "description": "Estrutura condicional se / senão"
    },
    "Declaracao de Funcao": {
        "prefix": ["funcao", "def"],
        "body": [
            "funcao ${1:nome}(${2:argumentos}):",
            "    $0"
        ],
        "description": "Declara uma nova função em Portulong"
    }
}

LANGUAGE_CONFIG = {
    "comments": {
        "lineComment": "#"
    },
    "brackets": [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
    ],
    "autoClosingPairs": [
        { "open": "{", "close": "}" },
        { "open": "[", "close": "]" },
        { "open": "(", "close": ")" },
        { "open": "\"", "close": "\"", "notIn": ["string", "comment"] },
        { "open": "'", "close": "'", "notIn": ["string", "comment"] }
    ],
    "indentationRules": {
        "increaseIndentPattern": "^\\s*(pagina|cabecalho|titulo1|titulo2|titulo3|paragrafo|botao|campo|caixa|div|lista|item|rota|estilo|script|servidor|se|senao|enquanto|para|funcao|repetir|componente|comando|barra).*:\\s*$",
        "decreaseIndentPattern": "^\\s*(fim_caixa|fim_div|fim_lista|fim_estilo|fim_script|fim_servidor|fim_componente|senao)\\b"
    }
}

SYNTAX_GRAMMAR = {
    "scopeName": "source.ptg",
    "fileTypes": ["ptg"],
    "patterns": [
        { "name": "comment.line.number-sign.ptg", "match": "#.*$" },
        { "name": "string.quoted.double.ptg", "begin": "\"", "end": "\"" },
        { "name": "string.quoted.single.ptg", "begin": "'", "end": "'" },
        { "name": "constant.numeric.ptg", "match": "\\b\\d+(\\.\\d+)?\\b" },
        { "name": "keyword.control.ptg", "match": "\\b(se|senao|enquanto|para|cada|em|de|ate|repetir|interromper|parar|quebrar|continuar|retornar)\\b" },
        { "name": "storage.type.function.ptg", "match": "\\b(funcao|componente|rota|estilo|script|servidor|importar|de)\\b" },
        { "name": "support.function.ptg", "match": "\\b(escrever|imprimir|ler|alerta|obter_valor|definir_valor|definir_texto|definir_conteudo|limpar_elemento|adicionar_item|pedir_dados|enviar_dados)\\b" },
        { "name": "entity.name.tag.ptg", "match": "\\b(pagina|cabecalho|titulo1|titulo2|titulo3|paragrafo|texto|destaque|botao|campo|input|caixa|div|lista|item|imagem|ligacao|fim_caixa|fim_div|fim_lista|fim_estilo|fim_script|fim_servidor|fim_componente)\\b" },
        { "name": "constant.language.ptg", "match": "\\b(verdadeiro|falso|nulo)\\b" }
    ]
}

def configurar_sistema():
    """Configura o Portulong de forma universal em qualquer sistema operativo e editor."""
    print("⚙️ A iniciar configuração universal do Portulong (Windows, Linux, macOS, Android)...")
    
    sistema = platform.system()
    vscode_dir = ".vscode"
    syntaxes_dir = os.path.join(vscode_dir, "syntaxes")
    os.makedirs(vscode_dir, exist_ok=True)
    os.makedirs(syntaxes_dir, exist_ok=True)
    
    # 1. Copiar ícone oficial Portulong.png
    icon_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "imagens", "Portulong.png"))
    icon_dest = os.path.join(vscode_dir, "portulong-icon.png")
    
    if os.path.exists(icon_src):
        try:
            shutil.copy(icon_src, icon_dest)
            print("🎨 Ícone oficial 'Portulong.png' aplicado com sucesso.")
        except Exception:
            pass

    # 2. Configurações gerais (settings.json)
    settings_path = os.path.join(vscode_dir, "settings.json")
    settings = {
        "files.associations": {
            "*.ptg": "portulong"
        },
        "editor.quickSuggestions": {
            "other": True,
            "comments": True,
            "strings": True
        },
        "editor.suggestOnTriggerCharacters": True,
        "files.iconAssociations": {
            "*.ptg": "portulong"
        }
    }
    
    if os.path.exists(settings_path):
        try:
            with open(settings_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                data.update(settings)
                settings = data
        except Exception:
            pass

    with open(settings_path, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=4)

    # 3. Snippets
    with open(os.path.join(vscode_dir, "portulong.code-snippets"), "w", encoding="utf-8") as f:
        json.dump(SNIPPETS_PORTULONG, f, ensure_ascii=False, indent=4)

    # 4. Language Configuration (indentação automática)
    with open(os.path.join(vscode_dir, "language-configuration.json"), "w", encoding="utf-8") as f:
        json.dump(LANGUAGE_CONFIG, f, ensure_ascii=False, indent=4)

    # 5. Syntax Grammar (coloração de sintaxe)
    with open(os.path.join(syntaxes_dir, "portulong.tmLanguage.json"), "w", encoding="utf-8") as f:
        json.dump(SYNTAX_GRAMMAR, f, ensure_ascii=False, indent=4)

    print(f"🚀 Portulong configurado com sucesso para {sistema} com indentação automática, coloração de sintaxe e ícones!")
    return True

configurar_vscode = configurar_sistema
