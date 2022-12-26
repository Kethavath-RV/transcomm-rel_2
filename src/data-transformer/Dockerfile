FROM node:14-alpine AS node

FROM node AS builder

ENV NODE_ENV=build

WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./data-transformer/package.json ./data-transformer/
COPY ./data-transformer/yarn.lock ./data-transformer/

RUN yarn install

COPY ./core ./core
COPY ./data-transformer ./data-transformer

COPY tsconfig.base.json .
COPY tsconfig.packages.json .

WORKDIR /usr/src/data-transformer

RUN yarn run tsc -b -f

RUN yarn build

FROM node AS final

ENV NODE_ENV=production

RUN npm i -g pm2
#
## Set CWD
WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./data-transformer/package.json ./data-transformer/
COPY ./data-transformer/yarn.lock ./data-transformer/

RUN yarn install

COPY ./core ./core
COPY ./data-transformer ./data-transformer

COPY --from=builder /usr/src/data-transformer/build ./data-transformer/build
COPY --from=builder /usr/src/core/build ./core/build

WORKDIR /usr/src/data-transformer

ENTRYPOINT ["pm2-runtime", "./process.yml"]