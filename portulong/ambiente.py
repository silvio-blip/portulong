"""
Módulo Ambiente Portulong (.env)
100% em Português de Portugal para carregar e gerir variáveis de ambiente.
"""

import os
import sys

def carregar_ambiente(caminho=".env"):
    """Carrega variáveis de um ficheiro .env para o ambiente de execução."""
    if not os.path.exists(caminho):
        return False
    try:
        with open(caminho, "r", encoding="utf-8") as f:
            for linha in f:
                linha = linha.strip()
                if not linha or linha.startswith("#"):
                    continue
                if "=" in linha:
                    chave, valor = linha.split("=", 1)
                    chave = chave.strip()
                    valor = valor.strip().strip('"\'')
                    os.environ[chave] = valor
        return True
    except Exception as e:
        print(f"Erro ao carregar .env: {e}")
        return False

def obter_ambiente(chave, padrao=None):
    """Obtém o valor de uma variável de ambiente."""
    return os.environ.get(chave, padrao)

def obter_variavel(chave, padrao=None):
    """Alias em português para obter uma variável."""
    return os.environ.get(chave, padrao)

def definir_ambiente(chave, valor):
    """Define uma variável de ambiente em tempo de execução."""
    os.environ[chave] = str(valor)

def verificar_ambiente():
    """Verifica se o interpretador Python 3 está ativo."""
    return sys.version_info.major >= 3

# Aliases em português
carregar_env = carregar_ambiente
obter = obter_ambiente
definir = definir_ambiente
