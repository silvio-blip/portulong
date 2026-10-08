#!/usr/bin/env python3
"""Ponto de entrada para o portulong"""

import sys
import os

# Adicionar o diretório do pacote ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from portulong.core import main

if __name__ == '__main__':
    main()