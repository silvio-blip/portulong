#!/usr/bin/env python3
"""Wrapper ptg - Executa arquivos .ptg com auto-configuração"""

import sys
import os
import subprocess
from pathlib import Path

def verificar_configuracao():
    """Verifica se já foi configurado"""
    marker = Path.home() / ".config/portulong/configured"
    return marker.exists()

def configurar_automatico():
    """Executa configuração automática"""
    print("🔧 Primeira execução - configurando portulong...")
    try:
        from portulong.portulong_installer import main
        main()
    except Exception as e:
        print(f"⚠️ Configuração falhou: {e}")
    
    # Criar marker
    marker = Path.home() / ".config/portulong/configured"
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.write_text("ok")

def main():
    # Adicionar PATH do usuário
    os.environ['PATH'] = os.path.expanduser('~/.local/bin') + ':' + os.environ.get('PATH', '')
    
    # Auto-configuração na primeira execução
    if not verificar_configuracao():
        configurar_automatico()
    
    from portulong.__main__ import main as portulong_main
    portulong_main()

if __name__ == '__main__':
    main()