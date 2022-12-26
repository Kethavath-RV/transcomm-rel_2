FROM node:14-alpine AS node

FROM node AS builder

ENV NODE_ENV=build

WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./datagen/package.json ./datagen/
COPY ./datagen/yarn.lock ./datagen/

RUN yarn install

COPY ./core ./core
COPY ./datagen ./datagen

COPY tsconfig.base.json .
COPY tsconfig.packages.json .

WORKDIR /usr/src/datagen

RUN yarn run prisma generate

RUN yarn run tsc -b -f

RUN yarn run build

FROM node AS production

ENV NODE_ENV=production

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./datagen/package.json ./datagen/
COPY ./datagen/yarn.lock ./datagen/

RUN yarn install

#COPY --from=builder /usr/src/node_modules ./node_modules
COPY --from=builder /usr/src/datagen/dist ./datagen/dist
COPY --from=builder /usr/src/datagen/prisma ./datagen/prisma
COPY --from=builder /usr/src/core/build ./core/build

WORKDIR /usr/src/datagen

RUN yarn install

#regenerate prisma schema
RUN yarn run prisma generate

CMD ["yarn", "run","start:prod"]
