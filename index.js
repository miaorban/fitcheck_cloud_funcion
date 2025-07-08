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

const { uploadManyFilesWithTransferManager } = require('./upload_photos');

// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.
const Busboy = require('busboy');
const { log } = require('console');

functions.http('uploadFile', (req, res) => {
  console.log('=== REQUEST STARTED ===');
  console.log('Method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const busboy = Busboy({headers: req.headers});
  const tmpdir = os.tmpdir();
  console.log('Temp directory:', tmpdir);

  let fitcheckId;
  const filePaths = [];
  const fileWrites = [];

  // This code will process each non-file field in the form.
  busboy.on('field', (fieldname, val) => {
    console.log(`Processed field ${fieldname}: ${val}.`);
    if (fieldname === 'fitcheckId') {
      fitcheckId = val;
    }
  });

  // This code will process each file uploaded.
  busboy.on('file', (fieldname, file, {filename}) => {
    console.log(`=== PROCESSING FILE ===`);
    console.log(`Field name: ${fieldname}`);
    console.log(`Filename: ${filename}`);
    
    const filepath = path.join(tmpdir, filename);
    console.log(`Saving to: ${filepath}`);
    
    filePaths.push({ path: filepath, fileName: filename });

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        console.log(`File stream ended for ${filename}`);
        writeStream.end();
      });
      
      writeStream.on('close', () => {
        console.log(`Write stream closed for ${filename}`);
        // Verify file was saved
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          console.log(`File ${filename} saved successfully, size: ${stats.size} bytes`);
        } else {
          console.error(`File ${filename} was not saved properly`);
        }
        resolve();
      });
      
      writeStream.on('error', (error) => {
        console.error(`Write stream error for ${filename}:`, error);
        reject(error);
      });
    });
    
    fileWrites.push(promise);
  });

  // Triggered once all uploaded files are processed by Busboy.
  busboy.on('finish', async () => {
    console.log('=== BUSBOY FINISHED ===');
    console.log(`Files to process: ${fileWrites.length}`);
    console.log(`Fitcheck ID: ${fitcheckId}`);
    
    try {
      // Wait for all files to be written
      await Promise.all(fileWrites);
      console.log('All files written to temp directory');
      
      // Verify files exist before upload
      const existingFiles = filePaths.filter(({ path }) => fs.existsSync(path));
      console.log(`Found ${existingFiles.length} existing files out of ${filePaths.length} total`);
      
      if (existingFiles.length === 0) {
        throw new Error('No files were saved successfully');
      }
      
      // Upload files to Google Cloud Storage
      console.log('Starting upload to Google Cloud Storage...');
      await uploadManyFilesWithTransferManager(existingFiles, fitcheckId);
      console.log('Upload to Google Cloud Storage completed successfully');
      
      // Clean up temporary files AFTER upload is complete
      console.log('Cleaning up temporary files...');
      for (const { path } of filePaths) {
        try {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            console.log(`Cleaned up: ${path}`);
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up ${path}:`, cleanupError);
        }
      }
      
      // Send success response
      console.log('Sending success response');
      res.status(200).json({
        success: true,
        message: `${existingFiles.length} files uploaded successfully`,
        fitcheckId: fitcheckId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('=== ERROR IN FINISH HANDLER ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      
      // Clean up temporary files even if upload fails
      for (const { path } of filePaths) {
        try {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
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

  // Handle Busboy errors
  busboy.on('error', (error) => {
    console.error('Busboy error:', error);
    res.status(400).json({
      error: 'Request parsing failed',
      message: error.message
    });
  });

  console.log('Starting to parse request body...');
  busboy.end(req.rawBody);
});