import React, { useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { simulateAiAnalysis, simulateAnchoring } from '../lib/mockApi';
import { useInterval } from '../hooks/useInterval';

type Step = {
  id: string;
  label: string;
  fn?: () => Promise<string | null>;
  output?: string | null;
};

export const DemoSimulator: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([
    { id: 'create', label: '$ arbitra create-dispute --amount 5000 --currency USD' },
    { id: 'submit', label: '$ arbitra submit-evidence --file contract.pdf' },
    { id: 'anchor', label: '$ arbitra anchor-evidence' },
    { id: 'analyze', label: '$ arbitra analyze --ai-enhanced' },
    { id: 'settle', label: '$ arbitra settle --method ckBTC' },
  ]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200); // ms per step
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // assign async functions to anchor and analyze steps
  useEffect(() => {
    setSteps((s) =>
      s.map((st) => {
        if (st.id === 'anchor') {
          return { ...st, fn: async () => {
            const res = await simulateAnchoring();
            return `✓ Evidence anchored: ${res.tx}`;
          } };
        }
        if (st.id === 'analyze') {
          return { ...st, fn: async () => {
            const r = await simulateAiAnalysis();
            return `✓ AI Analysis Complete (Confidence: ${r.confidence}%) — ${r.summary}`;
          } };
        }
        if (st.id === 'create') {
          return { ...st, fn: async () => {
            await new Promise(r => setTimeout(r, 300));
            return `✓ Dispute created: D-7X9K2P`;
          } };
        }
        if (st.id === 'submit') {
          return { ...st, fn: async () => {
            await new Promise(r => setTimeout(r, 450));
            return `✓ Evidence uploaded: contract.pdf`;
          } };
        }
        if (st.id === 'settle') {
          return { ...st, fn: async () => {
            await new Promise(r => setTimeout(r, 350));
            return `✓ Settlement executed via ckBTC`;
          } };
        }
        return st;
      })
    );
  }, []);

  const runStep = useCallback(async (i: number) => {
    const step = steps[i];
    if (!step) return;
    setBusy(true);
    setLog((l) => [...l, step.label]);
    if (step.fn) {
      const result = await step.fn();
      if (result) setLog((l) => [...l, result]);
    } else {
      await new Promise((r) => setTimeout(r, 300));
      setLog((l) => [...l, '✓ OK']);
    }
    setBusy(false);
    setIndex(i + 1);
  }, [steps]);

  useInterval(() => {
    if (playing && !busy && index < steps.length) {
      runStep(index);
    } else if (index >= steps.length) {
      setPlaying(false);
    }
  }, playing ? speed : null);

  const handlePlayPause = () => { setPlaying((p) => !p); };
  const handleStep = async () => { if (!busy && index < steps.length) await runStep(index); };
  const handleReset = () => { setPlaying(false); setIndex(0); setLog([]); };

  return (
    <div className="bg-gray-900 rounded-xl p-6 text-white max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-semibold">Live Demo</div>
          <div className="text-xs text-gray-300">Simulated CLI: Arbitra dApp</div>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={handleReset} title="Reset" className="p-2 rounded-md hover:bg-gray-800">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => { setSpeed(2000); }} title="Slow" className="px-2 py-1 rounded bg-gray-800 text-xs">0.5x</button>
          <button onClick={() => { setSpeed(1200); }} title="Normal" className="px-2 py-1 rounded bg-gray-800 text-xs">1x</button>
          <button onClick={() => { setSpeed(600); }} title="Fast" className="px-2 py-1 rounded bg-gray-800 text-xs">2x</button>
        </div>
      </div>

      <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-300 h-56 overflow-auto">
        {log.length === 0 ? (
          <div className="text-gray-500">▸ Ready. Press play to run demo.</div>
        ) : (
          log.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              className="mb-2"
            >
              {line}
            </motion.div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => { setIndex(Math.max(0, index - 1)); }} title="Step back" className="p-2 rounded-md hover:bg-gray-800">
            <SkipBack className="h-4 w-4" />
          </button>

          <button onClick={handlePlayPause}
            className="px-4 py-2 bg-blue-600 rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-sm font-semibold">{playing ? 'Pause' : 'Play'}</span>
          </button>

          <button onClick={handleStep} disabled={busy || index >= steps.length} className="p-2 rounded-md hover:bg-gray-800">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm text-gray-400">
          Step {Math.min(index + 1, steps.length)}/{steps.length} {busy ? ' • processing…' : ''}
        </div>
      </div>
    </div>
  );
};
