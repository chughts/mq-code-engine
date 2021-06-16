FROM node:12
WORKDIR /app
COPY /app/ /app/
RUN npm install
EXPOSE 8080
ENTRYPOINT ["/bin/bash", "./startapp.sh"]
