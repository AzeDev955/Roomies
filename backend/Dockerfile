FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

# Aplica el schema a la DB y arranca el servidor de desarrollo
# Si la variable RESET_DB es "true", formatea la BD y ejecuta el seed. Si no, solo actualiza el esquema.
CMD ["sh", "-c", "if [ \"$RESET_DB\" = \"true\" ]; then until npx prisma db push --force-reset; do echo 'DB not ready, retrying...'; sleep 3; done && npx prisma db seed; else until npx prisma db push --accept-data-loss; do echo 'DB not ready, retrying...'; sleep 3; done; fi && npm run dev"]
