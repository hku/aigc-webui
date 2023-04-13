#!/bin/bash

echo "Checking if Node.js is installed..."

if ! command -v node &> /dev/null; then
  echo "Node.js not found. Downloading and installing Node.js..."
  
  if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew update
  brew install node
  brew doctor
  brew upgrade node
  brew link --overwrite node
  echo "Node.js installed successfully."
else
  echo "Node.js is already installed."
fi

echo
echo "Setting up the Node.js project..."
npm install

if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "The .env.local file has been created."
  echo "To use openAI services, You need to fill in your personal API_KEY in the `.env.local` file". 
  echo "For details, please refer to the tutorial: https://github.com/hku/aigc-webui/blob/main/README.md"
fi

echo "Starting AIGC webui..."
echo "After the server started, open the link http://localhost:3000"
npm run dev
