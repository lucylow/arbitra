// Constellation Network utilities for evidence verification
// Constellation provides immutable storage and verification for evidence hashes

export interface ConstellationProof {
  hash: string;
  timestamp: number;
  transactionId?: string;
}

/**
 * Calculate SHA-256 hash of file data
 */
export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Convert blob to hex string (for Constellation)
 */
export function blobToHex(blob: Blob): Promise<string> {
  return blob.arrayBuffer().then(buffer => {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

/**
 * Verify evidence hash against Constellation network
 * This would typically call Constellation API, but is mocked here
 */
export async function verifyConstellationHash(hash: string): Promise<ConstellationProof | null> {
  // In production, this would make an API call to Constellation network
  // For now, we return a mock proof
  try {
    // Mock Constellation verification
    return {
      hash,
      timestamp: Date.now(),
      transactionId: `constellation-${hash.substring(0, 16)}`,
    };
  } catch (error) {
    console.error('Constellation verification failed:', error);
    return null;
  }
}

