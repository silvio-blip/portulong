"""
Portulong - Linguagem de programação em Português de Portugal para a Web.
Permite criar páginas, aplicações completas e servidores com sintaxe 100% em português.
"""

__version__ = "1.0.26"
__author__ = "Silvio"
__license__ = "MIT"

from .core import Empretador, servir, compilar_arquivo
from .instalador import instalar_tudo, associar_windows, associar_linux

__all__ = [
    "Empretador",
    "servir",
    "compilar_arquivo",
    "instalar_tudo",
    "associar_windows",
    "associar_linux",
    "__version__",
]
