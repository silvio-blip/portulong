#!/usr/bin/env bash
# Script para publicar Portulong no PyPI
set -e

echo "🚀 A preparar publicação de Portulong v1.0.28 no PyPI..."

# 1. Instalar ferramentas de build
python -m pip install --upgrade pip build twine

# 2. Limpar builds anteriores
rm -rf dist/ build/ *.egg-info

# 3. Gerar arquivos do pacote (sdist e wheel)
python -m build

# 4. Verificar pacote gerado
twine check dist/*

echo "✅ Pacote v1.0.28 gerado em dist/ com sucesso!"
echo "📤 A enviar para o PyPI..."

# 5. Enviar para o PyPI (solicitará token ou usará TWINE_PASSWORD)
twine upload dist/*

echo "🎉 Publicação concluída com sucesso no PyPI!"
