@echo off
title Animals Picture - Servidor Local
echo ==========================================
echo   Animals Picture - Iniciando servidor...
echo ==========================================
echo.

:: Instala dependencias se necessario
pip install flask flask-cors --quiet

:: Inicia o servidor
python server.py

pause
