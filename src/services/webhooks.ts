import axios from 'axios';
import { CreateArticlePayload, WritePayload, RewritePayload, GeneralizePayload } from '../data/types';

const WEBHOOK_BASE = 'https://primary-production-6722.up.railway.app/webhook';

const TIMEOUT = 15000;

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
