export interface Article {
  id: number;
  title: string;
  keyword: string;
  doc_link: string;
  status: string;
  content: string;
  word_limit: string;
  business_name: string;
  city: string;
  state: string;
  call_action: string;
  website: string;
  research: string;
  addkeyword: string;
  generalize: string;
}

export interface CreateArticlePayload {
  keyword: string;
  business_name: string;
  city: string;
  state: string;
  call_action: string;
  count: number;
}

export interface WritePayload {
  articleId: string;
  title: string;
  word_limit: string;
  keywords: string[];
  website: string;
  model: string;
  instructions: string;
}

export interface RewritePayload {
  articleId: string;
  title: string;
  model: string;
  instructions: string;
}

export interface GeneralizePayload {
  articleId: string;
  title: string;
}
