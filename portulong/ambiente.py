#!/usr/bin/env python3
"""
Portulong Ambiente (.env) - Módulo para carregar variáveis de ambiente em Português.
"""

import os
from pathlib import Path

def carregar_ambiente(caminho=".env"):
    """Carrega as variáveis de ambiente de um arquivo .env"""
    env_path = Path(caminho)
    if not env_path.exists():
        return False
    
    for linha in env_path.read_text(encoding='utf-8').splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#"):
            continue
        if "=" in linha:
            chave, valor = linha.split("=", 1)
            chave = chave.strip()
            valor = valor.strip().strip('"').strip("'")
            os.environ[chave] = valor
    return True

def obter_variavel(chave, padrao=None):
    """Obtém uma variável de ambiente com valor padrão opcional"""
    return os.environ.get(chave, padrao)
