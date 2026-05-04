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

set "ROOMIES_HOST_IP="
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  if /I "%%A"=="HOST_IP" set "ROOMIES_HOST_IP=%%B"
)

set "ROOMIES_API_URL=http://localhost:3001/api"
if defined ROOMIES_HOST_IP (
  if not "%ROOMIES_HOST_IP%"=="192.168.1.X" set "ROOMIES_API_URL=http://%ROOMIES_HOST_IP%:3001/api"
)

echo Levantando Roomies con Docker Compose...
echo Backend: http://localhost:3001/api
echo API Expo: %ROOMIES_API_URL%
echo.

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop no esta arrancado o no responde.
  echo Abre Docker Desktop y vuelve a ejecutar .\dev.bat.
  echo.
  pause
  exit /b 1
)

docker compose up --build -d --force-recreate
if errorlevel 1 (
  echo No se pudieron levantar los contenedores.
  echo Revisa la salida anterior de Docker Compose.
  echo.
  pause
  exit /b 1
)

echo.
echo Esperando a que el backend responda...
for /l %%I in (1,1,30) do (
  powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing http://localhost:3001/ping -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
  if not errorlevel 1 goto backend_ready
  timeout /t 2 >nul
)

echo El backend no respondio en http://localhost:3001/ping.
echo Revisa los logs con: docker compose logs backend --tail=120
echo.
pause
exit /b 1

:backend_ready
echo Backend listo. La BD se ha reiniciado y el seed se ha ejecutado durante el arranque.

echo.
echo Contenedores levantados. Arrancando Expo local...
echo.

cd frontend
set "EXPO_PUBLIC_API_URL=%ROOMIES_API_URL%"
npx expo start --clear
