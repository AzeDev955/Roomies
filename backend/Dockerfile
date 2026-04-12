FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Railway usa esta imagen compilada; npm start aplica el schema y arranca dist/index.js.
CMD ["npm", "start"]
