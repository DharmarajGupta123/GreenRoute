# Stage 1: Build the React App
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of your app code
COPY . .

# Accept the API Key as a build argument
ARG GEMINI_API_KEY

# Write the key to .env.local so Vite can see it during build
# (Note: In a real production app, be careful exposing keys in frontend code)
RUN echo "GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the app (creates the 'dist' folder)
RUN npm run build

# Stage 2: Serve the App with Nginx
FROM nginx:alpine

# Copy the custom nginx config we created above
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run expects port 8080
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
