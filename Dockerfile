# Use official Node.js LTS (Long Term Support) image
FROM node:20-alpine

# Set working directory
WORKDIR /workspace

# Git history is part of the MCP project summary/risk context.
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm ci if package-lock.json exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Default command runs the MCP server
CMD ["node", "build/index.js"]
