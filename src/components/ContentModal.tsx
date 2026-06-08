import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Send, ImagePlus, CheckCircle, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { Article } from '../data/types';
import { postToBuildHawk, deletePostedBuildHawkArticle, generateArticleImage } from '../services/webhooks';
import { supabase } from '../lib/supabase';
import { updateArticle } from '../services/supabase';
import toast from 'react-hot-toast';

interface ContentModalProps {
  article: Article | null;
  onArticleUpdated: (updated: Article) => void;
  onClose: () => void;
}

type ProcessStep = 'uploading-image' | 'posting' | 'deleting' | 'generating-image' | null;

export default function ContentModal({ article, onArticleUpdated, onClose }: ContentModalProps) {
  const [step, setStep] = useState<ProcessStep>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!article) return null;

  const isBuildHawk = article.business_name?.toLowerCase() === 'buildhawk';
  const isPosted = article.postlabel === 'posted';
  const savedImage = article.imagebucketlink ?? null;
  const busy = step !== null;

  const stepLabel: Record<NonNullable<ProcessStep>, string> = {
    'uploading-image': 'Uploading image…',
    'posting': 'Posting to BuildHawk…',
    'deleting': 'Deleting from BuildHawk…',
    'generating-image': 'Generating image…',
  };

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

  const handleGenerateImage = async () => {
    setStep('generating-image');
    try {
      const blob = await generateArticleImage({ id: article.id, title: article.title, content: article.content });
      const ext = blob.type.split('/')[1] || 'png';
      const path = `articles/${article.id}-generated-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('buildhawk-images')
        .upload(path, blob, { upsert: true, contentType: blob.type || 'image/png' });
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      const { data: urlData } = supabase.storage.from('buildhawk-images').getPublicUrl(path);

      const updated = await updateArticle(article.id, { imagebucketlink: urlData.publicUrl });
      onArticleUpdated(updated);
      toast.success('Image generated and saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setStep(null);
    }
  };

  const handlePost = async () => {
    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        setStep('uploading-image');
        const ext = imageFile.name.split('.').pop();
        const path = `articles/${article.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('buildhawk-images')
          .upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('buildhawk-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      setStep('posting');
      await postToBuildHawk({ id: article.id, title: article.title, content: article.content, imageUrl });

      const updated = await updateArticle(article.id, {
        postlabel: 'posted',
        imagebucketlink: imageUrl ?? null,
      });
      onArticleUpdated(updated);
      toast.success('Article posted to BuildHawk');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post to BuildHawk');
    } finally {
      setStep(null);
    }
  };
//
  const handleDeleteRequest = () => setConfirmingDelete(true);
  const handleDeleteCancel = () => setConfirmingDelete(false);

  const handleDeleteConfirm = async () => {
    setConfirmingDelete(false);
    setStep('deleting');
    try {
      await deletePostedBuildHawkArticle({ id: article.id, title: article.title, content: article.content });

      const updated = await updateArticle(article.id, {
        postlabel: null,
        imagebucketlink: null,
      });
      onArticleUpdated(updated);
      toast.success('Article deleted from BuildHawk');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete from BuildHawk');
    } finally {
      setStep(null);
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
            onClick={busy ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Loading overlay */}
            <AnimatePresence>
              {busy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-3xl"
                >
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-gray-600">{step ? stepLabel[step] : ''}</p>
                </motion.div>
              )}
            </AnimatePresence>

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
                  disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy size={14} />
                  Copy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={busy ? undefined : onClose}
                  disabled={busy}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Generate image — available for every business */}
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
              {savedImage && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={savedImage} alt="Generated" className="w-full h-36 object-cover" />
                </div>
              )}
              <motion.button
                whileHover={!busy ? { scale: 1.02 } : {}}
                whileTap={!busy ? { scale: 0.98 } : {}}
                onClick={!busy ? handleGenerateImage : undefined}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-purple-200 text-purple-500 text-sm font-medium hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={15} />
                {savedImage ? 'Regenerate Image' : 'Generate Image'}
              </motion.button>
            </div>

            {isBuildHawk && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-3">

                {/* Image upload — only when not yet posted */}
                {!isPosted && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="bh-image-upload"
                      disabled={busy}
                    />
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={imagePreview} alt="Selected" className="w-full h-36 object-cover" />
                        <button
                          onClick={removeImage}
                          disabled={busy}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-50"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={busy ? undefined : 'bh-image-upload'}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm transition-colors ${busy ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-400 cursor-pointer hover:border-orange-300 hover:text-orange-400'}`}
                      >
                        <ImagePlus size={15} />
                        Add featured image (optional)
                      </label>
                    )}
                  </>
                )}

                {/* Post / Already Posted button */}
                <motion.button
                  whileHover={!busy && !isPosted ? { scale: 1.02 } : {}}
                  whileTap={!busy && !isPosted ? { scale: 0.98 } : {}}
                  onClick={!busy && !isPosted ? handlePost : undefined}
                  disabled={busy || isPosted}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-colors disabled:cursor-not-allowed ${
                    isPosted
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60'
                  }`}
                >
                  {isPosted ? (
                    <>
                      <CheckCircle size={15} />
                      Already Posted
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Post to BuildHawk
                    </>
                  )}
                </motion.button>

                {/* Delete button */}
                {isPosted && !confirmingDelete && (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={!busy ? { scale: 1.02 } : {}}
                    whileTap={!busy ? { scale: 0.98 } : {}}
                    onClick={!busy ? handleDeleteRequest : undefined}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={15} />
                    Delete from BuildHawk
                  </motion.button>
                )}

                {/* Delete confirmation */}
                {isPosted && confirmingDelete && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-700 font-medium">
                        Are you sure you want to delete this article from BuildHawk? This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteConfirm}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
