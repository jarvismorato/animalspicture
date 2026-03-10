#!/bin/bash
echo "======================================"
echo " Atualizando o Animals Picture... "
echo "======================================"

echo "Salvando as mudanças..."
git add .
git commit -m "Nova UI 3-colunas e Design Premium"

echo "Enviando para o GitHub..."
git push origin main

echo ""
echo "Tudo pronto! O site foi atualizado com as novas mudanças."
