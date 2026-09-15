# Multi-stage Dockerfile for Spring Boot 3 Backend
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src ./src

# Package application jar (skip tests for container packaging)
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl and wget for health checks
RUN apk add --no-cache curl wget

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
ENV SERVER_PORT=7070

EXPOSE 7070

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget -q --spider http://localhost:7070/v3/api-docs || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
