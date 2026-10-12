# Stage 1: Build the React application
FROM node:20-slim AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# This ARG allows Jenkins to inject the build number during Phase 5
ARG BUILD_NUMBER=local
ENV VITE_BUILD_NUMBER=$BUILD_NUMBER

RUN npm run build

# Stage 2: Serve the static files
FROM nginx:1.27-alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Change internal Nginx port to 5173 to match our proxy configuration
RUN sed -i 's/listen  *80;/listen 5173;/g' /etc/nginx/conf.d/default.conf

EXPOSE 5173