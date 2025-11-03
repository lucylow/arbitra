import { Principal } from '@dfinity/principal';

export const formatPrincipal = (principal: Principal | string, length: number = 8): string => {
  const str = typeof principal === 'string' ? principal : principal.toString();
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

export const formatAmount = (amount: bigint, decimals: number = 8): string => {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  return `${wholePart.toString()}.${fractionalString}`;
};

export const formatDate = (timestamp: bigint | number): string => {
  const date = typeof timestamp === 'bigint' 
    ? new Date(Number(timestamp) / 1e6)
    : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (timestamp: bigint | number): string => {
  const date = typeof timestamp === 'bigint'
    ? new Date(Number(timestamp) / 1e6)
    : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(timestamp);
};

