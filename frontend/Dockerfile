# Build stage
FROM node:12 AS builder

# Create app directory
WORKDIR /usr/cltp

# Install
RUN apt-get update && apt-get install -y nano vim && apt-get clean

# Install app dependencies
# COPY package.json package-lock.json tsconfig.json tsconfig.spec.json tsconfig.app.json .eslintrc.json angular.json .browserslistrc ./
COPY package.json package-lock.json tsconfig.json tsconfig.spec.json tsconfig.app.json angular.json .browserslistrc ./
RUN npm i -g @angular/cli && npm ci

# Bundle app source
COPY src src

# Build app
RUN ng build --prod

# Final stage
FROM nginx:mainline-alpine

# Copy the files from the build stage to the nginx public folder
COPY --from=builder /usr/cltp/dist/cltp /usr/share/nginx/html

# Copy the nginx config file
COPY nginx.conf /etc/nginx/conf.d/default.conf
