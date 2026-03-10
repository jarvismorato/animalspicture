#!/bin/bash
# Script de Instalação e Execução para Ubuntu/Linux
# Torne este arquivo executável: chmod +x setup.sh
# Execute: ./setup.sh

echo "======================================"
echo " Instalando o Animals Picture V23..."
echo "======================================"

# Verifica se o Python 3 e o venv estão instalados
if ! command -v python3 &> /dev/null; then
    echo "Python3 não encontrado. Instalando..."
    sudo apt update
    sudo apt install -y python3 python3-venv python3-pip
fi

if ! dpkg -s python3-venv &> /dev/null; then
     echo "Pacote python3-venv será instalado..."
     sudo apt update
     sudo apt install -y python3-venv
fi

# Cria o ambiente virtual
if [ ! -d ".venv" ]; then
    echo "Criando ambiente virtual (.venv)..."
    python3 -m venv .venv
fi

# Ativa o ambiente virtual
source .venv/bin/activate

# Instala as dependências
echo "Instalando dependências (Flask, Gunicorn...)"
pip install -r requirements.txt

# Inicia o servidor
echo "Iniciando o servidor local..."
python3 server.py
