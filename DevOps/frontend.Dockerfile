# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY reactfrontend/package*.json ./
RUN npm ci
COPY reactfrontend ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
