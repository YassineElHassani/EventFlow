# frontend/Dockerfile

# 1. Use Node.js image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the code
COPY . .

# 6. Expose the port (Next.js runs on 3000 by default inside container)
EXPOSE 3000

# 7. Start Next.js in Development mode
CMD ["npm", "run", "dev"]