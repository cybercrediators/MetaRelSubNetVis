FROM node:latest as build

RUN mkdir -p /metarel-app
WORKDIR /metarel-app
COPY . /metarel-app
RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=build /metarel-app/dist/meta /usr/share/nginx/html

EXPOSE 80
