"""
Configurador Universal do Ambiente Portulong.
Configura associações de ficheiros, ícones e snippets para o VS Code,
utilizando a extensão oficial já existente (.vsix).
"""

import os
import json
import platform

def configurar_sistema():
    """Configura o ambiente Portulong nativamente para o editor."""
    print("⚙️ A aplicar configurações nativas do Portulong...")
    
    vscode_dir = ".vscode"
    os.makedirs(vscode_dir, exist_ok=True)
    
    # 1. Configurações gerais (settings.json)
    settings_path = os.path.join(vscode_dir, "settings.json")
    settings = {
        "files.associations": { "*.ptg": "portulong" },
        "editor.quickSuggestions": { "other": True, "comments": True, "strings": True },
        "editor.suggestOnTriggerCharacters": True,
        "files.exclude": { "**/.vscode": True },
        "explorer.fileExtensions": {
            "ptg": "portulong-icon"
        },
        "workbench.iconTheme": "vs-seti"
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

    # 2. Snippets
    snippets_path = os.path.join(vscode_dir, "portulong.code-snippets")
    snippets = {
        "Escrever no Terminal": {
            "prefix": ["escrever", "imprimir"],
            "body": ["escrever(\"$1\")"],
            "description": "Imprime texto no terminal"
        },
        "Criar Bot Discord": {
            "prefix": ["discord.CriarBot"],
            "body": [
                "importar discord",
                "bot = discord.CriarBot(prefixo=\"${1:!}\")",
                "ao bot.quando_pronto:",
                "    funcao ao_ligar():",
                "        escrever(\"Bot ligado!\")",
                "bot.iniciar(\"${2:TOKEN}\")"
            ],
            "description": "Cria um bot Discord em Portulong"
        }
    }
    with open(snippets_path, "w", encoding="utf-8") as f:
        json.dump(snippets, f, ensure_ascii=False, indent=4)

    print("✅ Configurações aplicadas! Certifique-se de instalar a extensão 'portulong-1.0.31.vsix' através da aba de extensões do VS Code.")
    return True

# Alias de compatibilidade
configurar_vscode = configurar_sistema
