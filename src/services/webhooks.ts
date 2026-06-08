import axios from 'axios';
import { CreateArticlePayload, WritePayload, RewritePayload, GeneralizePayload } from '../data/types';

const WEBHOOK_BASE = 'https://primary-production-6722.up.railway.app/webhook';

const TIMEOUT = 600000;

// Strip metadata sections (Meta Title, Meta Description, Alternate Titles) that
// appear after the article body, then format the remaining content using the
// ArticleBody markdown syntax (## H2, ### H3, > blockquote, • bullet, **bold**, --- HR).
function formatArticleBody(raw: string): string {
  // Cut off at the first metadata marker
  const metaMarkers = [
    /^meta title\b/im,
    /^meta description\b/im,
    /^alternate titles\b/im,
  ];
  let cutAt = raw.length;
  for (const marker of metaMarkers) {
    const match = marker.exec(raw);
    if (match && match.index < cutAt) {
      cutAt = match.index;
    }
  }
  return raw.slice(0, cutAt).trimEnd();
}

export async function postToBuildHawk(article: { id: number; title: string; content: string; imageUrl?: string }) {
  const body = formatArticleBody(article.content);
  const content = article.imageUrl ? `${article.imageUrl}\n\n${body}` : body;
  const response = await axios.post(
    `${WEBHOOK_BASE}/postarticletobuildhawk`,
    { articleId: String(article.id), title: article.title, content },
    { timeout: TIMEOUT }
  );
  return response.data;
}

export async function generateArticleImage(article: { id: number; title: string; content: string }): Promise<Blob> {
  const body = formatArticleBody(article.content);
  const response = await axios.post(
    `${WEBHOOK_BASE}/sample-article-generate-image`,
    { articleId: String(article.id), title: article.title, content: body },
    { timeout: TIMEOUT, responseType: 'blob' }
  );
  return response.data;
}

export async function deletePostedBuildHawkArticle(article: { id: number; title: string; content: string }) {
  const body = formatArticleBody(article.content);
  const response = await axios.post(
    `${WEBHOOK_BASE}/delete-posted-article-from-github-buildhawk`,
    { articleId: String(article.id), title: article.title, content: body },
    { timeout: TIMEOUT }
  );
  return response.data;
}

export async function createArticle(payload: CreateArticlePayload) {
  const response = await axios.post(`${WEBHOOK_BASE}/Research-sampleongoing`, payload, { timeout: TIMEOUT });
  return response.data;
}

export async function writeArticle(payload: WritePayload) {
  const response = await axios.post(`${WEBHOOK_BASE}/Write-sampleongoing`, payload, { timeout: TIMEOUT });
  return response.data;
}

export async function rewriteArticle(payload: RewritePayload) {
  const response = await axios.post(`${WEBHOOK_BASE}/rewrite-sampleongoing`, payload, { timeout: TIMEOUT });
  return response.data;
}

export async function generalizeArticle(payload: GeneralizePayload) {
  const response = await axios.post(`${WEBHOOK_BASE}/generalize-sampleongoing`, payload, { timeout: TIMEOUT });
  return response.data;
}

export async function researchArticle(topic: string) {
  const response = await axios.post(`${WEBHOOK_BASE}/Research-sampleongoing`, { topic }, { timeout: TIMEOUT });
  return response.data;
}
