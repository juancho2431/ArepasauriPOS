# 1️⃣ Seleccionar la imagen base
FROM node:18

# 2️⃣ Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3️⃣ Copiar los archivos de dependencias
COPY package*.json ./

# 4️⃣ Instalar las dependencias
RUN npm install

# 5️⃣ Copiar el código fuente al contenedor
COPY . .

# 6️⃣ Exponer el puerto en el que corre la app
EXPOSE 3000

# 7️⃣ Definir el comando para iniciar la aplicación
CMD ["npm", "start"]
