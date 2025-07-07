
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('fitcheck_photos');

async function uploadManyFilesWithTransferManager(filePaths, fitcheckId) {  
  console.log('Uploading files with Transfer Manager');
  for (const i in filePaths) {
    const options = {
      destination: `${fitcheckId}/${i}_${filePaths[i].fileName}`
    };
    
    await bucket.upload(filePaths[i].path, options);
    console.log(`File ${filePaths[i].path} uploaded successfully`);
  }
}

uploadManyFilesWithTransferManager().catch(console.error);

module.exports = { uploadManyFilesWithTransferManager };