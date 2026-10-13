# Multi-stage Dockerfile for ResumeIQ Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package
COPY src src
RUN mvn clean package -DskipTests -B

# Stage 2: Lean runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render supplies dynamic $PORT (defaults to 8080 locally)
ENV PORT=8080
EXPOSE 8080

# Run with container-aware memory constraints (Render free tier = 512MB RAM)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Xss512k -Dserver.port=${PORT:-8080} -jar app.jar"]
