# Use Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"]