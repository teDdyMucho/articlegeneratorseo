import { motion } from 'framer-motion';
import { FileText, Sparkles, Link2, Loader2 } from 'lucide-react';
import { Article } from '../data/types';

interface StatsCardsProps {
  articles: Article[];
}

export default function StatsCards({ articles }: StatsCardsProps) {
  const total = articles.length;
  const newItems = articles.filter(a => a.status === 'new').length;
  const withLinks = articles.filter(a => a.doc_link).length;
  const processing = articles.filter(a => a.status === 'processing').length;

  const stats = [
    {
      label: 'Total Articles',
      value: total,
      dotColor: 'bg-blue-500',
      icon: FileText,
      gradient: 'from-blue-50 to-blue-100/50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'New Items',
      value: newItems,
      dotColor: 'bg-amber-500',
      icon: Sparkles,
      gradient: 'from-amber-50 to-amber-100/50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'With Links',
      value: withLinks,
      dotColor: 'bg-emerald-500',
      icon: Link2,
      gradient: 'from-emerald-50 to-emerald-100/50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Processing',
      value: processing,
      dotColor: 'bg-violet-500',
      icon: Loader2,
      gradient: 'from-violet-50 to-violet-100/50',
      iconColor: 'text-violet-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
          className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 border border-white/60 shadow-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${stat.dotColor}`} />
                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`${stat.iconColor} opacity-20`}>
              <stat.icon size={48} strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
