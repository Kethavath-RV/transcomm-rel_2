# Production like docker file - we could use later
# Stage 0: compile angular
# FROM node:14 AS build
# RUN mkdir -p /app
# WORKDIR /app
# COPY . .
# RUN yarn install
# RUN yarn build

# # Stage 1: Serve
# FROM nginx:latest
# COPY --from=build /app/dist/transcomm-ui  /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80

FROM node:14 as builder
RUN mkdir -p /app
WORKDIR /app

COPY tsconfig.base.json .
COPY tsconfig.packages.json .
COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/tsconfig.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./transcomm-ui/package.json ./transcomm-ui/
COPY ./transcomm-ui/yarn.lock ./transcomm-ui/
COPY ./transcomm-ui/tsconfig.json ./transcomm-ui/

RUN yarn install

COPY ./core ./core
COPY ./transcomm-ui ./transcomm-ui

WORKDIR /app/transcomm-ui

RUN yarn build

### STAGE 2: Run ###
FROM nginx:1.15.8-alpine


COPY --from=builder /app/transcomm-ui/dist/transcomm-ui /usr/share/nginx/html
COPY --from=builder /app/transcomm-ui/nginx.conf /etc/nginx/conf.d/default.conf

RUN chmod -R 755 /usr/share/nginx/html/assets

EXPOSE 80
