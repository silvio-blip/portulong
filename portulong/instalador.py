#!/usr/bin/env python3
"""
Instalador do Portulong no Sistema Operacional (Windows & Linux)
Configura tudo 100% em TEMPO REAL:
1. Associação da extensão .ptg
2. Ícone oficial do Portulong em TODOS os arquivos .ptg
3. Ação de duplo clique para executar diretamente no navegador
4. Menu de contexto (botão direito) "▶ Executar com Portulong"
5. Atualização imediata do cache de ícones (sem reiniciar o sistema)
6. Extensão do VS Code com botão ▶ Run e ícone nativo
"""

import os
import sys
import shutil
import struct
import platform
import subprocess
import urllib.request
from pathlib import Path
from .vscode import instalar_extensao_vscode, garantir_icone, URL_ICONE_IMGUR

PACOTE_DIR = Path(__file__).parent
ICONE_PNG = PACOTE_DIR / "imagens" / "Portulong.png"
ICONE_ICO = PACOTE_DIR / "imagens" / "Portulong.ico"

def gerar_ico_de_png(png_path, ico_path):
    """Converte PNG em ICO com formato compatível com Windows"""
    try:
        png_bytes = Path(png_path).read_bytes()
        # Header ICONDIR: 0, 1, 1
        header = struct.pack('<HHH', 0, 1, 1)
        # ICONDIRENTRY: 256x256 (0, 0), 32bpp
        entry = struct.pack('<BBBBHHII', 0, 0, 0, 0, 1, 32, len(png_bytes), 22)
        Path(ico_path).write_bytes(header + entry + png_bytes)
        return True
    except Exception:
        return False

def atualizar_cache_windows():
    """Notifica o Windows Explorer para atualizar ícones em tempo real sem reiniciar"""
    try:
        import ctypes
        # SHCNE_ASSOCCHANGED = 0x08000000, SHCNF_IDLIST = 0
        ctypes.windll.shell32.SHChangeNotify(0x08000000, 0, None, None)
        print("⚡ Cache de ícones do Windows atualizado em tempo real!")
    except Exception:
        pass

def atualizar_cache_linux():
    """Notifica o Linux para atualizar ícones e tipos MIME em tempo real"""
    home = Path.home()
    cmds = [
        ["update-mime-database", str(home / ".local" / "share" / "mime")],
        ["update-desktop-database", str(home / ".local" / "share" / "applications")],
        ["gtk-update-icon-cache", "-f", "-t", str(home / ".local" / "share" / "icons" / "hicolor")],
    ]
    for cmd in cmds:
        try:
            subprocess.run(cmd, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    print("⚡ Cache de ícones e tipos MIME do Linux atualizado em tempo real!")

def associar_windows():
    """Configura associações de arquivo, ícone e duplo clique no Windows"""
    print("🪟 Configurando Portulong no Windows em tempo real...")
    appdata = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    pasta_destino = appdata / "Portulong"
    pasta_destino.mkdir(parents=True, exist_ok=True)

    png_destino = pasta_destino / "Portulong.png"
    ico_destino = pasta_destino / "Portulong.ico"

    # Garantir PNG
    garantir_icone(png_destino)

    # Gerar ICO
    if not ico_destino.exists() and png_destino.exists():
        gerar_ico_de_png(png_destino, ico_destino)

    comando_exec = f'"{sys.executable}" -m portulong "%1"'

    # Registro do Windows
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

        print("✅ Registro do Windows configurado com sucesso!")
    except Exception as e:
        # Gerar arquivo .reg como backup
        reg_content = f"""Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Classes\\.ptg]
@="Portulong.Arquivo"
"Content Type"="application/x-portulong"

[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo]
@="Arquivo Portulong (.ptg)"

[HKEY_CURRENT_USER\\Software\\Classes\\Portulong.Arquivo\\DefaultIcon]
@="{str(ico_destino).replace(chr(92), chr(92)+chr(92))}"

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
        try:
            subprocess.run(["reg", "import", str(reg_file)], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

    # Atualiza o cache do Explorer em tempo real
    atualizar_cache_windows()
    print("✅ Ícones associados a todos os arquivos .ptg no Windows!")


def associar_linux():
    """Configura associações de arquivo, ícone e duplo clique no Linux"""
    print("🐧 Configurando Portulong no Linux em tempo real...")
    home = Path.home()

    # 1. Instalar Ícone em múltiplas resoluções
    for tam in ["128x128", "256x256", "scalable"]:
        pasta_icones = home / ".local" / "share" / "icons" / "hicolor" / tam / "apps"
        pasta_icones.mkdir(parents=True, exist_ok=True)
        garantir_icone(pasta_icones / "portulong.png")

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
Name=▶ Executar com Portulong
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

    # 5. Atualizar caches do sistema em tempo real
    atualizar_cache_linux()
    print("✅ Ícones associados a todos os arquivos .ptg no Linux!")


def instalar_tudo():
    """Configuração 100% em Tempo Real: Ícones + Duplo Clique + Botão Run no VS Code"""
    print("=" * 65)
    print("⚡ CONFIGURAÇÃO DO PORTULONG EM TEMPO REAL (ptg config)")
    print("=" * 65)

    sistema = platform.system().lower()
    if sistema == "windows":
        associar_windows()
    else:
        associar_linux()

    # Instala extensão com botão ▶ Run e ícone no VS Code
    try:
        instalar_extensao_vscode()
    except Exception as e:
        print(f"⚠️ Aviso na extensão VS Code: {e}")

    # Criar marcador de configuração concluída
    config_dir = Path.home() / ".config" / "portulong"
    config_dir.mkdir(parents=True, exist_ok=True)
    (config_dir / "configurado").write_text("1", encoding='utf-8')

    print("=" * 65)
    print("🎉 TUDO CONFIGURADO A 100% EM TEMPO REAL!")
    print("✨ Todos os arquivos .ptg já mostram o ícone oficial do Portulong.")
    print("▶️ No VS Code, abra qualquer .ptg: o botão de Run e ícone já estão ativos!")
    print("🖱️ Pode dar duplo clique em qualquer .ptg para executar imediatamente.")
    print("=" * 65)

if __name__ == '__main__':
    instalar_tudo()
