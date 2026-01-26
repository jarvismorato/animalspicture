@echo off
echo Atualizando o site...
git add .
git commit -m "Atualizacao automatica"
git push
echo.
echo Tudo pronto! O site foi enviado para o Cloudflare.
pause