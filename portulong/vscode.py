#!/usr/bin/env python3
"""
Instalador Robusto da extensão do VS Code e GitHub Codespaces para o Portulong (.ptg)
Funciona em:
- VS Code Desktop (Windows, Linux, macOS)
- GitHub Codespaces / VS Code Web (/workspaces)
- VS Code Remote Server / SSH
"""

import os
import sys
import json
import shutil
import zipfile
import subprocess
import urllib.request
from pathlib import Path

URL_ICONE_IMGUR = "https://i.imgur.com/CCsXVnb.png"

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

def obter_todas_pastas_extensoes():
    """Localiza TODAS as pastas possíveis de extensões (Desktop, Codespaces, Servidor Remoto)"""
    pastas = []
    home = Path.home()

    candidatos = [
        # Desktop padrão
        home / ".vscode" / "extensions",
        home / ".vscode-insiders" / "extensions",

        # GitHub Codespaces & VS Code Server
        home / ".vscode-remote" / "extensions",
        home / ".vscode-server" / "extensions",
        home / ".vscode-server-insiders" / "extensions",
        Path("/home/vscode/.vscode-remote/extensions"),
        Path("/home/vscode/.vscode-server/extensions"),
        Path("/home/codespace/.vscode-remote/extensions"),
        Path("/home/codespace/.vscode-server/extensions"),
        Path("/root/.vscode-remote/extensions"),
        Path("/root/.vscode-server/extensions"),
    ]

    for c in candidatos:
        try:
            if c.exists():
                pastas.append(c)
        except Exception:
            pass

    # Se não encontrou nenhuma das existentes, garante pelo menos a padrão e a do Codespaces se estiver lá
    if not pastas:
        if Path("/workspaces").exists() or os.environ.get("CODESPACES"):
            p_codespace = home / ".vscode-remote" / "extensions"
            p_codespace.mkdir(parents=True, exist_ok=True)
            pastas.append(p_codespace)
            p_server = home / ".vscode-server" / "extensions"
            p_server.mkdir(parents=True, exist_ok=True)
            pastas.append(p_server)
        else:
            p_default = home / ".vscode" / "extensions"
            p_default.mkdir(parents=True, exist_ok=True)
            pastas.append(p_default)

    return list(set(pastas))

def obter_pastas_settings():
    """Localiza todos os arquivos de settings (User, Machine e Workspace do Codespaces)"""
    candidatos = []
    home = Path.home()

    # Workspace atual (.vscode)
    cwd = Path.cwd()
    candidatos.append(cwd / ".vscode")

    # Windows
    appdata = os.environ.get("APPDATA")
    if appdata:
        candidatos.append(Path(appdata) / "Code" / "User")
        candidatos.append(Path(appdata) / "Code - Insiders" / "User")

    # Linux e Codespaces
    candidatos.append(home / ".config" / "Code" / "User")
    candidatos.append(home / ".config" / "Code - Insiders" / "User")
    candidatos.append(home / ".vscode-server" / "data" / "Machine")
    candidatos.append(home / ".vscode-remote" / "data" / "Machine")
    candidatos.append(Path("/home/vscode/.vscode-remote/data/Machine"))
    candidatos.append(Path("/home/codespace/.vscode-remote/data/Machine"))

    pastas_validas = []
    for c in candidatos:
        try:
            if c.exists() or c.parent.exists():
                pastas_validas.append(c)
        except Exception:
            pass
    return list(set(pastas_validas))

def aplicar_settings_tempo_real():
    """Aplica associações *.ptg no settings.json para ativação instantânea"""
    for pasta in obter_pastas_settings():
        try:
            pasta.mkdir(parents=True, exist_ok=True)
            settings_file = pasta / "settings.json"
            cfg = {}
            if settings_file.exists():
                try:
                    cfg = json.loads(settings_file.read_text(encoding='utf-8'))
                except Exception:
                    cfg = {}

            assocs = cfg.get("files.associations", {})
            assocs["*.ptg"] = "portulong"
            cfg["files.associations"] = assocs

            settings_file.write_text(json.dumps(cfg, indent=4, ensure_ascii=False), encoding='utf-8')

            # Se for pasta .vscode de workspace, cria tasks.json para atalho de execução imediata
            if pasta.name == ".vscode":
                tasks_file = pasta / "tasks.json"
                tasks_cfg = {
                    "version": "2.0.0",
                    "tasks": [
                        {
                            "label": "▶ Executar Portulong",
                            "type": "shell",
                            "command": "ptg \"${file}\"",
                            "group": {
                                "kind": "build",
                                "isDefault": True
                            },
                            "presentation": {
                                "reveal": "always",
                                "panel": "new"
                            },
                            "problemMatcher": []
                        }
                    ]
                }
                tasks_file.write_text(json.dumps(tasks_cfg, indent=4, ensure_ascii=False), encoding='utf-8')
        except Exception:
            pass

def criar_pacote_vsix(pasta_extensao, destino_vsix):
    """Gera um arquivo .vsix padrão instalado nativamente pelo VS Code"""
    try:
        vsixmanifest = f"""<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Id="portulong-linguagem" Version="1.0.26" Publisher="silvio"/>
    <DisplayName>Portulong (.ptg) - Linguagem PT-PT</DisplayName>
    <Description>Linguagem de programacao em Portugues para paginas web com botao Executar nativo.</Description>
    <Icon>extension/icon.png</Icon>
    <Categories>Programming Languages,Snippets</Categories>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true"/>
  </Assets>
</PackageManifest>
"""
        content_types = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json"/>
  <Default Extension="js" ContentType="application/javascript"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="vsixmanifest" ContentType="text/xml"/>
  <Default Extension="xml" ContentType="text/xml"/>
</Types>
"""
        with zipfile.ZipFile(destino_vsix, 'w', zipfile.ZIP_DEFLATED) as z:
            z.writestr("extension.vsixmanifest", vsixmanifest)
            z.writestr("[Content_Types].xml", content_types)
            for root, _, files in os.walk(pasta_extensao):
                for f in files:
                    full_p = Path(root) / f
                    rel_p = full_p.relative_to(pasta_extensao)
                    z.write(full_p, f"extension/{rel_p}")
        return True
    except Exception:
        return False

def instalar_extensao_vscode():
    """Gera, instala e ativa a extensão do Portulong no VS Code e Codespaces"""
    nome_extensao = "portulong-linguagem-1.0.26"
    pasta_base = Path.home() / ".config" / "portulong" / "vscode_ext"
    pasta_base.mkdir(parents=True, exist_ok=True)

    pasta_sintaxe = pasta_base / "syntaxes"
    pasta_sintaxe.mkdir(exist_ok=True)
    pasta_snippets = pasta_base / "snippets"
    pasta_snippets.mkdir(exist_ok=True)
    pasta_icons = pasta_base / "icons"
    pasta_icons.mkdir(exist_ok=True)

    garantir_icone(pasta_base / "icon.png")
    garantir_icone(pasta_icons / "ptg.png")

    pkg = {
        "name": "portulong-linguagem",
        "displayName": "Portulong (.ptg) - Linguagem PT-PT",
        "description": "Linguagem de programação em Português para criar páginas e aplicações web. Suporte nativo com botão de Executar.",
        "version": "1.0.26",
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
    (pasta_base / "package.json").write_text(json.dumps(pkg, indent=2, ensure_ascii=False), encoding='utf-8')

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

        let terminal = vscode.window.terminals.find(t => t.name === 'Portulong') || vscode.window.createTerminal('Portulong');
        terminal.show();
        terminal.sendText(`ptg "${caminhoArquivo}"`);
        vscode.window.showInformationMessage(`▶ A executar Portulong: ${caminhoArquivo.split(/[\\\\/]/).pop()}`);
    });

    context.subscriptions.push(comando);
}

function deactivate() {}

module.exports = { activate, deactivate };
"""
    (pasta_base / "extension.js").write_text(extension_js, encoding='utf-8')

    lang_cfg = {
        "comments": { "lineComment": "#" },
        "brackets": [["{", "}"], ["[", "]"], ["(", ")"]],
        "autoClosingPairs": [
            {"open": "{", "close": "}"},
            {"open": "[", "close": "]"},
            {"open": "(", "close": ")"},
            {"open": "\"", "close": "\""},
            {"open": "'", "close": "'"}
        ]
    }
    (pasta_base / "language-configuration.json").write_text(json.dumps(lang_cfg, indent=2), encoding='utf-8')

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
            "comments": { "match": "#.*$", "name": "comment.line.number-sign.ptg" },
            "sections": {
                "match": "^\\s*(estilo:|script:|servidor:|componente\\s+[a-zA-Z0-9_]+:|rota\\s+(GET|POST|PUT|DELETE)\\s+[^:]+:)",
                "name": "keyword.control.section.ptg"
            },
            "keywords": {
                "patterns": [
                    {
                        "match": "\\b(pagina|cabecalho|titulo1|titulo2|titulo3|paragrafo|texto|destaque|italico|botao|acao|campo|input|formulario|fim_formulario|caixa|div|fim_caixa|fim_div|imagem|descricao|ligacao|destino|quebra_linha|linha_horizontal)\\b",
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
                    { "begin": "\"", "end": "\"", "name": "string.quoted.double.ptg" },
                    { "begin": "'", "end": "'", "name": "string.quoted.single.ptg" }
                ]
            }
        },
        "scopeName": "source.ptg"
    }
    (pasta_sintaxe / "ptg.tmLanguage.json").write_text(json.dumps(grammar, indent=2), encoding='utf-8')

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
        }
    }
    (pasta_snippets / "ptg.code-snippets").write_text(json.dumps(snippets, indent=2, ensure_ascii=False), encoding='utf-8')

    # Gerar arquivo VSIX
    vsix_path = Path.cwd() / "portulong-1.0.26.vsix"
    criar_pacote_vsix(pasta_base, vsix_path)

    # 1. Tentar instalar via comando 'code' se disponível (método nativo oficial no Codespaces e Desktop)
    instalado_via_cli = False
    for bin_code in ["code", "code-insiders", "cursor", "codium"]:
        if shutil.which(bin_code):
            try:
                res = subprocess.run([bin_code, "--install-extension", str(vsix_path), "--force"], 
                                     stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
                if res.returncode == 0:
                    instalado_via_cli = True
                    print(f"✅ Extensão instalada via '{bin_code} --install-extension'!")
                    break
            except Exception:
                pass

    # 2. Copiar para todas as pastas de extensões encontradas (fallback garantido)
    pastas_destino = obter_todas_pastas_extensoes()
    for dest in pastas_destino:
        try:
            target = dest / nome_extensao
            if target.exists():
                shutil.rmtree(target, ignore_errors=True)
            shutil.copytree(pasta_base, target)
        except Exception:
            pass

    # 3. Aplicar settings em tempo real
    aplicar_settings_tempo_real()

    print("=" * 65)
    print("🧩 EXTENSÃO DO VS CODE / CODESPACES CONFIGURADA!")
    if instalado_via_cli:
        print("⚡ Instalada com sucesso no VS Code/Codespaces!")
    else:
        print(f"📦 Pacote VSIX gerado: {vsix_path.name}")
        print(f"👉 Se necessário no Codespaces: clique em Extensões (Ctrl+Shift+X) -> '...' -> 'Install from VSIX...' e escolha '{vsix_path.name}'")
    print("=" * 65)

    return pasta_base

if __name__ == '__main__':
    instalar_extensao_vscode()
