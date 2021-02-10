FROM node:15.8.0-alpine3.10

RUN mkdir -p /usr/src/app
COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
WORKDIR /usr/src/app
RUN yarn
ADD . /usr/src/app
RUN yarn build

CMD ["yarn", "start"];