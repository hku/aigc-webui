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

echo Starting AIGC-webui...
echo After the server started, open the link http://localhost:3000
echo enjoy!
call npm run dev
