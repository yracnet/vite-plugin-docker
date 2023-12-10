FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

ARG NGINX_DOMAIN
ENV NGINX_DOMAIN $NGINX_DOMAIN
ARG NGINX_MESSAGE
ENV NGINX_MESSAGE $NGINX_MESSAGE

RUN mkdir -p /usr/share/nginx/html-error
RUN echo "<html><head><title>Error</title></head><body><h1>$NGINX_MESSAGE</h1></body></html>" > /usr/share/nginx/html-error/index.html

EXPOSE 80
