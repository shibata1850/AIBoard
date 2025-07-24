const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));

app.post('/api/chat', async (req, res) => {
  try {
    require('ts-node/register');
    const { generateChatResponse } = require('./server/api/chat.ts');
    const result = await generateChatResponse(req.body.messages);
    res.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/extract-pdf-tables', async (req, res) => {
  try {
    require('ts-node/register');
    const { extractPdfTables } = require('./server/api/extract-pdf-tables.ts');
    await extractPdfTables(req, res);
  } catch (error) {
    console.error('Extract PDF tables API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/extract-financial-item', async (req, res) => {
  try {
    require('ts-node/register');
    const { extractFinancialItem } = require('./server/api/extract-financial-item.ts');
    await extractFinancialItem(req, res);
  } catch (error) {
    console.error('Financial item extraction API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/verify', async (req, res) => {
  try {
    require('ts-node/register');
    const { default: handler } = require('./server/api/verify.ts');
    await handler(req, res);
  } catch (error) {
    console.error('Verification API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    require('ts-node/register');
    const { analyzeDocument } = require('./server/api/analyze.ts');
    const result = await analyzeDocument(req.body.content, req.body.fileName);
    res.json(result);
  } catch (error) {
    console.error('Analysis API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
