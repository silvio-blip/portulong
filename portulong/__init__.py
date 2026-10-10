"""
Portulong - Linguagem de programação em Português de Portugal para a Web, Servidores, Bots e Bases de Dados.
Ecossistema modular com pacotes especializados (ambiente, base_dados, bots, web, erros).
"""

__version__ = "1.0.27"
__author__ = "Silvio"
__license__ = "MIT"

from .core import Empretador, servir, compilar_arquivo
from .instalador import instalar_tudo, associar_windows, associar_linux
from .ambiente import carregar_ambiente, obter_variavel
from .base_dados import ligar_supabase, BaseDadosPortulong
from .bots import criar_bot_discord, criar_bot_telegram
from .erros import ErroSintaxePortulong, relatar_erro_sintaxe

__all__ = [
    "Empretador",
    "servir",
    "compilar_arquivo",
    "instalar_tudo",
    "associar_windows",
    "associar_linux",
    "carregar_ambiente",
    "obter_variavel",
    "ligar_supabase",
    "BaseDadosPortulong",
    "criar_bot_discord",
    "criar_bot_telegram",
    "ErroSintaxePortulong",
    "relatar_erro_sintaxe",
    "__version__",
]
