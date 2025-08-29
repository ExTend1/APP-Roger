@echo off
echo Generando Android App Bundle (.aab)...
echo.

REM Limpiar build anterior
echo Limpiando build anterior...
gradlew clean

REM Generar AAB
echo Generando AAB...
gradlew bundleRelease

echo.
echo Build completado!
echo El archivo .aab se encuentra en: app/build/outputs/bundle/release/
pause
