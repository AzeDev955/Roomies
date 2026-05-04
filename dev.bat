@echo off
setlocal

cd /d "%~dp0"

if not exist ".env" (
  echo No existe .env en la raiz del proyecto.
  echo Copia .env.example a .env y ajusta HOST_IP, secretos y tokens antes de levantar Docker.
  echo.
  pause
  exit /b 1
)

echo Levantando Roomies con Docker Compose...
echo Backend: http://localhost:3001/api
echo.

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop no esta arrancado o no responde.
  echo Abre Docker Desktop y vuelve a ejecutar .\dev.bat.
  echo.
  pause
  exit /b 1
)

docker compose up --build -d
if errorlevel 1 (
  echo No se pudieron levantar los contenedores.
  echo Revisa la salida anterior de Docker Compose.
  echo.
  pause
  exit /b 1
)

echo.
echo Contenedores levantados. Arrancando Expo local...
echo.

cd frontend
npx expo start --clear
