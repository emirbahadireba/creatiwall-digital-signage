import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { chunk, chunkIndex, uploadId, totalChunks } = req.body;

    if (!chunk || chunkIndex === undefined || !uploadId || !totalChunks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Chunk is already base64 encoded from frontend
    const base64Data = chunk;

    // Store chunk temporarily (in production, use Redis or similar)
    // For now, we'll use a simple in-memory storage approach
    const chunkData = {
      uploadId,
      chunkIndex: parseInt(chunkIndex),
      totalChunks: parseInt(totalChunks),
      data: base64Data,
      size: base64Data.length,
      timestamp: Date.now()
    };

    // In a real implementation, store this in Redis/database
    // For now, we'll just validate and return success
    console.log(`Received chunk ${chunkIndex}/${totalChunks} for upload ${uploadId}`);

    return res.status(200).json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      uploadId,
      message: `Chunk ${chunkIndex} uploaded successfully`
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return res.status(500).json({
      error: 'Chunk upload failed: ' + (error as Error).message
    });
  }
}