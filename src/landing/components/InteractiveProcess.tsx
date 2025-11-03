import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lock, Cpu, UserCheck, Zap } from 'lucide-react';

const PROCESS = [
  { id: 'create', title: 'Create Dispute', icon: FileText, color: 'bg-blue-50', desc: 'Submit parties, amounts and documents' },
  { id: 'anchor', title: 'Evidence Anchoring', icon: Lock, color: 'bg-purple-50', desc: 'Hash & anchor evidence to Constellation' },
  { id: 'ai', title: 'AI Analysis', icon: Cpu, color: 'bg-cyan-50', desc: 'Neural analysis produces an explainable ruling' },
  { id: 'review', title: 'Human Review', icon: UserCheck, color: 'bg-yellow-50', desc: 'Optional human oversight & audit' },
  { id: 'settle', title: 'Auto-Settlement', icon: Zap, color: 'bg-green-50', desc: 'Instant payout & multi-chain settlement' },
];

export const InteractiveProcess: React.FC = () => {
  const [active, setActive] = useState<string | null>('create');

  return (
    <section aria-label="Interactive process" className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold">Process — Click any step</h3>
          <p className="text-gray-600">See details and example outcomes for each stage.</p>
        </div>

        <div className="relative flex items-center justify-between gap-4">
          {/* connecting line */}
          <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-200 to-blue-200 opacity-30 rounded"></div>

          {PROCESS.map((p, idx) => {
            const Icon = p.icon;
            const isActive = active === p.id;
            return (
              <motion.div
                key={p.id}
                className="relative z-10 flex-1 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                onClick={() => setActive(p.id)}
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.08 : 1, boxShadow: isActive ? '0 10px 30px rgba(2,6,23,0.15)' : 'none' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${p.color} border border-gray-100 cursor-pointer`}
                    aria-pressed={isActive}
                    role="button"
                    tabIndex={0}
                  >
                    <Icon className="h-8 w-8 text-gray-700" />
                  </motion.div>
                  <div className="text-xs font-semibold mt-3 text-gray-700">{p.title}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Details Panel */}
        <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {PROCESS.map((p) => (
            <motion.div 
              key={p.id} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: active === p.id ? 1 : 0 }} 
              style={{ display: active === p.id ? 'block' : 'none' }}
            >
              <h4 className="text-lg font-bold">{p.title}</h4>
              <p className="text-gray-600 mt-2">{p.desc}</p>
              <div className="mt-4">
                <div className="text-sm text-gray-500">Example outcome</div>
                <div className="mt-2 text-sm text-gray-700">
                  {p.id === 'ai' ? 'AI indicates 82% chance plaintiff wins; recommends 70% settlement.' : 'Standard operation: evidence verified & timestamped.'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
