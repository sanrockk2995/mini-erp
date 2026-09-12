# Multi-stage Dockerfile for Spring Boot 3 Backend
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package application jar (skip tests for container packaging)
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S erpgroup && adduser -S erpuser -G erpgroup

# Copy compiled jar from build stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership
RUN chown -R erpuser:erpgroup /app
USER erpuser

# JVM tuning & Environment variables
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
ENV SPRING_PROFILES_ACTIVE="prod"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
