FROM node:14-alpine AS node

ENV NODE_ENV=development

WORKDIR /usr/src

COPY package.json .
COPY yarn.lock .

COPY ./core/package.json ./core/
COPY ./core/yarn.lock ./core/

COPY ./mock-bless/package.json ./mock-bless/
COPY ./mock-bless/yarn.lock ./mock-bless/

RUN yarn install

COPY ./core ./core
COPY ./mock-bless ./mock-bless

COPY tsconfig.base.json .
COPY tsconfig.packages.json .

WORKDIR /usr/src/mock-bless

RUN yarn run tsc -b -f

CMD ["node", "build/index"]
