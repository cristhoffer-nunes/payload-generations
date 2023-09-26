FROM node:latest

WORKDIR /app

COPY package*.json .

RUN yarn install

COPY . .

RUN yarn build

ENV URL=${URL}
ENV APP_KEY=${APP_KEY}
ENV PORT=${PORT}

EXPOSE $PORT

CMD ["yarn", "start:prod"]
