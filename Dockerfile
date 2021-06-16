FROM node:12
RUN apt-get autoremove -y curl libcurl3 libcurl3-gnutls libcurl4-openssl-dev \
  libdjvulibre-dev libdjvulibre-text libdjvulibre21
WORKDIR /app
COPY /app/ /app/
RUN npm install
EXPOSE 8080
ENTRYPOINT ["/bin/bash", "./startapp.sh"]
