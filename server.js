module.exports = (req, res) => {
  const path = require('path');
  const { createReadStream } = require('fs');
  const mime = require('mime');
  
  const requestPath = req.url === '/' ? '/index.html' : req.url;
  
  const filePath = path.join(__dirname, 'dist', requestPath);
  
  const contentType = mime.getType(filePath) || 'text/plain';
  
  res.setHeader('Content-Type', contentType);
  
  try {
    const stream = createReadStream(filePath);
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error(`Error serving ${filePath}:`, error);
      
      if (error.code === 'ENOENT') {
        const indexStream = createReadStream(path.join(__dirname, 'dist', 'index.html'));
        res.setHeader('Content-Type', 'text/html');
        indexStream.pipe(res);
        
        indexStream.on('error', (indexError) => {
          console.error('Error serving index.html:', indexError);
          res.statusCode = 500;
          res.end('Internal Server Error');
        });
      } else {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
