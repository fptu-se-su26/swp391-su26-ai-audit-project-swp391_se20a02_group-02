# Stage 1: Build the Spring Boot application using Gradle
FROM gradle:8.7-jdk17 AS build
WORKDIR /app

# Copy all source files
COPY --chown=gradle:gradle . .

# Build the executable bootJar and exclude tests for faster build
RUN gradle bootJar -x test --no-daemon

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
