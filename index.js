/**
 * Parses a 'multipart/form-data' upload request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');

const functions = require('@google-cloud/functions-framework');

// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.
const Busboy = require('busboy');
const { log } = require('console');
const { uploadManyFilesWithTransferManager } = require('./upload_photos');

functions.http('uploadFile', (req, res) => {
  if (req.method !== 'POST') {
    // Return a "method not allowed" error
    return res.status(405).end();
  }
  const busboy = Busboy({headers: req.headers});
  const tmpdir = os.tmpdir();

  // This object will accumulate all the fields, keyed by their name
  const fields = {};

  // Array to store file processing results
  const fileResults = [];

  // This code will process each non-file field in the form.
  busboy.on('field', (fieldname, val) => {
    console.log(`Processed field ${fieldname}: ${val}.`);
    fields[fieldname] = val;
  });

  const fileWrites = [];

  // This code will process each file uploaded.
  busboy.on('file', (fieldname, file, {filename}) => {
    console.log(`Processed file ${filename}`);
    
    // Save file to temporary directory first
    const filepath = path.join(tmpdir, filename);
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    // File was processed by Busboy; wait for it to be written.
    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end();
      });
      writeStream.on('close', async () => {
        try {
          // Now upload the saved file
          await uploadManyFilesWithTransferManager([filepath]);
          fileResults.push({
            filename: filename,
            filepath: filepath,
            status: 'success'
          });
          resolve();
        } catch (error) {
          console.error(`Error uploading file ${filename}:`, error);
          fileResults.push({
            filename: filename,
            filepath: filepath,
            status: 'error',
            error: error.message
          });
          resolve();
        }
      });
      writeStream.on('error', reject);
    });
    
    fileWrites.push(promise);
  });

  // Triggered once all uploaded files are processed by Busboy.
  busboy.on('finish', async () => {
    try {
      await Promise.all(fileWrites);
      
      // Clean up temporary files
      for (const result of fileResults) {
        try {
          fs.unlinkSync(result.filepath);
        } catch (error) {
          console.error(`Error deleting temporary file ${result.filepath}:`, error);
        }
      }

      // Send success response
      res.status(200).json({
        status: 'success',
        message: `${fileResults.length} file(s) uploaded successfully`,
        result: {
          filesProcessed: fileResults.length,
          fileResults: fileResults,
          dataReceived: fields
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in finish handler:', error);
      
      // Clean up temporary files even if upload fails
      for (const result of fileResults) {
        try {
          fs.unlinkSync(result.filepath);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      
      res.status(500).json({
        error: 'Upload failed',
        message: error.message
      });
    }
  });

  busboy.end(req.rawBody);
});