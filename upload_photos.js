
const bucketName = 'fitcheck-photos';
const {Storage, TransferManager} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// Creates a transfer manager client
const transferManager = new TransferManager(storage.bucket(bucketName));

async function uploadManyFilesWithTransferManager(filePaths) {
  // Uploads the files
  await transferManager.uploadManyFiles(filePaths);

//   for (const filePath of filePaths) {
//     console.log(`${filePath} uploaded to ${bucketName}.`);
//   }
}

uploadManyFilesWithTransferManager().catch(console.error);

module.exports = { uploadManyFilesWithTransferManager };