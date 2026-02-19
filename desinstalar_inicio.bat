@echo off
title Animals Picture - Remover Inicialização Automática
echo ==========================================
echo   Animals Picture - Remover do Inicio
echo ==========================================
echo.

set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

:: Remove o arquivo VBS da pasta Startup
if exist "%STARTUP%\AnimalsPictureServer.vbs" (
    del "%STARTUP%\AnimalsPictureServer.vbs"
    echo [OK] Servidor removido da inicializacao automatica!
) else (
    echo [INFO] Nao estava configurado para iniciar automaticamente.
)

:: Para o servidor se estiver rodando na porta 5000
echo.
echo Parando servidor se estiver rodando...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] Pronto.
echo.
pause
