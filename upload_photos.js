
const bucketName = 'fitcheck-photos';
const {Storage, TransferManager} = require('@google-cloud/storage');

// Initialize Google Cloud Storage with ADC (Application Default Credentials)
let storage;
let transferManager;

try {
  // Creates a client using Application Default Credentials
  // This will automatically use:
  // 1. Service account key file if GOOGLE_APPLICATION_CREDENTIALS is set
  // 2. Default service account if running on Google Cloud (GCE, GKE, Cloud Functions, etc.)
  // 3. User credentials if running locally with gcloud auth application-default login
  storage = new Storage({
    // ADC will be used automatically, but you can also explicitly set it:
    // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  // Creates a transfer manager client
  transferManager = new TransferManager(storage.bucket(bucketName));
  
  console.log('Google Cloud Storage client initialized successfully with ADC');
} catch (error) {
  console.error('Failed to initialize Google Cloud Storage client:', error);
  throw error;
}

async function uploadManyFilesWithTransferManager(filePaths) {
  if (!storage || !transferManager) {
    throw new Error('Google Cloud Storage client not initialized');
  }

  try {
    // Uploads the files
    await transferManager.uploadManyFiles(filePaths);
    
    console.log(`Successfully uploaded ${filePaths.length} file(s) to bucket: ${bucketName}`);
    
    // Log individual file uploads
    for (const filePath of filePaths) {
      console.log(`${filePath} uploaded to ${bucketName}.`);
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  uploadManyFilesWithTransferManager().catch(console.error);
}

module.exports = { uploadManyFilesWithTransferManager };