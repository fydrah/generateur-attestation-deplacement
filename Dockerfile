FROM node:13-slim

ENV PORT=8080
USER node
COPY . /home/node/app
WORKDIR /home/node/app
RUN yarn install && \
    yarn run build
EXPOSE $PORT
CMD ["/usr/local/bin/yarn", "run", "start"]
