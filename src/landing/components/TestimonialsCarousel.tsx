import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

type Testimonial = { name: string; role: string; content: string; rating: number };

const TESTIMONIALS: Testimonial[] = [
  { name: 'Sarah Chen', role: 'Legal Director, TechCorp', content: 'Arbitra reduced our contract dispute time from 3 months to 48 hours.', rating: 5 },
  { name: 'Marcus Rodriguez', role: 'CEO, SupplyChain', content: 'Cross-border resolution worked flawlessly.', rating: 5 },
  { name: 'Dr. Emily Watson', role: 'General Counsel', content: 'Explainable reasoning won me over.', rating: 5 },
];

export const TestimonialsCarousel: React.FC = () => {
  const [i, setI] = useState(0);

  const prev = () => setI((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setI((s) => (s + 1) % TESTIMONIALS.length);

  return (
    <div className="max-w-4xl mx-auto py-8 bg-white">
      <div className="relative">
        <AnimatePresence initial={false}>
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <blockquote className="text-gray-700 italic">"{TESTIMONIALS[i].content}"</blockquote>
                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: TESTIMONIALS[i].rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                    <div className="text-sm text-gray-500 ml-2">{TESTIMONIALS[i].name} — {TESTIMONIALS[i].role}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
          <button onClick={prev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            ‹
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
          <button onClick={next} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
