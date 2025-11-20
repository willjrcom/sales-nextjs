# Usando a imagem oficial do Node.js como base
FROM node:20-alpine

# Diretório de trabalho no container
WORKDIR /app

# Copiar o package.json e o package-lock.json (ou yarn.lock) para instalar as dependências
COPY package.json package-lock.json* yarn.lock* ./

# Instalar as dependências
RUN npm install  

# Copiar todos os arquivos do projeto
COPY . .

# Fazer o build do Next.js
RUN npm run build 

# Expor a porta que o Next.js vai rodar (por padrão é 3000)
EXPOSE 3000

# Iniciar o servidor Next.js em produção
CMD ["npm", "start"]
