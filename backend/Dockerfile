# Build stage
FROM node:12

# Create app directory
WORKDIR /usr/cltp

# Install app dependencies and bundle app src
COPY package.json package-lock.json server.js ./
RUN npm ci --only=prod

EXPOSE 8080
CMD [ "node", "server.js" ]
