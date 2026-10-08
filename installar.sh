#!/bin/bash
# Script de instalação completa do portulong-sistema
# Baixa o ícone do GitHub e configura tudo

set -e

REPO_URL="https://github.com/silvio-blip/portulong"
ICONE_URL="$REPO_URL/raw/main/imagens/Portulong.png"
ICONE_LOCAL="/home/silvio/.local/share/icons/hicolor/128x128/apps/portulong.png"

echo "=========================================="
echo "  Instalador portulong-sistema"
echo "=========================================="
echo ""

# 1. Instalar pacote Python
echo "1. Instalando pacote Python..."
pip install portulong-sistema --break-system-packages 2>/dev/null || pip install portulong-sistema --user 2>/dev/null || {
    echo "   Tentando com virtual environment..."
    python3 -m venv /tmp/portulong-venv
    /tmp/portulong-venv/bin/pip install portulong-sistema
}

# 2. Baixar ícone do GitHub
echo "2. Baixando ícone do GitHub..."
mkdir -p "$(dirname "$ICONE_LOCAL")"
if command -v wget &> /dev/null; then
    wget -q -O "$ICONE_LOCAL" "$ICONE_URL"
elif command -v curl &> /dev/null; then
    curl -s -o "$ICONE_LOCAL" "$ICONE_URL"
else
    echo "   ERRO: wget ou curl não encontrado"
    exit 1
fi

if [ -f "$ICONE_LOCAL" ]; then
    echo "   Ícone baixado: $ICONE_LOCAL"
else
    echo "   ERRO: Falha ao baixar ícone"
    exit 1
fi

# 3. Atualizar cache de ícones
echo "3. Atualizando cache de ícones..."
gtk-update-icon-cache ~/.local/share/icons/hicolor/ 2>/dev/null || true

# 4. Configurar tipo MIME para .ptg
echo "4. Configurando tipo MIME para .ptg..."
mkdir -p ~/.local/share/mime/packages
cat > ~/.local/share/mime/packages/application-ptg.xml << 'XEOF'
<?xml version="1.0" encoding="UTF-8"?>
<mime-info type="application/x-ptg">
    <comment>Arquivo portulong</comment>
    <glob pattern="*.ptg"/>
    <icon name="portulong"/>
</mime-info>
XEOF
update-desktop-database ~/.local/share/mime/ 2>/dev/null || true

# 5. Configurar associação de arquivo
echo "5. Configurando associação de arquivo..."
mkdir -p ~/.config
cat > ~/.config/associations << 'AEOF'
application/x-ptg=portulong.desktop
AEOF

# 6. Criar entrada do desktop
echo "6. Criando entrada do desktop..."
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/portulong.desktop << 'DEOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=portulong-sistema
Comment=Editor de arquivos portulong (.ptg)
Exec=portulong-sistema %F
Icon=portulong
Terminal=false
Categories=Development;TextEditor;
MIMETypes=application/x-ptg;
StartupNotify=true
Actions=run;

[Desktop Action run]
Name=Executar
Name[pt-PT]=Executar
Exec=portulong-sistema %F
Icon=media-playback-start
DEOF

# 7. Configurar PATH
echo "7. Configurando PATH..."
SHELL_RC="$HOME/.bashrc"
if [ ! -f "$SHELL_RC" ]; then
    SHELL_RC="$HOME/.profile"
fi

if ! grep -q "$HOME/.local/bin" "$SHELL_RC" 2>/dev/null; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo "   PATH configurado em $SHELL_RC"
fi

# 8. Reiniciar CodeGoes se estiver rodando
echo "8. Verificando CodeGoes..."
if pgrep -x "codegoes" > /dev/null; then
    echo "   CodeGoes está rodando. Reiniciando..."
    pkill -x "codegoes"
    sleep 2
    codegoes &
    echo "   CodeGoes reiniciado!"
else
    echo "   CodeGoes não está rodando."
    echo "   Inicie manualmente: codegoes"
fi

echo ""
echo "=========================================="
echo "  Instalação concluída com sucesso!"
echo "=========================================="
echo ""
echo "Comandos:"
echo "  portulong-sistema arquivo.ptg     # Executa um arquivo .ptg"
echo ""
echo "Para usar agora:"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo "  portulong-sistema exemplo.ptg"
echo ""
echo "O ícone .ptg agora deve aparecer no gerenciador de arquivos!"