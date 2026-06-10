#!/bin/bash
# Script para compilar e publicar o pacote Portulong no PyPI

# Parar imediatamente em caso de erro
set -e

echo "🐉 Inicializando processo de publicação do Portulong..."
echo ""

# 1. Verificar dependências necessárias
echo "📦 Verificando se as ferramentas de build estão instaladas..."
python3 -m pip install --upgrade pip build twine hatchling

# 2. Limpar builds anteriores
echo "🧹 Limpando pastas de build anteriores..."
rm -rf dist/ build/ *.egg-info/ src/*.egg-info/

# 3. Compilar o pacote
echo "🏗️  Compilando o pacote Portulong..."
python3 -m build

# 4. Validar o pacote gerado
echo "✅ Validando integridade dos pacotes compilados com twine..."
python3 -m twine check dist/*

# 5. Perguntar se deseja enviar
echo ""
read -p "Deseja fazer o upload para o PyPI real agora? (s/N): " confirmar
if [[ $confirmar =~ ^[Ss]$ ]]; then
    echo "🚀 Fazendo upload para o PyPI..."
    echo "👉 Instrução: Use '__token__' como nome de usuário e seu Token API do PyPI (incluindo o prefixo pypi-) como senha."
    echo ""
    python3 -m twine upload dist/*
    echo "🎉 Publicado com sucesso! Qualquer pessoa agora pode instalar rodando 'pip install portulong'."
else
    echo "⚠️ Upload cancelado. O pacote compilado já está na pasta 'dist/' pronto para o envio manual."
fi
