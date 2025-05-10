FROM node:22
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci
COPY ./prisma ./prisma
RUN npm run prisma:generate
COPY ./ ./
CMD npm run prisma:migrate && npm run start
