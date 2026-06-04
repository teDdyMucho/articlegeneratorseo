import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send, ImagePlus } from 'lucide-react';
import { Article } from '../data/types';
import { postToBuildHawk } from '../services/webhooks';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ContentModalProps {
  article: Article | null;
  onClose: () => void;
}

export default function ContentModal({ article, onClose }: ContentModalProps) {
  const [posting, setPosting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!article) return null;

  const isBuildHawk = article.business_name?.toLowerCase() === 'buildhawk';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(article.content);
    toast.success('Content copied to clipboard');
  };

  const handlePost = async () => {
    setPosting(true);
    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `articles/${article.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('buildhawk-images')
          .upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('buildhawk-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      await postToBuildHawk({ id: article.id, title: article.title, content: article.content, imageUrl });
      toast.success('Article posted to BuildHawk');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post to BuildHawk');
    } finally {
      setPosting(false);
    }
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{article.title}</h2>
                <p className="text-sm text-gray-400">{article.business_name} &middot; {article.keyword}</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                >
                  <Copy size={14} />
                  Copy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {article.content.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-2xl font-bold text-gray-900 mt-0 mb-4">{line.replace('# ', '')}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-semibold text-gray-800 mt-6 mb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-gray-600">{line.replace('- ', '')}</li>;
                  }
                  if (line.trim() === '') {
                    return <div key={i} className="h-2" />;
                  }
                  return <p key={i} className="mb-3">{line}</p>;
                })}
              </div>
            </div>

            {isBuildHawk && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="bh-image-upload"
                />

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Selected" className="w-full h-36 object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="bh-image-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm cursor-pointer hover:border-orange-300 hover:text-orange-400 transition-colors"
                  >
                    <ImagePlus size={15} />
                    Add featured image (optional)
                  </label>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePost}
                  disabled={posting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {posting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {posting ? 'Posting…' : 'Post to BuildHawk'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
