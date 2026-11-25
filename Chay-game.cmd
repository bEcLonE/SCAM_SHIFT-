@echo off
setlocal
cd /d "%~dp0"
set "SCAM_SHIFT_NODE=node.exe"
where node.exe >nul 2>nul
if errorlevel 1 set "SCAM_SHIFT_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "node_modules\vite\bin\vite.js" (
    echo Chua co Vite. Hay cai cac goi du an truoc.
    exit /b 1
)
"%SCAM_SHIFT_NODE%" "node_modules\vite\bin\vite.js" preview --host 127.0.0.1 --port 5173 %*

