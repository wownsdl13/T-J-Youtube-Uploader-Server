FROM --platform=linux/amd64 node:latest

WORKDIR /app

COPY package*.json ./

COPY . .


RUN npm install
RUN npm run build

EXPOSE 3003

CMD [ "node", "--max-old-space-size=4096", "dist/main" ]
