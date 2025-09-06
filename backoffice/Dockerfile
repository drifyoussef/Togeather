FROM node:20

WORKDIR /usr/src/app

# Set memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Exposer le port 3001
EXPOSE 3001

# Démarrer l'application sur le port 3001
CMD ["sh", "-c", "PORT=3001 npm start"]
