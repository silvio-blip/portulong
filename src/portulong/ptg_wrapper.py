#!/usr/bin/env python3
"""Wrapper ptg - CLI simples para portulong"""

import sys
import os
import subprocess
from pathlib import Path

def verificar_configuracao():
    marker = Path.home() / ".config/portulong/configured"
    return marker.exists()

def configurar_automatico():
    print("🔧 Configurando portulong...")
    try:
        from portulong.portulong_installer import main
        main()
    except Exception as e:
        print(f"⚠️ Configuração falhou: {e}")
    marker = Path.home() / ".config/portulong/configured"
    marker.parent.mkdir(parents=True, exist_ok=True)
    marker.write_text("ok")

def mostrar_ajuda():
    print("""
portulong - Linguagem PT-PT para páginas web

COMANDOS:
  ptg arquivo.ptg     Executa arquivo .ptg (abre no browser)
  ptg install         Instala e configura tudo 100%
  ptg update          Atualiza portulong para última versão
  ptg uninstall       Remove portulong do sistema
  ptg version         Mostra versão atual
  ptg config          Configura sistema (ícones, MIME, VS Code)
  ptg help            Mostra esta ajuda

EXEMPLOS:
  ptg exemplos/exemplo.ptg
  ptg install
  ptg update
  ptg version
""")

def mostrar_versao():
    try:
        from portulong import __version__
        print(f"portulong {__version__}")
    except:
        print("portulong 1.0.15")

def instalar_sistema():
    print("📦 Instalando e configurando portulong...")
    configurar_automatico()
    print("✅ Instalação completa!")

def atualizar():
    print("🔄 Atualizando portulong...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "portulong-sistema"], check=True)
        print("✅ Atualizado com sucesso!")
    except subprocess.CalledProcessError:
        print("❌ Falha ao atualizar")

def desinstalar():
    print("🗑️ Removendo portulong...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "portulong-sistema"], check=True)
        # Remover configs
        for path in [
            Path.home() / ".config/portulong",
            Path.home() / ".local/share/icons/hicolor/128x128/apps/portulong.png",
            Path.home() / ".local/share/applications/portulong.desktop",
            Path.home() / ".local/share/mime/packages/application-ptg.xml",
        ]:
            if path.exists():
                path.unlink()
        print("✅ Removido completamente!")
    except subprocess.CalledProcessError:
        print("❌ Falha ao remover")

def configurar_sistema():
    print("⚙️ Configurando sistema 100%...")
    configurar_automatico()
    print("✅ Sistema configurado!")

def main():
    os.environ['PATH'] = os.path.expanduser('~/.local/bin') + ':' + os.environ.get('PATH', '')
    
    if len(sys.argv) < 2:
        mostrar_ajuda()
        return
    
    comando = sys.argv[1]
    
    # Comandos que não precisam de arquivo
    if comando in ('help', '-h', '--help'):
        mostrar_ajuda()
        return
    elif comando == 'version':
        mostrar_versao()
        return
    elif comando == 'install':
        instalar_sistema()
        return
    elif comando == 'update':
        atualizar()
        return
    elif comando == 'uninstall':
        desinstalar()
        return
    elif comando == 'config':
        configurar_sistema()
        return
    
    # Se não é comando conhecido, assume que é arquivo .ptg
    arquivo = sys.argv[1]
    if not arquivo.endswith('.ptg'):
        print(f"❌ Arquivo deve ser .ptg: {arquivo}")
        mostrar_ajuda()
        return
    
    if not Path(arquivo).exists():
        print(f"❌ Arquivo não encontrado: {arquivo}")
        return
    
    # Auto-config se primeira vez
    if not verificar_configuracao():
        configurar_automatico()
    
    # Executa o arquivo
    from portulong.__main__ import main as portulong_main
    sys.argv = [sys.argv[0]] + sys.argv[1:]
    portulong_main()

if __name__ == '__main__':
    main()