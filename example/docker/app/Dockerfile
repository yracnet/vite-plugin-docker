FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY server.conf /etc/nginx/conf.d/server.conf
COPY dist-react /opt/app-react

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
