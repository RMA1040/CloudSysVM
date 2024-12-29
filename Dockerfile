# Gebruik een Node.js base image
FROM node:16

# Stel de werkmap in de container in
WORKDIR /app

# Kopieer de package.json en package-lock.json van de .project-map naar de container
COPY .project/package*.json ./

# Installeer de npm-afhankelijkheden
RUN npm install

# Kopieer alle bestanden van de .project-map naar de container
COPY .project/ ./ 

# Exposeer poort 3000
EXPOSE 3000

# Start de applicatie
CMD ["node", "index.js"]
