const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ビルド出力ディレクトリを'dist'から'web-build'に変更
app.use(express.static(path.join(__dirname, 'web-build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
