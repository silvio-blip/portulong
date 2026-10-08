#!/usr/bin/env python3
"""Wrapper ptg - Executa arquivos .ptg"""

import sys
import os

# Adicionar PATH do usuário
os.environ['PATH'] = os.path.expanduser('~/.local/bin') + ':' + os.environ.get('PATH', '')

from portulong.__main__ import main

if __name__ == '__main__':
    main()