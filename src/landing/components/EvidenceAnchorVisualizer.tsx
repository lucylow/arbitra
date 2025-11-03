import React from 'react';
import { motion } from 'framer-motion';

export const EvidenceAnchorVisualizer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Paper */}
        <div className="flex items-center justify-center">
          <div className="w-56 h-40 bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="h-3 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="mt-4 text-sm text-gray-500">Original Contract.pdf</div>
          </div>
        </div>

        {/* Transformation */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <motion.circle cx="110" cy="80" r="40" stroke="#00E5FF" strokeWidth="2" fill="rgba(0,229,255,0.06)" />
              <motion.line x1="40" y1="80" x2="80" y2="80" stroke="#C0C0C0" strokeWidth="2" />
              <motion.line x1="140" y1="80" x2="180" y2="80" stroke="#C0C0C0" strokeWidth="2" />
              <motion.text x="110" y="85" textAnchor="middle" fill="#00E5FF" fontSize="10">hash: c4a91f8b…</motion.text>
            </svg>
            <div className="mt-2 text-sm text-gray-500">Document → Cryptographic Hash</div>
          </motion.div>
        </div>

        {/* Nodes */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col gap-3">
            {['Node-A','Node-B','Node-C'].map((n, i) => (
              <motion.div 
                key={n} 
                initial={{ x: 30 }} 
                animate={{ x: 0 }} 
                transition={{ delay: 0.1 * i, duration: 0.6 }} 
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg flex items-center justify-center text-white text-xs">
                  {n.split('-')[1]}
                </div>
                <div className="text-sm text-gray-700">{n}</div>
              </motion.div>
            ))}
            <div className="mt-2 text-xs text-gray-500">Anchored across multiple consensus nodes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
