#!/usr/bin/env python3
"""
Instalador da extensão do VS Code para o Portulong (.ptg)
Adiciona:
- Syntax highlighting completo em Português
- Ícone oficial do Portulong nos arquivos .ptg
- Botão ▶ Executar na barra do topo (Editor Title Action) como no Python
- Snippets de código em Português
"""

import json
import shutil
from pathlib import Path

def obter_diretorio_extensoes_vscode():
    """Localiza o diretório de extensões do VS Code no Windows, Linux ou macOS"""
    home = Path.home()
    candidatos = [
        home / ".vscode" / "extensions",
        home / ".vscode-insiders" / "extensions",
        home / ".vscode-server" / "extensions",
    ]
    for c in candidatos:
        if c.exists():
            return c
    # Fallback cria o padrão
    destino = home / ".vscode" / "extensions"
    destino.mkdir(parents=True, exist_ok=True)
    return destino

def instalar_extensao_vscode():
    """Gera e instala a extensão oficial do Portulong no VS Code"""
    pasta_extensoes = obter_diretorio_extensoes_vscode()
    pasta_portulong = pasta_extensoes / "portulong-linguagem-1.2.0"
    pasta_portulong.mkdir(parents=True, exist_ok=True)

    pasta_sintaxe = pasta_portulong / "syntaxes"
    pasta_sintaxe.mkdir(exist_ok=True)

    pasta_snippets = pasta_portulong / "snippets"
    pasta_snippets.mkdir(exist_ok=True)

    # 1. package.json da extensão
    pkg = {
        "name": "portulong-linguagem",
        "displayName": "Portulong (.ptg) - Linguagem PT-PT",
        "description": "Linguagem de programação em Português para criar páginas e aplicações web. Suporte nativo com botão de Executar.",
        "version": "1.2.0",
        "publisher": "silvio",
        "engines": {
            "vscode": "^1.60.0"
        },
        "categories": [
            "Programming Languages",
            "Snippets"
        ],
        "contributes": {
            "languages": [
                {
                    "id": "portulong",
                    "aliases": ["Portulong", "ptg"],
                    "extensions": [".ptg"],
                    "configuration": "./language-configuration.json",
                    "icon": {
                        "light": "./icon.png",
                        "dark": "./icon.png"
                    }
                }
            ],
            "grammars": [
                {
                    "language": "portulong",
                    "scopeName": "source.ptg",
                    "path": "./syntaxes/ptg.tmLanguage.json"
                }
            ],
            "snippets": [
                {
                    "language": "portulong",
                    "path": "./snippets/ptg.code-snippets"
                }
            ],
            "commands": [
                {
                    "command": "portulong.executar",
                    "title": "Executar Portulong",
                    "icon": "$(play)"
                }
            ],
            "menus": {
                "editor/title": [
                    {
                        "command": "portulong.executar",
                        "when": "resourceExtname == .ptg",
                        "group": "navigation"
                    }
                ]
            }
        }
    }
    (pasta_portulong / "package.json").write_text(json.dumps(pkg, indent=2, ensure_ascii=False), encoding='utf-8')

    # 2. Configuração da Linguagem (comentários, parênteses)
    lang_cfg = {
        "comments": {
            "lineComment": "#"
        },
        "brackets": [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"]
        ],
        "autoClosingPairs": [
            {"open": "{", "close": "}"},
            {"open": "[", "close": "]"},
            {"open": "(", "close": ")"},
            {"open": "\"", "close": "\""},
            {"open": "'", "close": "'"}
        ]
    }
    (pasta_portulong / "language-configuration.json").write_text(json.dumps(lang_cfg, indent=2), encoding='utf-8')

    # 3. TextMate Grammar para realce de sintaxe
    grammar = {
        "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
        "name": "Portulong",
        "patterns": [
            {"include": "#comments"},
            {"include": "#keywords"},
            {"include": "#sections"},
            {"include": "#strings"}
        ],
        "repository": {
            "comments": {
                "match": "#.*$",
                "name": "comment.line.number-sign.ptg"
            },
            "sections": {
                "match": "^\\s*(estilo:|script:|servidor:|componente\\s+[a-zA-Z0-9_]+:|rota\\s+(GET|POST|PUT|DELETE)\\s+[^:]+:)",
                "name": "keyword.control.section.ptg"
            },
            "keywords": {
                "patterns": [
                    {
                        "match": "\\b(pagina|cabecalho|titulo1|titulo2|titulo3|paragrafo|texto|botao|acao|campo|input|formulario|fim_formulario|caixa|div|fim_caixa|fim_div|imagem|descricao|ligacao|destino|quebra_linha|linha_horizontal)\\b",
                        "name": "support.function.html.ptg"
                    },
                    {
                        "match": "\\b(funcao|se|senao|enquanto|para|de|ate|retornar|alerta|escrever|obter_elemento|obter_valor|definir_texto|definir_html)\\b",
                        "name": "keyword.control.ptg"
                    },
                    {
                        "match": "\\b(porta|host)\\b",
                        "name": "variable.parameter.server.ptg"
                    }
                ]
            },
            "strings": {
                "patterns": [
                    {
                        "begin": "\"",
                        "end": "\"",
                        "name": "string.quoted.double.ptg"
                    },
                    {
                        "begin": "'",
                        "end": "'",
                        "name": "string.quoted.single.ptg"
                    }
                ]
            }
        },
        "scopeName": "source.ptg"
    }
    (pasta_sintaxe / "ptg.tmLanguage.json").write_text(json.dumps(grammar, indent=2), encoding='utf-8')

    # 4. Snippets em Português
    snippets = {
        "Página Portulong": {
            "prefix": "pagina",
            "body": [
                "pagina \"${1:Meu Titulo}\"",
                "",
                "cabecalho \"${2:Ola, Mundo!}\"",
                "paragrafo \"${3:Bem-vindo ao Portulong}\"",
                "botao \"${4:Clique Aqui}\" acao \"alerta('Ola!')\"",
                "",
                "estilo:",
                "body { fundo: #f8fafc; espacamento: 20px; }",
                "",
                "script:",
                "funcao alerta(msg):",
                "    alerta(msg)"
            ],
            "description": "Estrutura básica de página em Portulong"
        },
        "Botão": {
            "prefix": "botao",
            "body": ["botao \"${1:Texto}\" acao \"${2:acao()}\""],
            "description": "Cria um botão com ação"
        },
        "Rota REST": {
            "prefix": "rota",
            "body": [
                "rota ${1|GET,POST|} /api/${2:caminho}:",
                "    resposta = {\"sucesso\": true, \"mensagem\": \"OK\"}"
            ],
            "description": "Define uma rota de API REST em Python"
        }
    }
    (pasta_snippets / "ptg.code-snippets").write_text(json.dumps(snippets, indent=2, ensure_ascii=False), encoding='utf-8')

    # Copiar ícone se disponível
    icone_origem = Path(__file__).parent / "imagens" / "Portulong.png"
    if icone_origem.exists():
        try:
            shutil.copy(icone_origem, pasta_portulong / "icon.png")
        except Exception:
            pass

    print(f"✅ Extensão VS Code instalada em: {pasta_portulong}")
    return pasta_portulong

if __name__ == '__main__':
    instalar_extensao_vscode()
