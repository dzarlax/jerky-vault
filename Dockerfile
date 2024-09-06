# Используем Node.js 20
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./
COPY package.json ./
# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Строим приложение
RUN npm run build

# Указываем команду по умолчанию
CMD ["npm", "start"]

# Указываем порт, который будет использоваться контейнером
EXPOSE 3000
