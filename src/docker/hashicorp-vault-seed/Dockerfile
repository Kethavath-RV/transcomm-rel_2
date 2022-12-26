FROM node:14-alpine AS node

COPY ./docker/hashicorp-vault-seed/seed-hashicorp-vault.js .

RUN yarn add hashi-vault-js

RUN yarn add axios

COPY mock-hashicorp-secrets.json .

CMD node seed-hashicorp-vault.js