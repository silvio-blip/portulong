#!/usr/bin/env python3
"""Wrapper ptg-atualizar - Atualiza portulong completo"""

import subprocess
import sys
import os
import urllib.request
from pathlib import Path

def run_cmd(cmd):
    """Executa comando silenciosamente"""
    try:
        subprocess.run(cmd, shell=True, check=False, 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except:
        pass

def main():
    print("Atualizando portulong...")
    
    # Atualiza pacote Python
    os.system("pip install --upgrade portulong-sistema --break-system-packages --quiet 2>/dev/null || "
              "pip install --upgrade portulong-sistema --user --quiet 2>/dev/null")
    
    # Atualiza ícone do GitHub
    icone_url = "https://raw.githubusercontent.com/silvio-blip/portulong/main/imagens/Portulong.png"
    icone_destino = Path.home() / ".local/share/icons/hicolor/128x128/apps/portulong.png"
    icone_destino.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        urllib.request.urlretrieve(icone_url, icone_destino)
    except:
        pass
    
    # Atualiza caches
    run_cmd("gtk-update-icon-cache ~/.local/share/icons/hicolor/ 2>/dev/null")
    run_cmd("update-desktop-database ~/.local/share/applications/ 2>/dev/null")
    run_cmd("update-mime-database ~/.local/share/mime 2>/dev/null")
    
    print("Atualizado!")

if __name__ == '__main__':
    main()