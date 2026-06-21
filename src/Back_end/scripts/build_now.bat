@echo off
SET JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
SET PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME=%JAVA_HOME%
echo Testing java:
java -version
echo.
echo Running Maven...
maven\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
echo.
echo Exit code: %ERRORLEVEL%
