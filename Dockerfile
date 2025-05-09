FROM eclipse-temurin:17-jdk

# Встановлення Maven
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean

# Копіюємо весь проєкт
COPY . /app
WORKDIR /app

FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


FROM openjdk:17-jdk-slim

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
