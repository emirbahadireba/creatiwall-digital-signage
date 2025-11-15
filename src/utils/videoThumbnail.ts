// Video thumbnail generator utility
export async function generateVideoThumbnail(videoUrl: string, timeInSeconds: number = 3): Promise<string | null> {
  return new Promise((resolve) => {
    console.log('[Thumbnail] Starting generation, URL:', videoUrl.substring(0, 50) + '...');
    
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.style.position = 'fixed';
    video.style.top = '-9999px';
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    document.body.appendChild(video);
    
    let hasResolved = false;
    
    const cleanup = () => {
      try {
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
        video.removeAttribute('src');
        video.load();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
    
    const tryGenerate = () => {
      if (hasResolved) return;
      
      try {
        console.log('[Thumbnail] tryGenerate called, readyState:', video.readyState, 'dimensions:', video.videoWidth, 'x', video.videoHeight, 'currentTime:', video.currentTime);
        
        // Check if video has valid dimensions
        if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
          console.log('[Thumbnail] Video ready, creating canvas...');
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            console.error('[Thumbnail] Could not get canvas context');
            cleanup();
            resolve(null);
            return;
          }
          
          // Draw video frame to canvas
          console.log('[Thumbnail] Drawing video to canvas...');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            console.log('[Thumbnail] Thumbnail created successfully, size:', dataUrl.length, 'bytes');
            hasResolved = true;
            cleanup();
            resolve(dataUrl);
          } catch (e) {
            console.error('[Thumbnail] Canvas toDataURL error:', e);
            cleanup();
            resolve(null);
          }
        } else {
          console.log('[Thumbnail] Video not ready yet, waiting...');
        }
      } catch (e) {
        console.error('[Thumbnail] Generation error:', e);
        if (!hasResolved) {
          cleanup();
          resolve(null);
        }
      }
    };
    
    // Set up event listeners
    video.addEventListener('loadedmetadata', () => {
      console.log('[Thumbnail] loadedmetadata event, duration:', video.duration);
      try {
        const duration = video.duration;
        if (isFinite(duration) && duration > 0) {
          const seekTime = Math.min(timeInSeconds, duration - 0.5);
          console.log('[Thumbnail] Seeking to:', seekTime);
          video.currentTime = seekTime;
        } else {
          console.log('[Thumbnail] Invalid duration, seeking to 1s');
          video.currentTime = 1;
        }
      } catch (e) {
        console.error('[Thumbnail] Error setting currentTime:', e);
        video.currentTime = 1;
      }
    });
    
    video.addEventListener('seeked', () => {
      console.log('[Thumbnail] seeked event, currentTime:', video.currentTime);
      // Wait a bit for frame to be ready
      setTimeout(() => {
        tryGenerate();
      }, 200);
    });
    
    video.addEventListener('loadeddata', () => {
      if (video.readyState >= 2) {
        const duration = video.duration;
        if (isFinite(duration) && duration > 0 && video.currentTime === 0) {
          const seekTime = Math.min(timeInSeconds, duration - 0.5);
          video.currentTime = seekTime;
        } else if (video.currentTime > 0) {
          tryGenerate();
        }
      }
    });
    
    video.addEventListener('canplay', () => {
      if (video.readyState >= 2 && video.currentTime > 0) {
        setTimeout(() => {
          tryGenerate();
        }, 200);
      }
    });
    
    video.addEventListener('error', (e) => {
      console.error('[Thumbnail] Video error:', e, video.error);
      if (video.error) {
        console.error('[Thumbnail] Error code:', video.error.code, 'message:', video.error.message);
      }
      if (!hasResolved) {
        cleanup();
        resolve(null);
      }
    });
    
    // Timeout after 15 seconds
    setTimeout(() => {
      if (!hasResolved) {
        console.warn('Thumbnail generation timeout');
        cleanup();
        resolve(null);
      }
    }, 15000);
    
    // Start loading
    video.src = videoUrl;
    video.load();
    
    // Also try to generate after a delay as fallback
    setTimeout(() => {
      if (!hasResolved && video.readyState >= 2) {
        tryGenerate();
      }
    }, 2000);
  });
}

