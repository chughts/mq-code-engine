FROM node:12
RUN apt-get autoremove -y curl
WORKDIR /app
COPY /app/ /app/
RUN npm install
EXPOSE 8080
ENTRYPOINT ["/bin/bash", "./startapp.sh"]
