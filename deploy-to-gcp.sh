#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="YOUR_GCP_PROJECT_ID"  # Replace with your GCP project ID
REGION="us-central1"              # Replace with your preferred region
ADMIN_SERVICE_NAME="snapeat-admin"
STORAGE_BUCKET="snapeat-website"  # Replace with your bucket name
CLOUD_RUN_URL=""                  # Will be populated after deployment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Google Cloud Platform...${NC}"

# Ensure gcloud is configured with the correct project
echo -e "${YELLOW}Configuring gcloud to use project: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Deploy Admin Backend to Cloud Run
echo -e "${YELLOW}Deploying Admin Backend to Cloud Run...${NC}"
cd admin

# Build and push Docker image
echo "Building and pushing Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$ADMIN_SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $ADMIN_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$ADMIN_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

# Get the Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe $ADMIN_SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo -e "${GREEN}Admin Backend deployed to: ${CLOUD_RUN_URL}${NC}"

# Return to root directory
cd ..

# Update client configuration with Cloud Run URL
echo -e "${YELLOW}Updating client configuration with Cloud Run URL...${NC}"
sed -i "s|https://YOUR_CLOUD_RUN_URL|${CLOUD_RUN_URL}|g" client/config.ts

# Deploy Client Frontend to Cloud Storage
echo -e "${YELLOW}Deploying Client Frontend to Cloud Storage...${NC}"
cd client

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create Cloud Storage bucket if it doesn't exist
echo "Checking if bucket exists..."
if ! gsutil ls -b gs://$STORAGE_BUCKET &>/dev/null; then
  echo "Creating bucket: gs://$STORAGE_BUCKET"
  gsutil mb -l $REGION gs://$STORAGE_BUCKET
  
  # Make the bucket publicly readable
  echo "Setting bucket permissions..."
  gsutil iam ch allUsers:objectViewer gs://$STORAGE_BUCKET
  
  # Configure for web hosting
  echo "Configuring bucket for web hosting..."
  gsutil web set -m index.html -e index.html gs://$STORAGE_BUCKET
fi

# Upload the built files to the bucket
echo "Uploading files to bucket..."
gsutil -m cp -r dist/* gs://$STORAGE_BUCKET/

# Get the public URL
STORAGE_URL="https://storage.googleapis.com/$STORAGE_BUCKET/index.html"
echo -e "${GREEN}Client Frontend deployed to: ${STORAGE_URL}${NC}"

# Return to root directory
cd ..

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Admin Backend: ${CLOUD_RUN_URL}${NC}"
echo -e "${GREEN}Client Frontend: ${STORAGE_URL}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your DNS settings to point to your GCP resources"
echo "2. Set up a custom domain with Cloud CDN for better performance"
echo "3. Configure Firebase security rules for production"
