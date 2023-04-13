@echo off
echo Checking if Node.js is installed...

where /q node
if %errorlevel% neq 0 (
  echo Node.js not found. Downloading and installing Node.js...
  powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v18.16.0/node-v18.16.0-x64.msi -OutFile node-installer.msi"
  msiexec /i node-installer.msi /qb
  echo Node.js installed successfully.
  del node-installer.msi
) else (
  echo Node.js is already installed.
)

echo Setting up the Node.js project...
call npm install

IF NOT EXIST .env.local (
  copy .env.local.example .env.local
  echo The `.env.local` file has been created.
  echo To use openAI services, You need to fill in your personal API_KEY in the `.env.local` file. 
  echo For details, please refer to the tutorial: https://github.com/hku/aigc-webui/blob/main/README.md
) 

echo Starting AIGC-webui...
echo After the server started, open the link http://localhost:3000
call npm run dev


