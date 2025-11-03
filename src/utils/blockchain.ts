export const truncateAddress = (address: string, start: number = 6, end: number = 4): string => {
  if (address.length <= start + end) return address;
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

export const validatePrincipal = (principal: string): boolean => {
  try {
    // Basic validation - principal should be alphanumeric with hyphens
    const principalRegex = /^[a-z0-9-]+$/i;
    return principalRegex.test(principal) && principal.length > 10;
  } catch {
    return false;
  }
};

export const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const formatConstellationTxId = (txId: string): string => {
  return truncateAddress(txId, 16, 8);
};

