#!/bin/bash
# Script para configurar e fazer push do portulong no GitHub

PROJETO="/home/silvio/Secretária/linguagens pt/portulong"
REPO_URL="https://github.com/silvio-blip/portulong.git"

echo "=========================================="
echo "  Configurador do Repositório GitHub"
echo "=========================================="
echo ""

cd "$PROJETO"

# Verificar se Git está configurado
if ! git config user.email > /dev/null 2>&1; then
    echo "Configurando Git..."
    git config user.email "silviok4000@gmail.com"
    git config user.name "silvio-blip"
fi

# Adicionar remote
echo "Configurando remote..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# Verificar se há commits
if ! git rev-parse HEAD > /dev/null 2>&1; then
    echo "Fazendo commit inicial..."
    git add -A
    git commit -m "Portulong: linguagem de programação em PT-PT para criar páginas web"
fi

echo ""
echo "=========================================="
echo "  INSTRUCOES PARA FAZER PUSH"
echo "=========================================="
echo ""
echo "Opcao 1: Usar token de acesso (recomendado)"
echo "------------------------------------------"
echo "1. Acesse: https://github.com/settings/tokens"
echo "2. Clique em 'Generate new token'"
echo "3. Copie o token gerado"
echo "4. Execute:"
echo ""
echo "   git remote set-url origin https://<TOKEN>@github.com/silvio-blip/portulong.git"
echo "   git push -u origin master"
echo ""
echo "Opcao 2: Usar SSH"
echo "----------------"
echo "1. Gere uma SSH key:"
echo "   ssh-keygen -t ed25519 -C 'silvio@example.com'"
echo ""
echo "2. Adicione a SSH key em: https://github.com/settings/keys"
echo ""
echo "3. Execute:"
echo "   git remote set-url origin git@github.com:silvio-blip/portulong.git"
echo "   git push -u origin master"
echo ""
echo "Opcao 3: Usar GitHub CLI"
echo "------------------------"
echo "1. Instale: https://cli.github.com/"
echo "2. Execute: gh auth login"
echo "3. Execute:"
echo "   gh repo create silvio-blip/portulong --public --source . --push"
echo ""
echo "=========================================="
echo "  Estrutura do Repositorio"
echo "=========================================="
echo ""
echo "Após o push, o repositório terá:"
echo "  - setup.py (pacote PyPI)"
echo "  - src/portulong/ (código fonte)"
echo "  - exemplos/ (exemplos)"
echo "  - imagens/ (icone)"
echo "  - README.md (documentacao)"
echo "  - LICENSE (licenca)"