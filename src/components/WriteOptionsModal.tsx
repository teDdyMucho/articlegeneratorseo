import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import { Article } from '../data/types';

interface WriteOptionsModalProps {
  article: Article | null;
  onClose: () => void;
  onSubmit: (article: Article, options: WriteOptions) => void;
  loading: boolean;
}

export interface WriteOptions {
  word_limit: string;
  keywords: string[];
  website: string;
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

const WORD_LIMITS = ['500 words', '750 words', '1000 words', '1500 words', '2000 words', '2500 words', '3000 words'];

export default function WriteOptionsModal({ article, onClose, onSubmit, loading }: WriteOptionsModalProps) {
  const [wordLimit, setWordLimit] = useState('1000 words');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [website, setWebsite] = useState('');
  const [model, setModel] = useState('anthropic/claude-sonnet-4');
  const [instructions, setInstructions] = useState('');

  const addKeyword = () => {
    if (!keywordInput.trim() || keywords.length >= 2) return;
    setKeywords(prev => [...prev, keywordInput.trim()]);
    setKeywordInput('');
  };

  const removeKeyword = (i: number) => {
    setKeywords(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (!article) return;
    onSubmit(article, {
      word_limit: wordLimit,
      keywords,
      website,
      model,
      instructions,
    });
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
              <h2 className="text-base font-bold text-gray-800">Write Options</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Word limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Word limit</label>
                <select
                  value={wordLimit}
                  onChange={e => setWordLimit(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                >
                  {WORD_LIMITS.map(w => <option key={w}>{w}</option>)}
                </select>
              </div>

              {/* Additional keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional keywords ({keywords.length}/2)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addKeyword()}
                    placeholder="Enter keyword"
                    disabled={keywords.length >= 2}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    onClick={addKeyword}
                    disabled={keywords.length >= 2 || !keywordInput.trim()}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {keywords.map((kw, i) => (
                      <span
                        key={i}
                        onClick={() => removeKeyword(i)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        {kw} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>

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
                  placeholder="Describe how you want the content to be written (tone, target audience, include/exclude parts, etc.)"
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
                className="px-6 py-2.5 rounded-xl bg-green-600 text-sm font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50 shadow-lg shadow-green-600/20"
              >
                Write
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
