FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (no need for Python or build tools anymore)
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=4000

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "dev"]