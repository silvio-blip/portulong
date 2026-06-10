import os
import sys
import json
import subprocess
import shutil

# Definições da Extensão VS Code
package_json = {
  "name": "portulong-vscode",
  "displayName": "Portulong support",
  "description": "Suporte de sintaxe e execução no terminal para a linguagem Portulong (.ptg)",
  "version": "1.0.0",
  "publisher": "silvio-blip",
  "repository": {
    "type": "git",
    "url": "https://github.com/silvio-blip/portulong"
  },
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": [
    "Programming Languages"
  ],
  "activationEvents": [
    "onLanguage:portulong"
  ],
  "main": "./src/extension.js",
  "contributes": {
    "languages": [
      {
        "id": "portulong",
        "aliases": [
          "Portulong",
          "portulong"
        ],
        "extensions": [
          ".ptg"
        ],
        "configuration": "./language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "portulong",
        "scopeName": "source.portulong",
        "path": "./syntaxes/portulong.tmLanguage.json"
      }
    ],
    "commands": [
      {
        "command": "portulong.executar",
        "title": "Portulong: Executar Ficheiro",
        "icon": "$(play)"
      }
    ],
    "menus": {
      "editor/title": [
        {
          "when": "resourceExtname == .ptg",
          "command": "portulong.executar",
          "group": "navigation"
        }
      ]
    },
    "keybindings": [
      {
        "command": "portulong.executar",
        "key": "ctrl+f5",
        "mac": "cmd+f5",
        "when": "editorTextFocus && editorLangId == portulong"
      }
    ]
  }
}

language_configuration = {
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
    { "open": "\"", "close": "\"" },
    { "open": "'", "close": "'" }
  ],
  "surroundingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\"", "\""],
    ["'", "'"]
  ]
}

tmlanguage_json = {
  "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
  "name": "Portulong",
  "scopeName": "source.portulong",
  "patterns": [
    {
      "include": "#comments"
    },
    {
      "include": "#strings"
    },
    {
      "include": "#keywords"
    },
    {
      "include": "#constants"
    },
    {
      "include": "#builtin-functions"
    }
  ],
  "repository": {
    "comments": {
      "patterns": [
        {
          "name": "comment.line.number-sign.portulong",
          "match": "#.*$"
        }
      ]
    },
    "strings": {
      "patterns": [
        {
          "name": "string.quoted.double.portulong",
          "begin": "\"",
          "end": "\"",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": "\\\\."
            }
          ]
        },
        {
          "name": "string.quoted.single.portulong",
          "begin": "'",
          "end": "'",
          "patterns": [
            {
              "name": "constant.character.escape.portulong",
              "match": "\\\\."
            }
          ]
        }
      ]
    },
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.portulong",
          "match": "\\\\b(se|senao|enquanto|para|retornar|esperar|assincrono)\\\\b"
        }
      ]
    },
    "constants": {
      "patterns": [
        {
          "name": "constant.language.portulong",
          "match": "\\\\b(verdadeiro|falso|nulo)\\\\b"
        }
      ]
    },
    "builtin-functions": {
      "patterns": [
        {
          "name": "support.function.builtin.portulong",
          "match": "\\\\b(presente|importar|de)\\\\b"
        }
      ]
    }
  }
}

extension_js = """const vscode = require('vscode');

function activate(context) {
    let disposable = vscode.commands.registerCommand('portulong.executar', function () {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('Nenhum ficheiro Portulong (.ptg) está aberto atualmente.');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'portulong' && !document.fileName.endsWith('.ptg')) {
            vscode.window.showErrorMessage('O ficheiro ativo não é um ficheiro Portulong (.ptg).');
            return;
        }

        document.save().then(() => {
            const filePath = document.fileName;
            let terminal = vscode.window.terminals.find(t => t.name === 'Portulong Executar');
            if (!terminal) {
                terminal = vscode.window.createTerminal('Portulong Executar');
            }
            terminal.show();
            terminal.sendText(`portulong executar "${filePath}"`);
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
"""

def info(msg):
    print(f"\\033[1;34m[*] {msg}\\033[0m")

def success(msg):
    print(f"\\033[1;32m[+] {msg}\\033[0m")

def warn(msg):
    print(f"\\033[1;33m[!] {msg}\\033[0m")

def error(msg):
    print(f"\\033[1;31m[x] {msg}\\033[0m")

def main():
    print("="*60)
    print("   INSTALADOR AUTOMÁTICO DO PORTULONG E EXTENSÃO VS CODE")
    print("="*60)

    # 1. Instalar o Portulong (Tenta local primeiro, depois PyPI)
    info("1/4. Instalando linguagem de programação Portulong...")
    instalado_local = False
    
    # Se o script for corrido dentro do repositório onde existe o pyproject.toml
    if os.path.exists("pyproject.toml"):
        info("Encontrado 'pyproject.toml' localmente. Tentando instalar em modo editável/direto...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."], check=True)
            success("Excelente! Portulong instalado em modo de desenvolvimento local com absoluto sucesso!")
            instalado_local = True
        except Exception as e_local:
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", "."], check=True)
                success("Excelente! Portulong instalado localmente com absoluto sucesso!")
                instalado_local = True
            except Exception as e_local_padrao:
                warn(f"Tentativa de instalação local falhou: {e_local_padrao}. Tentando via indexador remoto...")
                
    if not instalado_local:
        info("Instalando pacote 'portulong.ptg' oficial a partir do PyPI...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "portulong.ptg"], check=True)
            success("Portulong instalado com sucesso via pip!")
        except Exception as e:
            warn(f"Não foi possível instalar portulong.ptg automaticamente do PyPI: {e}")
            info("Certifique-se de rodar posteriormente no seu ambiente: pip install portulong.ptg")

    # 2. Criar a estrutura de ficheiros da Extensão VS Code
    ext_dir = "portulong-vscode"
    info(f"2/4. Criando diretórios da extensão VS Code em '{ext_dir}'...")
    
    os.makedirs(ext_dir, exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "syntaxes"), exist_ok=True)
    os.makedirs(os.path.join(ext_dir, "src"), exist_ok=True)

    with open(os.path.join(ext_dir, "package.json"), "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "language-configuration.json"), "w", encoding="utf-8") as f:
        json.dump(language_configuration, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "syntaxes", "portulong.tmLanguage.json"), "w", encoding="utf-8") as f:
        json.dump(tmlanguage_json, f, indent=2, ensure_ascii=False)

    with open(os.path.join(ext_dir, "src", "extension.js"), "w", encoding="utf-8") as f:
        f.write(extension_js)

    success("Estrutura de ficheiros da extensão VS Code criada com perfeição!")

    # 3. Compilar a Extensão para .vsix utilizando npx de forma leve
    info("3/4. Compilando extensão para .vsix...")
    # Tenta verificar se o npx está disponível
    npx_path = shutil.which("npx")
    if npx_path:
        try:
            # Roda npx @vscode/vsce package no diretório da extensão
            info("Rodando vsce via npx temporário para gerar o instalador...")
            # Em sistemas Windows pode precisar do shell=True
            subprocess.run([npx_path, "-y", "@vscode/vsce", "package", "--allow-missing-repository"], cwd=ext_dir, check=True, shell=os.name == 'nt')
            success("Extensão compilada em ficheiro .vsix com sucesso!")
        except Exception as e:
            warn(f"Durante a compilação do vsce: {e}")
            warn("Se não tiver o Node.js/npm instalado, tudo bem! Os ficheiros foram todos criados.")
            warn(f"Dica: Acesse a pasta {ext_dir} e rode 'npx @vscode/vsce package' manualmente.")
    else:
        warn("npx ou Node.js não detetado no sistema.")
        warn("Os ficheiros da extensão foram gerados. Para compilar para VSIX, instale o Node.js e execute:")
        warn(f"  cd {ext_dir} && npx @vscode/vsce package")

    # 4. Tentar instalar diretamente no VS Code se o comando estiver disponível
    info("4/4. Tentando instalar a extensão diretamente no VS Code local...")
    code_path = shutil.which("code")
    if code_path:
        try:
            vsix_files = [f for f in os.listdir(ext_dir) if f.endswith(".vsix")]
            if vsix_files:
                vsix_filepath = os.path.join(ext_dir, vsix_files[0])
                info(f"Instalando {vsix_filepath} no VS Code...")
                subprocess.run([code_path, "--install-extension", vsix_filepath], check=True, shell=os.name == 'nt')
                success("Extensão Portulong instalada automaticamente no seu VS Code!")
                print("\\033[1;32mSeu VS Code agora está 100% equipado com suporte e o botão Play!\\033[0m")
            else:
                warn("Nenhum ficheiro .vsix encontrado para instalação automática.")
        except Exception as e:
            warn(f"Erro na instalação automática via 'code': {e}")
    else:
        info("Comando 'code' não configurado no terminal. Não se preocupe!")
        info(f"Você pode arrastar o ficheiro .vsix gerado na pasta {ext_dir} ou importar manualmente nas extensões do VS Code.")

    print("\\033[1;32m")
    print("="*60)
    print("   CONCLUÍDO COM SUCESSO! SEU AMBIENTE ESTÁ PRONTO.")
    print("="*60)
    print("\\033[0m")

if __name__ == "__main__":
    main()
