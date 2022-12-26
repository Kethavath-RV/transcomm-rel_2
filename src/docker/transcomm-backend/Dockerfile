FROM node:14-alpine AS node

FROM node AS builder

ENV NODE_ENV=build

WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./transcomm-backend/package.json ./transcomm-backend/
COPY ./transcomm-backend/yarn.lock ./transcomm-backend/

RUN yarn install

COPY ./core ./core
COPY ./transcomm-backend ./transcomm-backend

COPY tsconfig.base.json .
COPY tsconfig.packages.json .

WORKDIR /usr/src/transcomm-backend

RUN yarn run prisma generate
##This is done to ensure the cache is used for this build step
#COPY ./transcomm-backend/package.json ./
#COPY ./transcomm-backend/yarn.lock ./
#
#RUN yarn install

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

COPY ./transcomm-backend/package.json ./transcomm-backend/
COPY ./transcomm-backend/yarn.lock ./transcomm-backend/

RUN yarn install

COPY --from=builder /usr/src/transcomm-backend/dist ./transcomm-backend/dist
COPY --from=builder /usr/src/transcomm-backend/prisma ./transcomm-backend/prisma
COPY --from=builder /usr/src/core/build ./core/build

WORKDIR /usr/src/transcomm-backend

# This has to be done for bcrypt to still work
RUN apk add --no-cache make gcc g++ python3
RUN yarn install
RUN npm rebuild bcrypt --build-from-source

#regenerate prisma schema
RUN yarn run prisma generate

CMD ["yarn", "run","start:prod"]
