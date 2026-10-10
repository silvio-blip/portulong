#!/usr/bin/env python3
"""
Instalador do Portulong no Sistema Operacional (Windows & Linux)
Configura:
1. Associação da extensão .ptg
2. Ícone oficial do Portulong em TODOS os arquivos .ptg
3. Ação de duplo clique para executar diretamente no navegador
4. Menu de contexto (botão direito) "▶ Executar com Portulong"
5. Extensão com botão Run e syntax highlight no VS Code
"""

import os
import sys
import shutil
import platform
import subprocess
from pathlib import Path
from .vscode import instalar_extensao_vscode

PACOTE_DIR = Path(__file__).parent
ICONE_PNG = PACOTE_DIR / "imagens" / "Portulong.png"
ICONE_ICO = PACOTE_DIR / "imagens" / "Portulong.ico"

def associar_windows():
    """Configura associações de arquivo, ícone e duplo clique no Windows"""
    print("🪟 Configurando Portulong no Windows...")
    appdata = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    pasta_destino = appdata / "Portulong"
    pasta_destino.mkdir(parents=True, exist_ok=True)

    # Copiar ícones
    ico_destino = pasta_destino / "Portulong.ico"
    png_destino = pasta_destino / "Portulong.png"
    if ICONE_ICO.exists():
        shutil.copy(ICONE_ICO, ico_destino)
    if ICONE_PNG.exists():
        shutil.copy(ICONE_PNG, png_destino)

    comando_exec = f'"{sys.executable}" -m portulong "%1"'

    # Gerar arquivo de Registro .reg (funciona em qualquer Windows)
    reg_content = f"""Windows Registry Editor Version 5.00

; Associação da extensão .ptg ao Portulong
[HKEY_CURRENT_USER\\Software\\Classes\\.ptg]
@="Portulong.Arquivo"
"Content Type"="application/x-portulong"
"PerceivedType"="document"

[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo]
@="Arquivo Portulong (.ptg)"
"FriendlyTypeName"="Arquivo de Código Portulong"

; Ícone do Portulong para todos os arquivos .ptg
[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo\\DefaultIcon]
@="{str(ico_destino).replace(chr(92), chr(92)+chr(92))}"

; Duplo clique abre diretamente com o Portulong
[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo\\shell]
@="executar"

[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo\\shell\\executar]
@="▶ Executar com Portulong"
"Icon"="{str(ico_destino).replace(chr(92), chr(92)+chr(92))}"

[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo\\shell\\executar\\command]
@="{comando_exec.replace(chr(92), chr(92)+chr(92)).replace(chr(34), chr(92)+chr(34))}"

[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo\\shell\\open\\command]
@="{comando_exec.replace(chr(92), chr(92)+chr(92)).replace(chr(34), chr(92)+chr(34))}"
"""
    reg_file = pasta_destino / "associar_portulong.reg"
    reg_file.write_text(reg_content, encoding='utf-8')

    # Tentar aplicar via winreg se estiver rodando no Windows
    try:
        import winreg
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\.ptg") as key:
            winreg.SetValue(key, "", winreg.REG_SZ, "Portulong.Arquivo")
            winreg.SetValueEx(key, "Content Type", 0, winreg.REG_SZ, "application/x-portulong")

        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\Portulong.Arquivo") as key:
            winreg.SetValue(key, "", winreg.REG_SZ, "Arquivo Portulong (.ptg)")

        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\Portulong.Arquivo\DefaultIcon") as key:
            winreg.SetValue(key, "", winreg.REG_SZ, str(ico_destino))

        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\Portulong.Arquivo\shell\open\command") as key:
            winreg.SetValue(key, "", winreg.REG_SZ, comando_exec)

        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\Portulong.Arquivo\shell\executar") as key:
            winreg.SetValue(key, "", winreg.REG_SZ, "▶ Executar com Portulong")
            winreg.SetValueEx(key, "Icon", 0, winreg.REG_SZ, str(ico_destino))

        with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Classes\Portulong.Arquivo\shell\executar\command") as key:
            winreg.SetValue(key, "", winreg.REG_SZ, comando_exec)

        print("✅ Registro do Windows atualizado com sucesso!")
    except Exception:
        # Se falhar a escrita direta ou estiver no Linux gerando instalador
        try:
            subprocess.run(["reg", "import", str(reg_file)], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

    print(f"✅ Arquivo de configuração do Windows salvo em: {reg_file}")


def associar_linux():
    """Configura associações de arquivo, ícone e duplo clique no Linux"""
    print("🐧 Configurando Portulong no Linux...")
    home = Path.home()

    # 1. Instalar Ícone
    pasta_icones = home / ".local" / "share" / "icons" / "hicolor" / "128x128" / "apps"
    pasta_icones.mkdir(parents=True, exist_ok=True)
    icone_destino = pasta_icones / "portulong.png"
    if ICONE_PNG.exists():
        shutil.copy(ICONE_PNG, icone_destino)

    # 2. Registrar Tipo MIME
    pasta_mime = home / ".local" / "share" / "mime" / "packages"
    pasta_mime.mkdir(parents=True, exist_ok=True)
    mime_xml = """<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
    <mime-type type="application/x-ptg">
        <comment>Arquivo de Código Portulong</comment>
        <comment xml:lang="pt">Arquivo de Código Portulong</comment>
        <icon name="portulong"/>
        <glob pattern="*.ptg"/>
    </mime-type>
</mime-info>
"""
    (pasta_mime / "application-ptg.xml").write_text(mime_xml, encoding='utf-8')

    try:
        subprocess.run(["update-mime-database", str(home / ".local" / "share" / "mime")], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    # 3. Criar Launcher .desktop
    pasta_apps = home / ".local" / "share" / "applications"
    pasta_apps.mkdir(parents=True, exist_ok=True)
    desktop_entry = f"""[Desktop Entry]
Name=Portulong
Comment=Executar arquivo Portulong (.ptg) no navegador
Exec=python3 -m portulong %f
Icon=portulong
Terminal=false
Type=Application
MimeType=application/x-ptg;text/x-portulong;
Categories=Development;IDE;
StartupNotify=true
Actions=Run;

[Desktop Action Run]
Name=Executar com Portulong
Exec=python3 -m portulong %f
"""
    desktop_file = pasta_apps / "portulong.desktop"
    desktop_file.write_text(desktop_entry, encoding='utf-8')
    desktop_file.chmod(0o755)

    # 4. Atualizar Associações Padrão
    pasta_config = home / ".config"
    pasta_config.mkdir(parents=True, exist_ok=True)
    mimeapps_list = pasta_config / "mimeapps.list"
    try:
        conteudo_mime = mimeapps_list.read_text(encoding='utf-8') if mimeapps_list.exists() else "[Default Applications]\n"
        if "application/x-ptg" not in conteudo_mime:
            if "[Default Applications]" in conteudo_mime:
                conteudo_mime = conteudo_mime.replace(
                    "[Default Applications]",
                    "[Default Applications]\napplication/x-ptg=portulong.desktop"
                )
            else:
                conteudo_mime += "\n[Default Applications]\napplication/x-ptg=portulong.desktop\n"
            mimeapps_list.write_text(conteudo_mime, encoding='utf-8')
    except Exception:
        pass

    try:
        subprocess.run(["update-desktop-database", str(pasta_apps)], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    print("✅ Ícones e associações configuradas no Linux!")


def instalar_tudo():
    """Instalação 100% completa: Sistema Operacional + VS Code + Atalhos"""
    print("=" * 60)
    print("📦 INSTALAÇÃO COMPLETA DO PORTULONG")
    print("=" * 60)

    sistema = platform.system().lower()
    if sistema == "windows":
        associar_windows()
    else:
        associar_linux()

    # Instala a extensão do VS Code independente do sistema
    try:
        instalar_extensao_vscode()
    except Exception as e:
        print(f"⚠️ Aviso na extensão VS Code: {e}")

    # Criar marcador de configuração concluída
    config_dir = Path.home() / ".config" / "portulong"
    config_dir.mkdir(parents=True, exist_ok=True)
    (config_dir / "configurado").write_text("1", encoding='utf-8')

    print("=" * 60)
    print("🎉 PORTULONG INSTALADO COM SUCESSO A 100%!")
    print("👉 Agora pode dar duplo clique em qualquer arquivo .ptg para executar.")
    print("👉 No VS Code, abra qualquer arquivo .ptg e clique no botão ▶ Executar.")
    print("=" * 60)

if __name__ == '__main__':
    instalar_tudo()
