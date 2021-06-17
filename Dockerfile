FROM node:12
RUN apt-get autoremove -y curl libcurl3 libcurl3-gnutls libcurl4-openssl-dev \
  libdjvulibre-dev libdjvulibre-text libdjvulibre21 \
  libpq-dev libpq5 \
  libwebp-dev libwebp6 libwebpdemux2 libwebpmux2 \
  libx11-6 libx11-data \
  libxml2 libxml2-dev \
  mysql-common
WORKDIR /app
COPY /app/ /app/
RUN npm install
EXPOSE 8080
ENTRYPOINT ["/bin/bash", "./startapp.sh"]
