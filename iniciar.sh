#!/bin/bash
# Script de inicio rapido do portulong

DIR="/home/silvio/Secretária/linguagens pt/portulong"

echo "=========================================="
echo "  portulong - Empretador de Paginas Web"
echo "=========================================="
echo ""

# Verificar se o Python esta instalado
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python3 nao encontrado. Instale o Python 3.6+."
    exit 1
fi

# Verificar se o arquivo portulong.py existe
if [ ! -f "$DIR/portulong.py" ]; then
    echo "ERRO: portulong.py nao encontrado em $DIR"
    exit 1
fi

# Verificar se foi passado um arquivo
if [ -z "$1" ]; then
    echo "Uso: ./iniciar.sh arquivo.ptg"
    echo ""
    echo "Exemplos disponiveis:"
    ls "$DIR/exemplos/"*.ptg 2>/dev/null
    exit 1
fi

ARQUIVO="$1"

# Verificar se o arquivo existe
if [ ! -f "$ARQUIVO" ]; then
    echo "ERRO: Arquivo nao encontrado: $ARQUIVO"
    exit 1
fi

# Verificar extensao
if [[ "$ARQUIVO" != *.ptg ]]; then
    echo "ERRO: O arquivo deve ter extensao .ptg"
    exit 1
fi

echo "Empretando: $ARQUIVO"
echo "Pagina sera aberta no navegador..."
echo ""

# Empretar
cd "$DIR"
python3 portulong.py "$ARQUIVO"

