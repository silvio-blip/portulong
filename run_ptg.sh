#!/bin/bash
# Script de execução rápida para arquivos .ptg
# Uso: ./run_ptg.sh arquivo.ptg

PROJETO="/home/silvio/Secretária/linguagens pt/portulong"

if [ -z "$1" ]; then
    echo "Uso: ./run_ptg.sh arquivo.ptg"
    exit 1
fi

python3 "$PROJETO/portulong.py" "$1"