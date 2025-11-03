export const DISPUTE_STATUSES = {
  PENDING: 'Pending',
  EVIDENCE_SUBMISSION: 'EvidenceSubmission',
  UNDER_REVIEW: 'UnderReview',
  DECIDED: 'Decided',
  APPEALED: 'Appealed',
  CLOSED: 'Closed',
} as const;

export const EVIDENCE_TYPES = {
  DOCUMENT: 'Document',
  IMAGE: 'Image',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  TEXT: 'Text',
} as const;

export const ESCROW_STATUSES = {
  PENDING: 'Pending',
  FUNDED: 'Funded',
  RELEASED: 'Released',
  REFUNDED: 'Refunded',
  DISPUTED: 'Disputed',
} as const;

export const JURISDICTIONS = [
  { value: 'US-NY', label: 'New York, USA' },
  { value: 'US-CA', label: 'California, USA' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'EU', label: 'European Union' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
] as const;

export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'ckBTC', label: 'ckBTC', symbol: 'ckBTC' },
  { value: 'ICP', label: 'ICP', symbol: 'ICP' },
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'audio/mpeg',
  'text/plain',
];

