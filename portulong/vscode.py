import os
import json

def configurar_vscode():
    vscode_dir = ".vscode"
    os.makedirs(vscode_dir, exist_ok=True)
    settings_path = os.path.join(vscode_dir, "settings.json")
    
    settings = {
        "files.associations": {
            "*.ptg": "portulong"
        },
        "editor.quickSuggestions": {
            "other": true,
            "comments": true,
            "strings": true
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
    print("Portulong: Configurações do VS Code aplicadas com sucesso.")
