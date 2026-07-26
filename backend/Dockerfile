FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw || true

RUN ./mvnw clean package || mvn clean package

EXPOSE 8080

CMD ["java","-jar","target/bismillah-backend-1.0.0.jar"]