# Test Examples for FitCheck Cloud Function

## Prerequisites

- Replace `YOUR_FUNCTION_URL` with your actual deployed function URL
- For local testing, use `http://localhost:8080`

## Method 1: JSON with Base64 Image (Recommended for Postman)

### Curl Command

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "filename": "test_image.png",
    "data": {
      "userId": "12345",
      "category": "fashion",
      "description": "Summer outfit test",
      "tags": ["casual", "summer"],
      "price": 29.99
    }
  }' \
  http://localhost:8080
```

### Postman Setup

1. **Method**: POST
2. **URL**: `https://YOUR_FUNCTION_URL`
3. **Headers**:
   - `Content-Type: application/json`
4. **Body**: Raw (JSON)

```json
{
  "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "filename": "test_image.png",
  "data": {
    "userId": "12345",
    "category": "fashion",
    "description": "Summer outfit test",
    "tags": ["casual", "summer"],
    "price": 29.99
  }
}
```

## Method 2: Multipart Form Data

### Curl Command

```bash
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  -F "data={\"userId\":\"12345\",\"category\":\"fashion\",\"description\":\"Summer outfit test\"}" \
  https://YOUR_FUNCTION_URL
```

### Postman Setup

1. **Method**: POST
2. **URL**: `https://YOUR_FUNCTION_URL`
3. **Body**: form-data
   - Key: `image` (Type: File) - Select your image file
   - Key: `data` (Type: Text) - Value: `{"userId":"12345","category":"fashion","description":"Summer outfit test"}`

## Method 3: Simple Test with Minimal Data

### Curl Command

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "data": {
      "test": true
    }
  }' \
  https://YOUR_FUNCTION_URL
```

## Expected Response

### Success Response

```json
{
  "status": "success",
  "message": "Image and data processed successfully",
  "result": {
    "imageInfo": {
      "filename": "test_image.png",
      "sizeBytes": 95,
      "contentType": "image/jpeg"
    },
    "dataReceived": {
      "userId": "12345",
      "category": "fashion",
      "description": "Summer outfit test",
      "tags": ["casual", "summer"],
      "price": 29.99
    },
    "processingNotes": [],
    "userId": "12345",
    "category": "fashion"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (No Image)

```json
{
  "error": "No image data provided",
  "status": "error"
}
```

## Test Image Data

The base64 string used in the examples above is a 1x1 pixel transparent PNG image. You can replace it with your own image by:

1. Converting your image to base64:

   ```bash
   base64 -i your_image.jpg
   ```

2. Or use an online tool to convert your image to base64

## Testing Different Scenarios

### Test 1: Valid Request

Use any of the curl commands above with the provided base64 image.

### Test 2: Missing Image

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "12345"
    }
  }' \
  https://YOUR_FUNCTION_URL
```

### Test 3: Invalid Base64

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "image": "invalid-base64-data",
    "data": {
      "userId": "12345"
    }
  }' \
  https://YOUR_FUNCTION_URL
```

### Test 4: Large Image (Test Size Limit)

```bash
# Create a large base64 string (this will trigger the size warning)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "image": "'$(printf 'A%.0s' {1..11000000} | base64)'",
    "data": {
      "userId": "12345"
    }
  }' \
  https://YOUR_FUNCTION_URL
```

## Postman Collection

You can import these requests into Postman by creating a new collection and adding the requests with the configurations above.

## Troubleshooting

1. **CORS Errors**: Make sure you're testing from a web browser or Postman (not affected by CORS)
2. **Function Not Found**: Verify your function URL is correct
3. **Timeout**: Large images may cause timeouts - use smaller images for testing
4. **Invalid JSON**: Ensure your JSON is properly formatted
