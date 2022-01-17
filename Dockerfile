FROM node:17
WORKDIR /app
RUN npm install --global --force yarn
RUN npm install --global sharp
COPY . .
RUN yarn install
RUN yarn build
CMD ["yarn", "start"]
