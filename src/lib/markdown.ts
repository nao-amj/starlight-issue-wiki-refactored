/**
 * マークダウン処理のユーティリティ関数
 */
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { DEFAULT_ZETTELKASTEN_CONFIG } from '@/config';
import { convertWikiLinks, autoLinkKeywords } from './zettelkasten';
import type { IssueData } from '@/types/github';
import type { ZettelkastenConfig } from '@/types/zettelkasten';

let markedInitialized = false;

/**
 * marked ライブラリの初期化
 */
export function initializeMarked(): void {
  if (markedInitialized) return;
  
  // gfmHeadingIdプラグインを設定
  marked.use(gfmHeadingId());
  
  // シンタックスハイライトの設定
  // v12+ では marked.parse() に直接オプションを渡す形式に変更されているので
  // setOptions() の使用をやめます
  
  markedInitialized = true;
}

/**
 * マークダウンをHTMLに変換する
 * @param markdown - 変換対象のマークダウン
 * @returns 変換後のHTML
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  initializeMarked();
  
  // marked.parseはPromiseを返す可能性があるため、同期的に処理
  // highlight オプションはここに直接渡す
  const html = marked.parse(markdown, { 
    async: false,
    highlight: function(code: string) {
      // シンタックスハイライトはクライアント側で処理
      return code;
    }
  }) as string;
  
  return html;
}

/**
 * マークダウンをZettelkastenモードを使用してHTMLに変換する
 * @param markdown - 変換対象のマークダウン
 * @param issues - 利用可能なIssueの配列
 * @param config - Zettelkasten設定
 * @param baseUrl - ベースURL
 * @param currentIssueNumber - 現在表示中のIssue番号
 * @returns 変換後のHTML
 */
export function markdownToHtmlWithZettelkasten(
  markdown: string,
  issues: IssueData[],
  config: ZettelkastenConfig = DEFAULT_ZETTELKASTEN_CONFIG,
  baseUrl: string,
  currentIssueNumber: number
): string {
  if (!markdown) return '';
  
  // 標準のマークダウン処理
  let html = markdownToHtml(markdown);
  
  // Zettelkastenモードが有効な場合の処理
  if (config.enabled) {
    // 標準のWikiリンク [[ページ名]] を処理
    html = convertWikiLinks(html, issues, baseUrl);
    
    // キーワードの自動リンク処理
    if (config.autoLinkKeywords) {
      html = autoLinkKeywords(html, issues, config, baseUrl, currentIssueNumber);
    }
  }
  
  return html;
}

/**
 * マークダウンからプレーンテキストを抽出する（検索用）
 * @param markdown - 対象のマークダウン
 * @returns 抽出されたプレーンテキスト
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  
  // HTMLエンティティをデコード
  const decoded = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // マークダウン記法を削除
  return decoded
    // ヘッダー削除
    .replace(/#{1,6}\s+/g, '')
    // リンク記法削除
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 画像記法削除
    .replace(/!\[([^\]]+)\]\([^)]+\)/g, '$1')
    // コードブロック削除
    .replace(/```[\s\S]*?```/g, '')
    // インラインコード削除
    .replace(/`([^`]+)`/g, '$1')
    // 強調削除
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    // イタリック削除
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // リスト記号削除
    .replace(/^\s*[-*+]\s+/gm, '')
    // 番号付きリスト削除
    .replace(/^\s*\d+\.\s+/gm, '')
    // Wiki記法削除
    .replace(/\[\[(.*?)\]\]/g, '$1')
    // HTML削除
    .replace(/<[^>]+>/g, '')
    // 複数の空白を単一の空白に
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * マークダウンから見出しのリストを抽出する（目次生成用）
 * @param markdown - 対象のマークダウン
 * @returns 見出しリスト（レベルとテキストのペア）
 */
export function extractHeadings(markdown: string): { level: number; text: string; id: string }[] {
  if (!markdown) return [];
  
  const headings: { level: number; text: string; id: string }[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // IDを生成（gfmHeadingIdと同じロジック）
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    headings.push({ level, text, id });
  }
  
  return headings;
}
