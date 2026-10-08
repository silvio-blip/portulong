#!/bin/bash
# Script para configurar o botão Run no CodeGoes para arquivos .ptg

PROJETO="/home/silvio/Secretária/linguagens pt/portulong"
ICONE="$PROJETO/imagens/Portulong.png"

echo "=========================================="
echo "  Configurador de Botão Run - portulong"
echo "=========================================="
echo ""

# 1. Configurar tipo MIME
echo "1. Configurando tipo MIME para .ptg..."
mkdir -p ~/.local/share/mime/packages
cat > ~/.local/share/mime/packages/application-ptg.xml << 'XEOF'
<?xml version="1.0" encoding="UTF-8"?>
<mime-info type="application/x-ptg">
    <comment>Arquivo portulong</comment>
    <glob pattern="*.ptg"/>
</mime-info>
XEOF
update-desktop-database ~/.local/share/mime/ 2>/dev/null

# 2. Configurar associação de arquivo
echo "2. Configurando associação de arquivo..."
mkdir -p ~/.config
cat > ~/.config/associations << 'AEOF'
application/x-ptg=portulong.desktop
AEOF

# 3. Criar entrada do desktop com botão Run
echo "3. Criando entrada do desktop com botão Run..."
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
StartupNotify=true
MIMETypes=application/x-ptg;
Actions=run;

[Desktop Action run]
Name=Run
Name[pt-PT]=Executar
Exec=python3 /home/silvio/Secretária/linguagens pt/portulong/portulong.py %F
Icon=media-playback-start
DEOF

# 4. Configurar teclado atalho para Run (Ctrl+F5)
echo "4. Configurando atalho de teclado (Ctrl+F5)..."
mkdir -p ~/.config/kglobalshortcutrc
cat > ~/.config/kglobalshortcutrc/portulong << 'KEOF'

[portulong]
Run=Ctrl+F5,none,Executar o arquivo .ptg
KEOF

# 5. Copiar ícone para o tema
echo "5. Instalando ícone..."
mkdir -p ~/.local/share/icons/hicolor/128x128/apps/
cp "$ICONE" ~/.local/share/icons/hicolor/128x128/apps/portulong.png
gtk-update-icon-cache ~/.local/share/icons/hicolor/128x128/ 2>/dev/null

# 6. Reiniciar CodeGoes se estiver rodando
echo "6. Verificando CodeGoes..."
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
echo "  Configuração concluída com sucesso!"
echo "=========================================="
echo ""
echo "Botão Run configurado:"
echo "  - Ícone: $ICONE"
echo "  - Atalho: Ctrl+F5"
echo "  - Comando: python3 $PROJETO/portulong.py %F"
echo ""
echo "Próximos passos:"
echo "1. Abra o CodeGoes"
echo "2. Crie ou abra um arquivo .ptg"
echo "3. Clique no botão Run ou use Ctrl+F5"