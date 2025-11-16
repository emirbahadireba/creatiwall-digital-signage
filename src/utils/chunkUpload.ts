// Chunk Upload Utility for Large Files
// Handles Vercel 50MB limit by splitting files into smaller chunks

export interface ChunkUploadOptions {
  chunkSize?: number; // Default 10MB
  onProgress?: (progress: number) => void;
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void;
}

export interface ChunkUploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

export class ChunkUploader {
  private file: File;
  private options: ChunkUploadOptions;
  private chunkSize: number;

  constructor(file: File, options: ChunkUploadOptions = {}) {
    this.file = file;
    this.options = options;
    this.chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  }

  async upload(metadata: {
    name?: string;
    type?: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
  }): Promise<ChunkUploadResult> {
    try {
      const fileSize = this.file.size;
      
      // If file is smaller than chunk size, use regular upload
      if (fileSize <= this.chunkSize) {
        console.log('File size under chunk limit, using regular upload');
        return await this.regularUpload(metadata);
      }

      console.log(`Starting chunk upload for ${this.file.name} (${fileSize} bytes)`);
      
      const totalChunks = Math.ceil(fileSize / this.chunkSize);
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`File will be split into ${totalChunks} chunks of ${this.chunkSize} bytes each`);

      // Upload chunks sequentially
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * this.chunkSize;
        const end = Math.min(start + this.chunkSize, fileSize);
        const chunk = this.file.slice(start, end);
        
        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${start}-${end})`);
        
        const chunkResult = await this.uploadChunk(chunk, {
          uploadId,
          chunkIndex,
          totalChunks,
          fileName: this.file.name,
          fileType: this.file.type,
          ...metadata
        });

        if (!chunkResult.success) {
          throw new Error(`Chunk ${chunkIndex + 1} upload failed: ${chunkResult.error}`);
        }

        // Update progress
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        this.options.onProgress?.(progress);
        this.options.onChunkProgress?.(chunkIndex + 1, totalChunks);
      }

      // Finalize upload
      console.log('All chunks uploaded, finalizing...');
      const finalResult = await this.finalizeUpload(uploadId, metadata);
      
      return finalResult;

    } catch (error) {
      console.error('Chunk upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async regularUpload(metadata: any): Promise<ChunkUploadResult> {
    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(this.file);
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: this.file.name,
          fileType: this.file.type,
          ...metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        data: result.data,
        error: result.success ? undefined : result.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  private async uploadChunk(chunk: Blob, chunkData: any): Promise<ChunkUploadResult> {
    try {
      // Convert chunk to base64
      const base64Chunk = await this.blobToBase64(chunk);
      
      const response = await fetch('/api/media/upload-chunk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          chunkData: base64Chunk,
          ...chunkData
        })
      });

      if (!response.ok) {
        throw new Error(`Chunk upload failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        data: result.data,
        error: result.success ? undefined : result.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chunk upload failed'
      };
    }
  }

  private async finalizeUpload(uploadId: string, metadata: any): Promise<ChunkUploadResult> {
    try {
      const response = await fetch('/api/media/finalize-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          uploadId,
          fileName: this.file.name,
          fileType: this.file.type,
          fileSize: this.file.size,
          ...metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Finalize upload failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        data: result.data,
        error: result.success ? undefined : result.message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Finalize upload failed'
      };
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Helper function for easy usage
export async function uploadLargeFile(
  file: File,
  metadata: {
    name?: string;
    type?: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
  },
  options: ChunkUploadOptions = {}
): Promise<ChunkUploadResult> {
  const uploader = new ChunkUploader(file, options);
  return await uploader.upload(metadata);
}