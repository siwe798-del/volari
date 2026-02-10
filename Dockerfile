# Stage 1: Build the client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the server
FROM node:18-alpine AS server-build
RUN apk add --no-cache openssl
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
# Generate Prisma Client for the build step
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app

# Copy server package files and install production dependencies
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy built server files
COPY --from=server-build /app/server/dist ./dist
# Copy prisma schema
COPY --from=server-build /app/server/prisma ./prisma
# Copy built client files to public folder
COPY --from=client-build /app/client/dist ./public

# Generate Prisma Client for production
RUN npx prisma generate

# Expose port
EXPOSE 9999

# Set environment variables
ENV PORT=9999
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]
