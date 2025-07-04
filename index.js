const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Storage
const storage = new Storage();

functions.http('processImageAndData', async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    let imageBuffer;
    let imageFilename;
    let jsonData;

    // Check if request is multipart/form-data
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      // Handle multipart form data
      if (!req.files || !req.files.image) {
        return res.status(400).json({
          error: 'No image file provided',
          status: 'error'
        });
      }

      const imageFile = req.files.image;
      imageBuffer = imageFile.data;
      imageFilename = imageFile.name || 'uploaded_image';
      jsonData = req.body.data ? JSON.parse(req.body.data) : {};

    } else {
      // Handle JSON request with base64 encoded image
      if (!req.body) {
        return res.status(400).json({
          error: 'No request body provided',
          status: 'error'
        });
      }

      const { image: imageB64, data, filename } = req.body;

      if (!imageB64) {
        return res.status(400).json({
          error: 'No image data provided',
          status: 'error'
        });
      }

      try {
        // Decode base64 image
        imageBuffer = Buffer.from(imageB64, 'base64');
        imageFilename = filename || 'uploaded_image';
        jsonData = data || {};
      } catch (error) {
        return res.status(400).json({
          error: `Invalid base64 image data: ${error.message}`,
          status: 'error'
        });
      }
    }

    // Process the image and data
    const result = await processData(imageBuffer, imageFilename, jsonData);

    res.status(200).json({
      status: 'success',
      message: 'Image and data processed successfully',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: `Internal server error: ${error.message}`,
      status: 'error'
    });
  }
});

async function processData(imageBuffer, imageFilename, data) {
  /**
   * Process the uploaded image and JSON data.
   * This is where you would implement your specific business logic.
   * 
   * @param {Buffer} imageBuffer - Binary image data
   * @param {string} imageFilename - Name of the uploaded file
   * @param {Object} data - Parsed JSON data
   * @returns {Object} Processing results
   */
  
  const result = {
    imageInfo: {
      filename: imageFilename,
      sizeBytes: imageBuffer.length,
      contentType: 'image/jpeg' // You might want to detect this
    },
    dataReceived: data,
    processingNotes: []
  };

  // Example: Check if image size is reasonable
  if (imageBuffer.length > 10 * 1024 * 1024) { // 10MB limit
    result.processingNotes.push('Image is larger than 10MB');
  }

  // Example: Extract some data from the JSON
  if (data.userId) {
    result.userId = data.userId;
  }

  if (data.category) {
    result.category = data.category;
  }

  // Example: You could save to Google Cloud Storage
  // await saveToStorage(imageBuffer, imageFilename);

  // Example: You could call other services
  // await callImageAnalysisService(imageBuffer);

  return result;
}

async function saveToStorage(imageBuffer, filename) {
  /**
   * Example function to save image to Google Cloud Storage.
   * Uncomment and configure if you want to save images.
   */
  /*
  try {
    const bucketName = process.env.BUCKET_NAME || 'your-bucket-name';
    const bucket = storage.bucket(bucketName);
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const blobName = `uploads/${year}/${month}/${day}/${filename}`;
    const file = bucket.file(blobName);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg'
      }
    });
    
    return file.publicUrl();
  } catch (error) {
    console.error('Error saving to storage:', error);
    return null;
  }
  */
} 