# Google Cloud Authentication Setup

## Option 1: For Local Development

### Install Google Cloud SDK

```bash
# macOS (using Homebrew)
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Authenticate with Google Cloud

```bash
# Login to your Google Cloud account
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Set application default credentials
gcloud auth application-default login
```

## Option 2: For Cloud Functions Deployment

### Service Account Setup

1. Go to Google Cloud Console
2. Navigate to IAM & Admin > Service Accounts
3. Create a new service account or use existing one
4. Grant the following roles:
   - Storage Object Admin
   - Storage Object Creator
   - Storage Object Viewer

### Environment Variables

Set these in your Cloud Function:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
BUCKET_NAME=your-bucket-name
```

## Option 3: Quick Test (Skip GCS)

If you want to test the function without Google Cloud Storage, you can modify the code to skip the upload:

```javascript
// In upload_photos.js, replace the upload function with:
async function uploadDirectoryWithTransferManager(directoryPath) {
  console.log("Skipping GCS upload for testing");
  return [
    {
      filename: "test.jpg",
      gcsPath: "test/path",
      gcsUrl: "https://example.com/test.jpg",
      status: "success",
    },
  ];
}
```

## Option 4: Use Service Account Key File

1. Download service account key from Google Cloud Console
2. Save it as `service-account-key.json` in your project
3. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
```

## Testing the Setup

After setting up authentication, test with:

```bash
npm start
```

The function should now work without authentication errors.
