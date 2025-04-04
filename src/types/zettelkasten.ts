/**
 * Zettelkasten設定の型定義
 */
export interface ZettelkastenConfig {
  enabled: boolean;        // Zettelkastenモードを有効化するかどうか
  autoLinkKeywords: boolean;  // キーワードを自動的にリンクするかどうか
  highlightBidirectional: boolean; // 双方向リンクを強調表示するかどうか
  showBacklinks: boolean;  // バックリンク一覧を表示するかどうか
  keywordMinLength: number; // 自動リンクする最小キーワード長
}

/**
 * バックリンクの型定義
 */
export interface Backlink {
  title: string;
  slug: string;
  issueNumber: number;
  context: string;
  isBidirectional: boolean;
}

/**
 * リンク関係の型定義
 */
export interface LinkRelation {
  source: number; // issueNumber
  target: number; // issueNumber
  type: 'direct' | 'keyword' | 'bidirectional';
  weight: number; // 関連度
}

/**
 * ナレッジグラフのノード型定義
 */
export interface KnowledgeGraphNode {
  id: number; // issueNumber
  title: string;
  slug: string;
  category?: string;
  weight: number; // サイズに影響
  color?: string;
}

/**
 * ナレッジグラフのエッジ型定義
 */
export interface KnowledgeGraphEdge {
  source: number; // issueNumber
  target: number; // issueNumber
  type: 'direct' | 'keyword' | 'bidirectional';
  strength: number; // 線の太さに影響
}

/**
 * ナレッジグラフデータ型定義
 */
export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}
