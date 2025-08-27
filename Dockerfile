FROM public.ecr.aws/docker/library/node:14

WORKDIR /usr/app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN sed -i 's/\r$//' ./launch.sh && chmod +x ./launch.sh

RUN npm run build-server && npm run build-public

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "./launch.sh"]
