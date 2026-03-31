FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

# Aplica el schema a la DB y arranca el servidor de desarrollo
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma generate && npx prisma db seed && npm run dev"]
