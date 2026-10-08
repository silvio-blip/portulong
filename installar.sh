#!/bin/bash
# Script de instalação completa do portulong

echo "=========================================="
echo "  Instalador portulong"
echo "=========================================="
echo ""

PROJETO="/home/silvio/Secretária/linguagens pt/portulong"

# 1. Instalar dependências Python
echo "1. Instalando dependências Python..."
pip install -e "$PROJETO" --break-system-packages 2>/dev/null || pip install -e "$PROJETO" --user 2>/dev/null || {
    echo "   Tentando com virtual environment..."
    python3 -m venv /tmp/portulong-venv
    /tmp/portulong-venv/bin/pip install -e "$PROJETO"
}

# 2. Configurar PATH
echo "2. Configurando PATH..."
SHELL_RC="$HOME/.bashrc"
if [ ! -f "$SHELL_RC" ]; then
    SHELL_RC="$HOME/.profile"
fi

if ! grep -q "$HOME/.local/bin" "$SHELL_RC" 2>/dev/null; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo "   PATH configurado em $SHELL_RC"
fi

# 3. Configurar ícone para arquivos .ptg
echo "3. Configurando ícone para arquivos .ptg..."
bash "$PROJETO/configurar_icone.sh"

# 4. Configurar botão Run no editor
echo "4. Configurando botão Run..."
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/portulong.desktop << 'DEOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=portulong
Comment=Editor de arquivos portulong (.ptg)
Exec=codegoes %F
Icon=portulong
Terminal=false
Categories=Development;TextEditor;
MIMETypes=application/x-ptg;
DEOF

echo ""
echo "=========================================="
echo "  Instalação concluída com sucesso!"
echo "=========================================="
echo ""
echo "Comandos:"
echo "  portulong arquivo.ptg     # Executa um arquivo .ptg"
echo ""
echo "Para usar agora:"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "  portulong exemplo.ptg"