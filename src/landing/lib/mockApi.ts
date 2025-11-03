// lib/mockApi.ts
export type AnalysisResult = {
  id: string;
  confidence: number; // 0-100
  summary: string;
  importantClauses: { clause: string; risk: 'low'|'medium'|'high' }[];
};

export const simulateAiAnalysis = async (amount = 5000): Promise<AnalysisResult> => {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));
  return {
    id: `D-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    confidence: Math.floor(80 + Math.random() * 18),
    summary: amount > 10000
      ? 'High-value commercial dispute. Plaintiff likely to recover partial award.'
      : 'Standard commercial disagreement. Settlement likely with 70-80% award probability.',
    importantClauses: [
      { clause: 'Payment Terms (Clause 3.2)', risk: 'medium' },
      { clause: 'Termination (Clause 10)', risk: 'low' },
      { clause: 'Liability Cap (Clause 14)', risk: 'high' },
    ],
  };
};

export const simulateAnchoring = async (): Promise<{ tx: string; anchoredTo: string[] }> => {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
  return { 
    tx: `CONST_TX_${Math.random().toString(36).slice(2,10).toUpperCase()}`, 
    anchoredTo: ['Node-A','Node-B','Node-C'] 
  };
};
