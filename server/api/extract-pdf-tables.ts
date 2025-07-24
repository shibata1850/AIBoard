import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
const { extractTables } = require('@krakz999/tabula-node');

interface TableExtractionResult {
  tables: any[][];
  metadata: {
    pageNumber: number;
    tableIndex: number;
    confidence: number;
  };
}

async function extractPdfTables(req: Request, res: Response) {
  let tempFilePath: string | null = null;
  
  try {
    const { base64Content } = req.body;
    
    if (!base64Content) {
      return res.status(400).json({ error: 'Base64 PDF content is required' });
    }

    const pdfData = base64Content.startsWith('data:application/pdf;base64,')
      ? base64Content.substring('data:application/pdf;base64,'.length)
      : base64Content;

    const tempDir = os.tmpdir();
    const fileName = `pdf_${uuidv4()}.pdf`;
    tempFilePath = path.join(tempDir, fileName);

    const buffer = Buffer.from(pdfData, 'base64');
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`Extracting tables from PDF: ${tempFilePath}`);

    const extractionResults: TableExtractionResult[] = [];

    try {
      const tables = await extractTables(tempFilePath, {
        pages: 'all',
        area: [],
        columns: [],
        guess: true,
        lattice: true,
        stream: false,
        silent: true
      });

      if (tables && Array.isArray(tables)) {
        tables.forEach((table: any[][], index: number) => {
          if (table && table.length > 0) {
            extractionResults.push({
              tables: table,
              metadata: {
                pageNumber: 1,
                tableIndex: index,
                confidence: 0.8
              }
            });
          }
        });
      }

      if (extractionResults.length === 0) {
        console.log('No tables found with lattice method, trying stream method...');
        
        const streamTables = await extractTables(tempFilePath, {
          pages: 'all',
          area: [],
          columns: [],
          guess: true,
          lattice: false,
          stream: true,
          silent: true
        });

        if (streamTables && Array.isArray(streamTables)) {
          streamTables.forEach((table: any[][], index: number) => {
            if (table && table.length > 0) {
              extractionResults.push({
                tables: table,
                metadata: {
                  pageNumber: 1,
                  tableIndex: index,
                  confidence: 0.6
                }
              });
            }
          });
        }
      }

    } catch (tabulaError) {
      console.error('Tabula extraction error:', tabulaError);
      throw new Error('Failed to extract tables using tabula-node');
    }

    if (extractionResults.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No tables found in PDF',
        tables: [],
        metadata: {
          tablesFound: 0,
          extractionMethod: 'tabula-node',
          confidence: 'low'
        }
      });
    }

    console.log(`Successfully extracted ${extractionResults.length} tables from PDF`);

    res.json({
      success: true,
      tables: extractionResults,
      metadata: {
        tablesFound: extractionResults.length,
        extractionMethod: 'tabula-node',
        confidence: extractionResults.length > 0 ? 'high' : 'low'
      }
    });

  } catch (error) {
    console.error('PDF table extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract tables from PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Cleaned up temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.warn(`Failed to cleanup temporary file: ${tempFilePath}`, cleanupError);
      }
    }
  }
}

export default async function handler(req: Request, res: Response) {
  return await extractPdfTables(req, res);
}
