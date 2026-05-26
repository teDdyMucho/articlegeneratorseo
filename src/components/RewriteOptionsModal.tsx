import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Article } from '../data/types';

interface RewriteOptionsModalProps {
  article: Article | null;
  onClose: () => void;
  onSubmit: (article: Article, options: RewriteOptions) => void;
  loading: boolean;
}

export interface RewriteOptions {
  model: string;
  instructions: string;
}

const MODELS = [
  'anthropic/claude-sonnet-4',
  'anthropic/claude-opus-4',
  'anthropic/claude-haiku-4',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
];

export default function RewriteOptionsModal({ article, onClose, onSubmit, loading }: RewriteOptionsModalProps) {
  const [model, setModel] = useState('anthropic/claude-sonnet-4');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = () => {
    if (!article) return;
    onSubmit(article, { model, instructions });
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <AnimatePresence>
      {article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Rewrite Article</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Article title */}
              <p className="text-sm text-gray-500 leading-snug">{article?.title}</p>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                >
                  {MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructions or prompt</label>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Describe how you want the content to be rewritten (tone, target audience, include/exclude parts, etc.)"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                Rewrite
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
