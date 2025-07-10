ALTER TABLE document_analyses 
ADD COLUMN IF NOT EXISTS content_hash VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_document_analyses_content_hash 
ON document_analyses(content_hash);

ALTER TABLE document_analyses 
ADD CONSTRAINT unique_content_hash UNIQUE (content_hash);
