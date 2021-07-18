FROM node:14 AS build

WORKDIR /app

COPY . .

RUN cd /app && npm i && npm run build

FROM node:14-alpine AS boti

COPY --from=build /app /app

WORKDIR /app

RUN mkdir -p db

ENTRYPOINT [ "npm", "start" ]
