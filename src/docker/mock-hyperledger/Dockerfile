FROM node:14-alpine AS node

FROM node AS development

ENV NODE_ENV=development

WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./mock-hyperledger/package.json ./mock-hyperledger/
COPY ./mock-hyperledger/yarn.lock ./mock-hyperledger/

RUN yarn install

COPY ./core ./core
COPY ./mock-hyperledger ./mock-hyperledger

COPY tsconfig.base.json .
COPY tsconfig.packages.json .

WORKDIR /usr/src/mock-hyperledger

RUN yarn run tsc -b -f

CMD ["yarn", "start:watch"]
