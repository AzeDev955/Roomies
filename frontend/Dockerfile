FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Metro bundler (Expo)
EXPOSE 8080

CMD ["npx", "expo", "start", "--host", "lan", "--port", "8080"]
