#!/usr/bin/env python3
"""
Script de execução rápida para arquivos .ptg
Uso: python run_ptg.py arquivo.ptg
"""

import sys
import os

# Adicionar o diretório do portulong ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from portulong import main

if __name__ == '__main__':
    main()