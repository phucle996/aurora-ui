# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-fund --no-audit

COPY . .
RUN npm run build

FROM nginx:1.29.4-alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
