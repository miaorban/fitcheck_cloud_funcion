# FitCheck Cloud Function

A Google Cloud Function written in Node.js that receives and processes images along with JSON data.

## Features

- Accepts images via multipart/form-data or base64 encoded in JSON
- Processes JSON data alongside images
- CORS enabled for web applications
- Configurable image size limits
- Extensible processing logic
- Optional Google Cloud Storage integration

## Setup

### Prerequisites

- Google Cloud SDK installed
- Node.js 18+ installed
- Google Cloud project with billing enabled

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Local Development

Run the function locally for testing:

```bash
npm start
```

The function will be available at `http://localhost:8080`

### Deployment

Deploy to Google Cloud Functions:

```bash
npm run deploy
```

Or manually:

```bash
gcloud functions deploy processImageAndData \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point=processImageAndData \
  --source=. \
  --region=us-central1 \
  --memory=512MB \
  --timeout=540s
```

## Usage

### Method 1: Multipart Form Data

Send a POST request with `multipart/form-data`:

```javascript
const formData = new FormData();
formData.append("image", imageFile);
formData.append(
  "data",
  JSON.stringify({
    userId: "12345",
    category: "fashion",
    description: "Summer outfit",
  })
);

fetch("YOUR_FUNCTION_URL", {
  method: "POST",
  body: formData,
});
```

### Method 2: JSON with Base64 Image

Send a POST request with JSON body:

```javascript
const imageBase64 = btoa(imageFile); // Convert image to base64

fetch("YOUR_FUNCTION_URL", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    image: imageBase64,
    filename: "my_image.jpg",
    data: {
      userId: "12345",
      category: "fashion",
      description: "Summer outfit",
    },
  }),
});
```

## Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Image and data processed successfully",
  "result": {
    "imageInfo": {
      "filename": "my_image.jpg",
      "sizeBytes": 1024000,
      "contentType": "image/jpeg"
    },
    "dataReceived": {
      "userId": "12345",
      "category": "fashion",
      "description": "Summer outfit"
    },
    "processingNotes": [],
    "userId": "12345",
    "category": "fashion"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "error": "No image file provided",
  "status": "error"
}
```

## Configuration

### Environment Variables

- `BUCKET_NAME`: Google Cloud Storage bucket name (optional)

### Customization

Modify the `processData` function in `index.js` to implement your specific business logic:

```javascript
async function processData(imageBuffer, imageFilename, data) {
  // Your custom processing logic here
  // Examples:
  // - Image analysis
  // - Data validation
  // - External API calls
  // - Database operations

  return result;
}
```

## File Structure

```
├── index.js              # Main cloud function code
├── package.json          # Node.js dependencies and scripts
├── cloudbuild.yaml       # Google Cloud Build configuration
└── README.md            # This file
```

## Limitations

- Maximum image size: 10MB (configurable)
- Request timeout: 540 seconds
- Memory allocation: 512MB (configurable)

## Security Considerations

- The function is set to allow unauthenticated access for simplicity
- Consider adding authentication for production use
- Validate and sanitize all input data
- Implement rate limiting if needed

## Troubleshooting

### Common Issues

1. **Function not found**: Ensure the function name matches in deployment
2. **CORS errors**: Check that CORS headers are properly set
3. **Image too large**: Increase memory allocation or reduce image size
4. **Timeout errors**: Increase timeout or optimize processing logic

### Logs

View function logs:

```bash
gcloud functions logs read processImageAndData
```

## License

MIT License
