# Stage 1: Build Angular app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/coreui-free-angular-admin-template /usr/share/nginx/html
# Replace default nginx.conf to listen on 4200
RUN sed -i 's/listen       80;/listen       4200;/g' /etc/nginx/conf.d/default.conf
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
