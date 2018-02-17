FROM ibmcom/ibmnode:latest
COPY ./ reporting-micro-dashboard
WORKDIR reporting-micro-dashboard
RUN npm install -d --production
EXPOSE 3000 80 443 22
ENV PORT 80
ENV DOCKER true
CMD ["npm", "start"]