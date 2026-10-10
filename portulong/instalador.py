"""
Instalador Automático de Dependências Portulong
Permite instalar pacotes opcionais (Discord, Supabase, etc.) com um único comando.
"""

import sys
import subprocess

def instalar_pacote(nome_pacote, nome_legivel=None):
    """Executa pip install para o pacote especificado de forma transparente."""
    nome_legivel = nome_legivel or nome_pacote
    print(f"📦 A preparar instalação de {nome_legivel} via pip...")
    comando = [sys.executable, "-m", "pip", "install", nome_pacote]
    try:
        resultado = subprocess.run(comando, check=True, text=True, capture_output=True)
        print(f"✅ {nome_legivel} instalado com sucesso no seu ambiente!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar {nome_legivel}: {e.stderr or e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def instalar_discord():
    """Instala a biblioteca oficial discord.py automaticamente."""
    return instalar_pacote("discord.py>=2.0.0", "Discord.py")

def instalar_supabase():
    """Instala dependências de conexão Supabase."""
    return instalar_pacote("supabase", "Supabase Python Client")

def instalar_tudo():
    """Instala todas as extensões do ecossistema Portulong."""
    print("🚀 A instalar ecossistema completo Portulong (Discord, Supabase, .env)...")
    s1 = instalar_discord()
    s2 = instalar_supabase()
    return s1 and s2

def instalar_dependencias():
    return instalar_tudo()
