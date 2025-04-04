/**
 * GitHub APIから取得するIssueデータの型定義
 */
export interface IssueData {
  number: number;
  title: string;
  body: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: Label[];
  state: 'open' | 'closed';
  user?: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  comments?: number;
  reactions?: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
}

/**
 * GitHub APIから取得するLabelデータの型定義
 */
export interface Label {
  name: string;
  color: string;
  description?: string;
}

/**
 * カテゴリーデータの型定義
 */
export interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  description?: string;
}

/**
 * コメントデータの型定義
 */
export interface Comment {
  id: number;
  body: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
}

/**
 * WikiページのMetaデータの型定義
 */
export interface WikiPageMeta {
  title: string;
  slug: string;
  issueNumber: number;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
  author?: string;
  authorAvatarUrl?: string;
}

/**
 * 検索結果アイテムの型定義
 */
export interface SearchResultItem {
  issueNumber: number;
  title: string;
  snippet: string;
  labels: Label[];
  slug: string;
}
