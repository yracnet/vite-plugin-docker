FROM nginx:alpine
COPY ./sitio-web /usr/share/nginx/html
EXPOSE 80