const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());
// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Use a random hash to generate a unique file name
    let hash = crypto.randomBytes(16).toString('hex');
    cb(null, hash + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from the public folder
app.use(express.static('public'));

// Endpoint to upload files
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    // Generate a unique link for the uploaded file
    const fileLink = `${req.protocol}://${req.get('host')}/download/${req.file.filename}`;
    res.status(200).json({ link: fileLink });
  } else {
    res.status(400).send('File upload failed.');
  }
});

// Endpoint to download files
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});