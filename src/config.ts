/**
 * サイト全体の設定ファイル
 */
import type { ZettelkastenConfig } from '@/types/zettelkasten';

// ベースパスの設定
export const BASE_PATH = import.meta.env.BASE_URL || '/starlight-issue-wiki-refactored';

// APIのベースURL
export const API_BASE_URL = import.meta.env.DEV
  ? '/api' // 開発環境
  : `${BASE_PATH}/api`; // 本番環境

// GitHub リポジトリの情報
export const REPO_OWNER = 'nao-amj';
export const REPO_NAME = 'starlight-issue-wiki-refactored';
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

// サイト情報
export const SITE_TITLE = 'GitWiki Hub';
export const SITE_DESCRIPTION = 'GitHubのissueを使って管理するスマートなWikiプラットフォーム';

// ソースリポジトリ情報（issueを取得するリポジトリ - メインリポジトリと異なる場合に設定）
export const SOURCE_REPO_OWNER = 'nao-amj';
export const SOURCE_REPO_NAME = 'starlight-issue-wiki';
export const SOURCE_REPO_URL = `https://github.com/${SOURCE_REPO_OWNER}/${SOURCE_REPO_NAME}`;

// キャッシュ設定
export const CACHE_TTL = 5 * 60 * 1000; // 5分

// テーマ設定
export interface ThemeConfig {
  darkMode: boolean;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

// デフォルトのテーマ設定
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  darkMode: false,
  primaryColor: '#4d1a9e', // メインカラー
  secondaryColor: '#f0e6ff', // アクセントカラー
  fontFamily: 'system-ui, sans-serif',
};

// デフォルトのZettelkasten設定
export const DEFAULT_ZETTELKASTEN_CONFIG: ZettelkastenConfig = {
  enabled: true,
  autoLinkKeywords: true,
  highlightBidirectional: true,
  showBacklinks: true,
  keywordMinLength: 3
};

// UI設定
export interface UIConfig {
  sidebarWidth: number;
  contentMaxWidth: number;
  showComments: boolean;
  showTimeline: boolean;
}

// デフォルトのUI設定
export const DEFAULT_UI_CONFIG: UIConfig = {
  sidebarWidth: 250, // サイドバーの幅
  contentMaxWidth: 900, // コンテンツの最大幅
  showComments: true, // コメントを表示するかどうか
  showTimeline: true, // タイムラインを表示するかどうか
};
