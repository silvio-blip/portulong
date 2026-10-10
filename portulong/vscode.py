#!/usr/bin/env python3
"""
Instalador da extensão do VS Code para o Portulong (.ptg)
Permite em TEMPO REAL (sem precisar de reiniciar o editor):
- Ícone oficial do Portulong nos arquivos .ptg
- Botão ▶ Executar na barra do topo (Editor Title Action) como no Python
- Associação imediata no settings.json do VS Code
- Extensão ativa que executa o comando ptg no terminal integrado
"""

import os
import json
import shutil
import urllib.request
from pathlib import Path

URL_ICONE_IMGUR = "https://i.imgur.com/CCsXVnb.png"

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
    destino = home / ".vscode" / "extensions"
    destino.mkdir(parents=True, exist_ok=True)
    return destino

def obter_diretorios_settings_vscode():
    """Localiza as pastas de configurações do usuário do VS Code"""
    candidatos = []
    home = Path.home()

    # Windows
    appdata = os.environ.get("APPDATA")
    if appdata:
        candidatos.append(Path(appdata) / "Code" / "User")
        candidatos.append(Path(appdata) / "Code - Insiders" / "User")

    # Linux
    candidatos.append(home / ".config" / "Code" / "User")
    candidatos.append(home / ".config" / "Code - Insiders" / "User")

    # macOS
    candidatos.append(home / "Library" / "Application Support" / "Code" / "User")

    return [p for p in candidatos if p.exists() or p.parent.exists()]

def atualizar_settings_tempo_real():
    """Atualiza as configurações do VS Code em tempo real sem precisar reiniciar"""
    pastas = obter_diretorios_settings_vscode()
    for pasta in pastas:
        try:
            pasta.mkdir(parents=True, exist_ok=True)
            settings_file = pasta / "settings.json"
            cfg = {}
            if settings_file.exists():
                try:
                    cfg = json.loads(settings_file.read_text(encoding='utf-8'))
                except Exception:
                    cfg = {}

            # Associa *.ptg com portulong para syntax e ícone em tempo real
            assocs = cfg.get("files.associations", {})
            assocs["*.ptg"] = "portulong"
            cfg["files.associations"] = assocs

            settings_file.write_text(json.dumps(cfg, indent=4, ensure_ascii=False), encoding='utf-8')
            print(f"⚡ Configuração em tempo real aplicada em: {settings_file}")
        except Exception as e:
            pass

def garantir_icone(destino_path):
    """Garante que o ícone do Portulong existe no caminho especificado (local ou Imgur)"""
    icone_local = Path(__file__).parent / "imagens" / "Portulong.png"
    if icone_local.exists():
        try:
            shutil.copy(icone_local, destino_path)
            return True
        except Exception:
            pass

    # Fallback: baixar do Imgur fornecido pelo usuário
    try:
        urllib.request.urlretrieve(URL_ICONE_IMGUR, destino_path)
        return True
    except Exception:
        pass
    return False

def instalar_extensao_vscode():
    """Gera e instala a extensão oficial do Portulong no VS Code com ativação em tempo real"""
    pasta_extensoes = obter_diretorio_extensoes_vscode()
    pasta_portulong = pasta_extensoes / "portulong-linguagem-1.0.25"
    pasta_portulong.mkdir(parents=True, exist_ok=True)

    pasta_sintaxe = pasta_portulong / "syntaxes"
    pasta_sintaxe.mkdir(exist_ok=True)

    pasta_snippets = pasta_portulong / "snippets"
    pasta_snippets.mkdir(exist_ok=True)

    pasta_icons = pasta_portulong / "icons"
    pasta_icons.mkdir(exist_ok=True)

    # 1. Copiar / Baixar Ícone
    garantir_icone(pasta_portulong / "icon.png")
    garantir_icone(pasta_icons / "ptg.png")

    # 2. package.json da extensão
    pkg = {
        "name": "portulong-linguagem",
        "displayName": "Portulong (.ptg) - Linguagem PT-PT",
        "description": "Linguagem de programação em Português para criar páginas e aplicações web. Suporte nativo com botão de Executar.",
        "version": "1.0.25",
        "publisher": "silvio",
        "engines": {
            "vscode": "^1.60.0"
        },
        "main": "./extension.js",
        "activationEvents": [
            "onLanguage:portulong",
            "onCommand:portulong.executar"
        ],
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
                        "light": "./icons/ptg.png",
                        "dark": "./icons/ptg.png"
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
                        "when": "resourceExtname == .ptg || editorLangId == portulong",
                        "group": "navigation"
                    }
                ],
                "explorer/context": [
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

    # 3. Código JavaScript executável da extensão (extension.js)
    extension_js = """
const vscode = require('vscode');

function activate(context) {
    let comando = vscode.commands.registerCommand('portulong.executar', function (uri) {
        let caminhoArquivo = null;

        if (uri && uri.fsPath) {
            caminhoArquivo = uri.fsPath;
        } else if (vscode.window.activeTextEditor) {
            caminhoArquivo = vscode.window.activeTextEditor.document.fileName;
        }

        if (!caminhoArquivo || !caminhoArquivo.endsWith('.ptg')) {
            vscode.window.showWarningMessage('Por favor, abra ou selecione um arquivo com extensão .ptg para executar.');
            return;
        }

        // Abrir ou reutilizar terminal Portulong
        let terminal = vscode.window.terminals.find(t => t.name === 'Portulong');
        if (!terminal) {
            terminal = vscode.window.createTerminal('Portulong');
        }

        terminal.show();
        terminal.sendText(`ptg "${caminhoArquivo}"`);
        vscode.window.showInformationMessage(`▶ A executar Portulong: ${caminhoArquivo.split(/[\\\\/]/).pop()}`);
    });

    context.subscriptions.push(comando);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
"""
    (pasta_portulong / "extension.js").write_text(extension_js, encoding='utf-8')

    # 4. Configuração da Linguagem
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

    # 5. TextMate Grammar
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

    # 6. Snippets em Português
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

    # Atualizar configurações do VS Code em tempo real
    atualizar_settings_tempo_real()

    print(f"✅ Extensão VS Code instalada em: {pasta_portulong}")
    print("⚡ Ícones e botão ▶ Run ativos em tempo real no VS Code!")
    return pasta_portulong

if __name__ == '__main__':
    instalar_extensao_vscode()
