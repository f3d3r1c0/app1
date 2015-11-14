@echo off
@set OPTS=-dissolve 40% -gravity NorthEast
@echo starting conversion ...
FOR /R %%i IN (*.png) DO composite %OPTS% ..\images\de.png %%~di\%%~pi\%%~ni%%~xi %%~di\%%~pi\de\%%~ni%%~xi
FOR /R %%i IN (*.png) DO composite %OPTS% ..\images\en.png %%~di\%%~pi\%%~ni%%~xi %%~di\%%~pi\en\%%~ni%%~xi
@echo conversion done
