"""
Configurador Universal de Extensão, Ícones e Snippets para Visual Studio Code
Gera definições de sintaxe, atalhos, associações de ficheiros .ptg e a extensão local.
"""

import os
import json
import shutil
import platform

def configurar_vscode_extensao():
    """Configura o Portulong como uma extensão local do VS Code e oculta a pasta .vscode."""
    print("⚙️ A configurar Portulong como extensão local e a ocultar definições...")
    
    vscode_dir = ".vscode"
    os.makedirs(vscode_dir, exist_ok=True)
    
    # 1. Configurações gerais (settings.json) para ocultar o próprio .vscode
    settings_path = os.path.join(vscode_dir, "settings.json")
    settings = {
        "files.associations": { "*.ptg": "portulong" },
        "editor.quickSuggestions": { "other": True, "comments": True, "strings": True },
        "editor.suggestOnTriggerCharacters": True,
        "files.iconAssociations": { "*.ptg": "portulong" },
        "files.exclude": { "**/.vscode": True }
    }
    with open(settings_path, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=4)

    # 2. Configurar Extensão Local
    ext_dir = os.path.join(vscode_dir, "extension")
    syntaxes_dir = os.path.join(ext_dir, "syntaxes")
    os.makedirs(syntaxes_dir, exist_ok=True)
    
    # Ícone
    icon_src = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "imagens", "Portulong.png"))
    icon_dest = os.path.join(ext_dir, "portulong-icon.png")
    if os.path.exists(icon_src):
        shutil.copy(icon_src, icon_dest)
        
    # Manifesto da Extensão
    package_json = {
      "name": "portulong-vscode",
      "displayName": "Portulong",
      "description": "Suporte nativo para linguagem Portulong",
      "version": "1.0.31",
      "publisher": "silvio",
      "engines": { "vscode": "^1.60.0" },
      "contributes": {
        "languages": [{
            "id": "portulong",
            "aliases": ["Portulong", "ptg"],
            "extensions": [".ptg"],
            "configuration": "./language-configuration.json"
        }],
        "grammars": [{
            "language": "portulong",
            "scopeName": "source.ptg",
            "path": "./syntaxes/portulong.tmLanguage.json"
        }],
        "commands": [{
            "command": "portulong.run",
            "title": "Executar Ficheiro Portulong"
        }],
        "menus": {
          "editor/title": [{
              "command": "portulong.run",
              "group": "navigation",
              "when": "resourceLangId == portulong"
          }]
        }
      }
    }
    with open(os.path.join(ext_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2)

    # Copiar ficheiros de gramática/configuração (assumindo que existem ou criar aqui)
    # Re-criar configuração de sintaxe se necessário
    config_json = {
        "comments": { "lineComment": "#" },
        "indentationRules": {
            "increaseIndentPattern": "^\\s*(pagina|cabecalho|se|senao|enquanto|para|funcao).*:\\s*$",
            "decreaseIndentPattern": "^\\s*(fim_)\\b"
        }
    }
    with open(os.path.join(ext_dir, "language-configuration.json"), "w", encoding="utf-8") as f:
        json.dump(config_json, f, indent=2)

    print(f"✅ Extensão Portulong criada em: {ext_dir} e pasta .vscode oculta.")
    print("💡 Para ativar: Extensões -> ... -> 'Load Unpacked Extension' -> selecione .vscode/extension/")
    return True

# Alias de compatibilidade
configurar_vscode = configurar_vscode_extensao
configurar_sistema = configurar_vscode_extensao

