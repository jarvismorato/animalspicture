@echo off
title Animals Picture - Instalar Inicialização Automática
echo ==========================================
echo   Animals Picture - Instalar no Inicio
echo ==========================================
echo.

:: Descobre o caminho do pythonw.exe
for /f "tokens=*" %%i in ('python -c "import sys,os; print(os.path.join(os.path.dirname(sys.executable),'pythonw.exe'))"') do set PYTHONW=%%i

:: Caminho do servidor
set SERVER=%~dp0server.py

:: Pasta de Startup do Windows (sem precisar de admin)
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo Criando atalho de inicializacao automatica...

:: Cria um VBScript que inicia o servidor sem janela
(
    echo Set objShell = CreateObject("WScript.Shell"^)
    echo objShell.Run """%PYTHONW%"" ""%SERVER%"" --no-browser", 0, False
) > "%STARTUP%\AnimalsPictureServer.vbs"

if exist "%STARTUP%\AnimalsPictureServer.vbs" (
    echo.
    echo [OK] Servidor configurado para iniciar automaticamente!
    echo      Vai rodar em segundo plano ao ligar/logar no Windows.
    echo      Sem janela, sem precisar fazer nada.
    echo.
    echo Iniciando agora em segundo plano...
    start "" /B "%PYTHONW%" "%SERVER%" --no-browser
    echo [OK] Servidor rodando! Acesse: http://localhost:5000
) else (
    echo [ERRO] Nao foi possivel criar o atalho de startup.
)

echo.
pause
