import { useState, useMemo, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import SearchToolbar from './components/SearchToolbar';
import ArticleTable from './components/ArticleTable';
import ContentModal from './components/ContentModal';
import CreateArticleModal from './components/CreateArticleModal';
import WriteOptionsModal, { WriteOptions } from './components/WriteOptionsModal';
import RewriteOptionsModal, { RewriteOptions } from './components/RewriteOptionsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { Article } from './data/types';
import { createArticle, writeArticle, rewriteArticle, generalizeArticle } from './services/webhooks';
import { fetchArticles, deleteArticle as deleteArticleDb, fetchBusinessNames } from './services/supabase';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [businesses, setBusinesses] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [contentArticle, setContentArticle] = useState<Article | null>(null);
  const [postedArticleIds, setPostedArticleIds] = useState<Set<number>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Map<number, string>>(new Map());

  const [writeTargetArticle, setWriteTargetArticle] = useState<Article | null>(null);
  const [rewriteTargetArticle, setRewriteTargetArticle] = useState<Article | null>(null);
  const [deleteTargetArticle, setDeleteTargetArticle] = useState<Article | null>(null);
  const [writeLoading, setWriteLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadArticles();
    fetchBusinessNames().then(setBusinesses).catch(() => {});
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
    } catch {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch =
        !searchQuery ||
        (article.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.business_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.keyword ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || article.status === statusFilter;
      const matchesBusiness = businessFilter === 'All' || article.business_name === businessFilter;
      return matchesSearch && matchesStatus && matchesBusiness;
    });
  }, [articles, searchQuery, statusFilter, businessFilter]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (filteredArticles.every(a => selectedIds.has(a.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredArticles.map(a => a.id)));
    }
  }, [filteredArticles, selectedIds]);

  const handleViewContent = useCallback((article: Article) => {
    setContentArticle(article);
  }, []);

  // Create — fires Research webhook, auto-refetches after 10s
  const handleCreateArticle = useCallback(async (data: {
    keyword: string;
    business_name: string;
    city: string;
    state: string;
    call_action: string;
    count: number;
  }) => {
    setCreateLoading(true);
    try {
      await createArticle(data);
      setShowCreateModal(false);
      toast.success('Research started — fetching results in 10 seconds...');
      setTimeout(() => {
        loadArticles();
      }, 10000);
    } catch {
      toast.error('Failed to start research');
    } finally {
      setCreateLoading(false);
    }
  }, []);

  // Write — opens options modal
  const handleWriteClick = useCallback((article: Article) => {
    setWriteTargetArticle(article);
  }, []);

  // Write confirmed — fires Write webhook, closes modal immediately
  const handleWriteSubmit = useCallback(async (article: Article, options: WriteOptions) => {
    setWriteLoading(true);
    setWriteTargetArticle(null);
    toast.success(`Write initiated for "${article.title}"`);
    writeArticle({
      articleId: String(article.id),
      title: article.title ?? '',
      word_limit: options.word_limit,
      keywords: options.keywords,
      website: options.website,
      model: options.model,
      instructions: options.instructions,
    }).catch(() => toast.error('Write webhook failed'));
    setWriteLoading(false);
  }, []);

  // Rewrite — opens options modal
  const handleRewriteClick = useCallback((article: Article) => {
    setRewriteTargetArticle(article);
  }, []);

  // Rewrite confirmed — fires Rewrite webhook only, Supabase updated by webhook
  const handleRewriteSubmit = useCallback(async (article: Article, options: RewriteOptions) => {
    setRewriteLoading(true);
    try {
      await rewriteArticle({
        articleId: String(article.id),
        title: article.title ?? '',
        model: options.model,
        instructions: options.instructions,
      });
      setRewriteTargetArticle(null);
      toast.success(`Rewrite initiated for "${article.title}"`);
    } catch {
      toast.error('Rewrite webhook failed');
    } finally {
      setRewriteLoading(false);
    }
  }, []);

  // Generalize — fires webhook directly
  const handleGeneralize = useCallback(async (article: Article) => {
    setLoadingActions(prev => new Map(prev).set(article.id, 'generalize'));
    try {
      await generalizeArticle({ articleId: String(article.id), title: article.title ?? '' });
      toast.success(`Generalize initiated for "${article.title}"`);
    } catch {
      toast.error('Failed to initiate generalize');
    } finally {
      setLoadingActions(prev => {
        const next = new Map(prev);
        next.delete(article.id);
        return next;
      });
    }
  }, []);

  // Delete — opens confirmation modal
  const handleDeleteClick = useCallback((article: Article) => {
    setDeleteTargetArticle(article);
  }, []);

  // Delete confirmed — only Supabase delete stays here
  const handleDeleteConfirm = useCallback(async (id: number) => {
    setDeleteLoading(true);
    try {
      await deleteArticleDb(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteTargetArticle(null);
      toast.success('Article deleted');
    } catch {
      toast.error('Failed to delete article');
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadArticles();
    toast.success('Dashboard refreshed');
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />

      <Navbar onCreateClick={() => setShowCreateModal(true)} onRefresh={handleRefresh} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards articles={articles} />

        <SearchToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          businessFilter={businessFilter}
          onBusinessFilterChange={setBusinessFilter}
          businesses={businesses}
        />

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading articles...</span>
            </div>
          </div>
        ) : (
          <ArticleTable
            articles={filteredArticles}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onViewContent={handleViewContent}
            onWrite={handleWriteClick}
            onRewrite={handleRewriteClick}
            onGeneralize={handleGeneralize}
            onDelete={handleDeleteClick}
            loadingActions={loadingActions}
          />
        )}
      </main>

      <ContentModal
        key={contentArticle?.id ?? 'none'}
        article={contentArticle}
        isPosted={contentArticle ? postedArticleIds.has(contentArticle.id) : false}
        onPosted={(id) => setPostedArticleIds(prev => new Set(prev).add(id))}
        onUnposted={(id) => setPostedArticleIds(prev => { const next = new Set(prev); next.delete(id); return next; })}
        onClose={() => setContentArticle(null)}
      />

      <CreateArticleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateArticle}
        loading={createLoading}
      />

      <WriteOptionsModal
        article={writeTargetArticle}
        onClose={() => setWriteTargetArticle(null)}
        onSubmit={handleWriteSubmit}
        loading={writeLoading}
      />

      <RewriteOptionsModal
        article={rewriteTargetArticle}
        onClose={() => setRewriteTargetArticle(null)}
        onSubmit={handleRewriteSubmit}
        loading={rewriteLoading}
      />

      <DeleteConfirmModal
        article={deleteTargetArticle}
        onClose={() => setDeleteTargetArticle(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
