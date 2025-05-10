FROM node:22
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci
COPY ./ ./
CMD npm run prisma:migrate && npm run start
