
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('fitcheck_photos');

async function uploadManyFilesWithTransferManager(filePaths, fitcheckId) {  
  for (const i in filePaths) {
    const options = {
      destination: `${fitcheckId}/${i}_${filePaths[i].fileName}`
    };
    
    try {
      await bucket.upload(filePaths[i].path, options);
    } catch (error) {
      console.error(`Error uploading file ${filePaths[i].path}:`, error);
      throw error;
    }
  }
}

module.exports = { uploadManyFilesWithTransferManager };