@echo off
:: Script para compilar e publicar o pacote Portulong no PyPI no Windows
title Publicador Portulong PyPI

echo 🐉 Inicializando processo de publicacao do Portulong...
echo.

:: 1. Verificar ferramentas de build
echo 📦 Verificando dependencias de empacotamento...
python -m pip install --upgrade pip build twine hatchling
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao instalar dependencias. Verifique se o Python esta no PATH do Windows.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Limpar builds anteriores
echo 🧹 Limpando pastas de build antigas...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
if exist src\portulong.egg-info rmdir /s /q src\portulong.egg-info

:: 3. Compilar o pacote
echo 🏗️ Compilando o pacote Portulong...
python -m build
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha na compilacao do pacote.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Validar com Twine
echo ✅ Validando integridade dos pacotes...
python -m twine check dist/*

echo.
set /p confirmar="Deseja fazer o upload para o PyPI real agora? (s/N): "
if /i "%confirmar%"=="S" (
    echo 🚀 Fazendo upload para o PyPI...
    echo 👉 Instrucao: Use "__token__" como nome de usuario e seu Token API do PyPI ^(incluindo o prefixo pypi-^) como senha.
    echo.
    python -m twine upload dist/*
    echo 🎉 Publicado com sucesso! Qualquer pessoa agora pode instalar rodando 'pip install portulong.ptg'.
) else (
    echo ⚠️ Upload cancelado. O pacote compilado esta na pasta 'dist\' pronto para envio manual.
)
pause
