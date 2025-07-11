import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import pdf from 'pdf-parse';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });
    
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Read and parse the PDF
    const dataBuffer = fs.readFileSync(file.filepath);
    const pdfData = await pdf(dataBuffer);
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Please ensure the PDF contains readable text.' });
    }

    res.status(200).json({ 
      text: pdfData.text,
      message: 'PDF parsed successfully',
      pages: pdfData.numpages
    });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        return res.status(400).json({ error: 'Invalid PDF file. Please upload a valid PDF.' });
      }
      if (error.message.includes('maxFileSize')) {
        return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to parse PDF. Please try again.' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 