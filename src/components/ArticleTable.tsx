import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Eye, RefreshCw, Globe, Trash2, Loader2, PenLine } from 'lucide-react';
import { Article } from '../data/types';

interface ArticleTableProps {
  articles: Article[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onViewContent: (article: Article) => void;
  onWrite: (article: Article) => void;
  onRewrite: (article: Article) => void;
  onGeneralize: (article: Article) => void;
  onDelete: (article: Article) => void;
  loadingActions: Map<number, string>;
}

export default function ArticleTable({
  articles,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewContent,
  onWrite,
  onRewrite,
  onGeneralize,
  onDelete,
  loadingActions,
}: ArticleTableProps) {
  const allSelected = articles.length > 0 && articles.every(a => selectedIds.has(a.id));

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Eye size={24} className="text-gray-400" />
        </div>
        <h3 className="text-gray-600 font-medium mb-1">No articles found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Article Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Business</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Keyword</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">City / State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Doc Link</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {articles.map(article => (
                <motion.tr
                  key={article.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(article.id)}
                      onChange={() => onToggleSelect(article.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2">{article.title || '--'}</p>
                    {article.website && (
                      <a
                        href={article.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-0.5 block truncate"
                      >
                        {article.website}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{article.business_name || '--'}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {article.keyword || '--'}
                      </span>
                      {article.addkeyword && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                          +{article.addkeyword}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-500">
                      {[article.city, article.state].filter(Boolean).join(', ') || '--'}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    {article.doc_link ? (
                      <a
                        href={article.doc_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 text-xs hover:text-blue-700 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Link
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">--</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {article.status ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        article.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : article.status === 'processing'
                          ? 'bg-violet-50 text-violet-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {article.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">--</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onViewContent(article)}
                      disabled={!article.content}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        article.content
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Eye size={12} />
                      View
                    </motion.button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      {article.content ? (
                        // Has content — show Rewrite, Generalize, Delete
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(220,38,38,0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onRewrite(article)}
                            disabled={loadingActions.has(article.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px]"
                          >
                            {loadingActions.get(article.id) === 'rewrite' ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <RefreshCw size={12} />
                            )}
                            Rewrite
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(22,163,74,0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onGeneralize(article)}
                            disabled={loadingActions.has(article.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px]"
                          >
                            {loadingActions.get(article.id) === 'generalize' ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Globe size={12} />
                            )}
                            Generalize
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(article)}
                            disabled={loadingActions.has(article.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-medium hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px]"
                          >
                            <Trash2 size={12} />
                            Delete
                          </motion.button>
                        </>
                      ) : (
                        // No content yet — show Write + Delete
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(37,99,235,0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onWrite(article)}
                            disabled={loadingActions.has(article.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px]"
                          >
                            {loadingActions.get(article.id) === 'write' ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <PenLine size={12} />
                            )}
                            Write
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(article)}
                            disabled={loadingActions.has(article.id)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-medium hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px]"
                          >
                            <Trash2 size={12} />
                            Delete
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
