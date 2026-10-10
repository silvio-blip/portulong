import os
import sys

def verificar_ambiente():
    """Verifica se o ambiente Python está configurado corretamente para o Portulong."""
    versao = sys.version_info
    if versao.major < 3:
        print("Erro: Portulong requer Python 3 ou superior.")
        sys.exit(1)
    return True
