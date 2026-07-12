@echo off
set "CURRENT_DIR=%~sdp0"
cd /d "%CURRENT_DIR%"
echo Running tests from short path: %CURRENT_DIR%
java -classpath gradle\wrapper\gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain test --tests com.luxeway.security.VehicleWorkflowIntegrationTest
