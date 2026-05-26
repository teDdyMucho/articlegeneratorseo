import { supabase } from '../lib/supabase';
import { Article } from '../data/types';

export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('Research')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertArticle(article: {
  title: string;
  business_name: string;
  keyword: string;
  city?: string;
  state?: string;
  call_action?: string;
  doc_link?: string;
  content?: string;
  status?: string;
  word_limit?: string;
  website?: string;
  research?: string;
  addkeyword?: string;
  generalize?: string;
}): Promise<Article> {
  const { data, error } = await supabase
    .from('Research')
    .insert(article)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArticle(id: number): Promise<void> {
  const { error } = await supabase.from('Research').delete().eq('id', id);
  if (error) throw error;
}

export async function updateArticle(id: number, updates: Partial<Article>): Promise<Article> {
  const { data, error } = await supabase
    .from('Research')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
