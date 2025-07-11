# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY ./reactFrontend/package*.json ./
RUN npm ci
COPY ./reactFrontend .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./reactFrontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]