@echo off
set "PATH=C:\Users\Light\.gemini\antigravity\brain\04f8c08b-9c6c-4bc1-a9e1-e9456aae51a8\scratch\mingit\cmd;C:\Users\Light\.gemini\antigravity\brain\04f8c08b-9c6c-4bc1-a9e1-e9456aae51a8\scratch\gcm;%PATH%"
cd /d "D:\Light\Inventoty AI Light"

git.exe add -A
git.exe -c user.name="Lighting6647" -c user.email="157086701+Lighting6647@users.noreply.github.com" commit -m "fix: update for vercel"
git.exe push origin main

echo.
echo ==============================================
echo Done! Please check Vercel dashboard.
echo ==============================================
pause
