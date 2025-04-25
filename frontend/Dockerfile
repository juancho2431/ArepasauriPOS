# 1️⃣ Imagen base de Node para construir el frontend
FROM node:18

# 2️⃣ Directorio de trabajo dentro del contenedor
WORKDIR /app

# 3️⃣ Copiar archivos de dependencias
COPY package*.json ./

# 4️⃣ Instalar dependencias
RUN npm install

# 5️⃣ Copiar el resto del código
COPY . .

# 6️⃣ Exponer el puerto en el que corre React
EXPOSE 3001

# 7️⃣ Iniciar la app
CMD ["npm", "start"]
