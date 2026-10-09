#!/usr/bin/env python3
"""
Instalador completo do portulong-sistema
Configura tudo automaticamente: ícones, MIME, VS Code, atalhos
"""

import os
import sys
import subprocess
import urllib.request
import shutil
import time
from pathlib import Path

def run_cmd(cmd, check=True):
    """Executa comando e retorna resultado"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if check and result.returncode != 0:
            print(f"Erro: {cmd}")
            print(result.stderr)
        return result
    except Exception as e:
        print(f"Erro ao executar: {cmd} - {e}")
        return None

def instalar_icone():
    """Baixa ícone do GitHub (raw) - sempre funciona"""
    print("📥 Baixando ícone...")
    icone_url = "https://raw.githubusercontent.com/silvio-blip/portulong/main/imagens/Portulong.png"
    icone_destino = Path.home() / ".local/share/icons/hicolor/128x128/apps/portulong.png"
    icone_destino.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        urllib.request.urlretrieve(icone_url, icone_destino)
        print(f"✅ Ícone instalado: {icone_destino}")
        return True
    except Exception as e:
        print(f"❌ Erro ao baixar ícone: {e}")
        return False

def configurar_mime():
    """Configura tipo MIME para .ptg"""
    print("📝 Configurando MIME type...")
    mime_dir = Path.home() / ".local/share/mime/packages"
    mime_dir.mkdir(parents=True, exist_ok=True)
    
    mime_xml = """<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-ptg">
    <comment>Arquivo portulong</comment>
    <glob pattern="*.ptg"/>
    <icon name="portulong"/>
  </mime-type>
</mime-info>"""
    
    mime_file = mime_dir / "application-ptg.xml"
    mime_file.write_text(mime_xml)
    
    run_cmd("update-mime-database ~/.local/share/mime")
    print("✅ MIME type configurado")

def configurar_desktop():
    """Configura arquivo .desktop para executar .ptg"""
    print("🖥️ Configurando arquivo .desktop...")
    desktop_dir = Path.home() / ".local/share/applications"
    desktop_dir.mkdir(parents=True, exist_ok=True)
    
    desktop_content = """[Desktop Entry]
Version=1.0
Type=Application
Name=portulong
Comment=Executar arquivos portulong (.ptg)
Exec=ptg %f
Icon=portulong
Terminal=true
Categories=Development;
MIMETypes=application/x-ptg;
"""
    desktop_file = Path.home() / ".local/share/applications/portulong.desktop"
    desktop_file.write_text(desktop_content)
    
    run_cmd("update-desktop-database ~/.local/share/applications/")
    run_cmd("xdg-mime default portulong.desktop application/x-ptg")
    print("✅ Arquivo .desktop configurado")

def instalar_vscode_extension():
    """Instala extensão VS Code"""
    print("📦 Instalando extensão VS Code...")
    # Verificar se code está disponível
    if shutil.which("code"):
        result = run_cmd("code --install-extension silvio-blip.portulong", check=False)
        if result and result.returncode == 0:
            print("✅ Extensão VS Code instalada")
        else:
            print("⚠️ Extensão não encontrada no marketplace - configure manualmente")
            print("   VS Code > Extensões > procurar 'portulong'")
    elif shutil.which("codegoes"):
        result = run_cmd("codegoes --install-extension silvio-blip.portulong", check=False)
        if result and result.returncode == 0:
            print("✅ Extensão CodeGoes instalada")
        else:
            print("⚠️ Extensão não encontrada no marketplace - configure manualmente")
    else:
        print("ℹ️ VS Code/CodeGoes não encontrado - instale manualmente")

def configurar_vscode():
    """Configura VS Code/CodeGoes para .ptg"""
    print("🔧 Configurando VS Code/CodeGoes...")
    
    # Criar configuração de usuário do VS Code
    vscode_dir = Path.home() / ".config/Code/User"
    vscode_dir.mkdir(parents=True, exist_ok=True)
    
    settings_file = vscode_dir / "settings.json"
    settings = {}
    if settings_file.exists():
        import json
        try:
            settings = json.loads(settings_file.read_text())
        except:
            pass
    
    # Adicionar associação de arquivo
    if "files.associations" not in settings:
        settings["files.associations"] = {}
    settings["files.associations"]["*.ptg"] = "portulong"
    
    # Adicionar icon theme se não existir
    if "workbench.iconTheme" not in settings:
        settings["workbench.iconTheme"] = "vs-seti"
    
    import json
    settings_file.write_text(json.dumps(settings, indent=2))
    print("✅ VS Code configurado")
    
    # Criar pasta de snippets
    snippets_dir = vscode_dir / "snippets"
    snippets_dir.mkdir(parents=True, exist_ok=True)
    snippets_file = snippets_dir / "portulong.json"
    snippets_content = {
        "Página": {
            "prefix": "pagina",
            "body": [
                'pagina "${1:Minha Página}"',
                "",
                'cabecalho "${2:Olá, mundo!}"',
                'paragrafo "${3:Bem-vindo ao portulong.}"',
                'botao "${4:Clique Aqui}" acao "alerta(\'${5:Olá, mundo!}\')"',
                "",
                "estilo:",
                "body { fundo: #f0f0f0; }",
                "h1 { cor: #333; }",
                "",
                "script:",
                "funcao alerta(mensagem):",
                "    alerta(mensagem)"
            ],
            "description": "Cria página portulong básica"
        },
        "Cabeçalho": {
            "prefix": "cabecalho",
            "body": ['cabecalho "${1:Título}"'],
            "description": "Cria cabeçalho h1"
        },
        "Parágrafo": {
            "prefix": "paragrafo",
            "body": ['paragrafo "${1:Texto}"'],
            "description": "Cria parágrafo"
        },
        "Botão": {
            "prefix": "botao",
            "body": ['botao "${1:Label}" acao "${2:alerta(\'clicado\')}"'],
            "description": "Cria botão com ação"
        },
        "Estilo": {
            "prefix": "estilo",
            "body": [
                "estilo:",
                "${1:seletor} { ${2:propriedade}: ${3:valor}; }"
            ],
            "description": "Bloco de estilo CSS"
        },
        "Script": {
            "prefix": "script",
            "body": [
                "script:",
                "funcao ${1:nome}(${2:param}):",
                "    ${3:codigo}"
            ],
            "description": "Bloco de script com função"
        }
    }
    snippets_file.write_text(json.dumps(snippets_content, indent=2, ensure_ascii=False))
    print("✅ Snippets VS Code criados")

def atualizar_caches():
    """Atualiza caches do sistema"""
    print("🔄 Atualizando caches...")
    run_cmd("gtk-update-icon-cache ~/.local/share/icons/hicolor/")
    run_cmd("update-desktop-database ~/.local/share/applications/")
    run_cmd("update-mime-database ~/.local/share/mime")
    print("✅ Caches atualizados")

def reiniciar_gerenciadores():
    """Reinicia gerenciadores de arquivos"""
    print("🔄 Reiniciando gerenciadores...")
    for cmd in ["nautilus -q", "dolphin -q", "thunar -q", "pcmanfm -q"]:
        run_cmd(cmd, check=False)
    print("✅ Gerenciadores reiniciados")

def main():
    print("=" * 50)
    print("  Instalador Completo portulong-sistema")
    print("=" * 50)
    print()
    
    # Verificar se é root (não recomendado)
    if os.geteuid() == 0:
        print("⚠️ Não execute como root!")
        return 1
    
    # Executar todas as configurações
    instalar_icone()
    configurar_mime()
    configurar_desktop()
    configurar_vscode()
    atualizar_caches()
    reiniciar_gerenciadores()
    instalar_vscode_extension()
    
    print()
    print("=" * 50)
    print("  ✅ Instalação Completa!")
    print("=" * 50)
    print()
    print("Agora você pode:")
    print("  ptg arquivo.ptg          # Executar arquivo")
    print("  ptg install              # Instala e configura tudo")
    print("  ptg update               # Atualiza versão")
    print("  ptg uninstall            # Remove tudo")
    print("  ptg version              # Mostra versão")
    print("  ptg config               # Configura sistema")
    print("  ptg help                 # Mostra ajuda")
    print("  Duplo clique em .ptg     # Executa automaticamente")
    print()
    print("Reinicie o VS Code/CodeGoes para ver:")
    print("  - Ícone do .ptg no explorer")
    print("  - Syntax highlighting")
    print("  - Snippets (digite 'pagina' + Tab)")
    print("  - Auto-complete")
    print()

if __name__ == "__main__":
    import json
    sys.exit(main())