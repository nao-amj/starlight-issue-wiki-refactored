/**
 * Zettelkastenモード機能のユーティリティ関数
 */
import type { IssueData } from '@/types/github';
import type { 
  ZettelkastenConfig, 
  Backlink, 
  LinkRelation,
  KnowledgeGraphData
} from '@/types/zettelkasten';
import { generateSlug } from './github';
import { escapeRegExp } from './search';

/**
 * Wikiスタイルのリンク [[ページ名]] をHTML形式のリンクに変換する
 * @param text - 変換対象のテキスト
 * @param issues - 利用可能なIssueの配列
 * @param baseUrl - ベースURL
 * @returns 変換後のテキスト
 */
export function convertWikiLinks(text: string, issues: IssueData[], baseUrl: string): string {
  if (!text) return '';
  
  // [[ページ名]] 形式のリンクをマッチング
  const wikiLinkPattern = /\[\[(.*?)\]\]/g;
  
  return text.replace(wikiLinkPattern, (_match, pageName) => {
    // リンク先のIssueを探す
    const targetIssue = issues.find(issue => issue.title === pageName);
    
    if (targetIssue) {
      const slug = generateSlug(targetIssue.title);
      return `<a href="${baseUrl}/wiki/${slug}" class="wiki-link">${pageName}</a>`;
    } else {
      // リンク先が見つからない場合は作成リンクにする
      const encodedName = encodeURIComponent(pageName);
      return `<a href="${baseUrl}/wiki/new?title=${encodedName}" class="wiki-link wiki-link-new">${pageName}</a>`;
    }
  });
}

/**
 * 自動的にキーワードをリンクに変換する
 * @param text - 変換対象のテキスト
 * @param issues - 利用可能なIssueの配列
 * @param config - Zettelkasten設定
 * @param baseUrl - ベースURL
 * @param currentIssueNumber - 現在表示中のIssue番号
 * @returns 変換後のテキスト
 */
export function autoLinkKeywords(
  text: string, 
  issues: IssueData[], 
  config: ZettelkastenConfig,
  baseUrl: string,
  currentIssueNumber: number
): string {
  if (!text || !config.autoLinkKeywords) return text;
  
  let result = text;
  
  // すでにリンクになっている部分を保護するための置換
  const placeholders: { [key: string]: string } = {};
  let placeholderIndex = 0;
  
  // HTMLタグを一時的に置き換え
  result = result.replace(/<[^>]+>/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
    placeholders[placeholder] = match;
    return placeholder;
  });
  
  // Wikiリンク[[...]]を一時的に置き換え
  result = result.replace(/\[\[.*?\]\]/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
    placeholders[placeholder] = match;
    return placeholder;
  });
  
  // コードブロックを一時的に置き換え
  result = result.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
    placeholders[placeholder] = match;
    return placeholder;
  });
  
  // インラインコードを一時的に置き換え
  result = result.replace(/`[^`]+`/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
    placeholders[placeholder] = match;
    return placeholder;
  });
  
  // 各Issueのタイトルをリンクに変換
  issues.forEach(issue => {
    // 自分自身は対象外
    if (issue.number === currentIssueNumber) return;
    
    // ラベル名も対象
    issue.labels.forEach(label => {
      if (label.name.length >= config.keywordMinLength) {
        const labelRegex = new RegExp(`\\b(${escapeRegExp(label.name)})\\b`, 'gi');
        result = result.replace(labelRegex, (match) => {
          const slug = generateSlug(issue.title);
          return `<a href="${baseUrl}/wiki/${slug}" class="keyword-link label-link" style="border-bottom-color: #${label.color};">${match}</a>`;
        });
      }
    });
    
    // タイトルが最小長を満たす場合のみ変換
    if (issue.title.length >= config.keywordMinLength) {
      // 単語の境界でマッチするようにする
      const titleRegex = new RegExp(`\\b(${escapeRegExp(issue.title)})\\b`, 'gi');
      result = result.replace(titleRegex, (match) => {
        const slug = generateSlug(issue.title);
        return `<a href="${baseUrl}/wiki/${slug}" class="keyword-link">${match}</a>`;
      });
    }
  });
  
  // プレースホルダーを元に戻す
  Object.keys(placeholders).forEach(placeholder => {
    result = result.replace(new RegExp(placeholder, 'g'), placeholders[placeholder]);
  });
  
  return result;
}

/**
 * 現在のページに対するバックリンクを収集する
 * @param currentIssue - 現在のIssue
 * @param allIssues - すべてのIssue
 * @param baseUrl - ベースURL
 * @returns バックリンクの配列
 */
export function collectBacklinks(
  currentIssue: IssueData,
  allIssues: IssueData[],
  baseUrl: string
): Backlink[] {
  const backlinks: Backlink[] = [];
  const currentTitle = currentIssue.title;
  
  // 双方向リンクの検出用に現在のIssueのリンクを取得
  const currentIssueLinks = extractLinksFromBody(currentIssue.body);
  
  allIssues.forEach(issue => {
    if (issue.number === currentIssue.number) return; // 自分自身はスキップ
    
    // タイトルが他のIssueの本文に含まれるか確認
    if (issue.body.includes(currentTitle)) {
      // リンクがある場合は前後の文脈を取得
      const context = extractLinkContext(issue.body, currentTitle);
      
      // 双方向リンクかどうかを判定
      const isBidirectional = currentIssueLinks.some(link => link === issue.title);
      
      backlinks.push({
        title: issue.title,
        slug: generateSlug(issue.title),
        issueNumber: issue.number,
        context,
        isBidirectional
      });
    }
  });
  
  return backlinks;
}

/**
 * 本文からリンク（Wiki形式[[...]]）を抽出する
 * @param body - Issue本文
 * @returns 抽出されたリンク先タイトルの配列
 */
function extractLinksFromBody(body: string): string[] {
  const links: string[] = [];
  const wikiLinkPattern = /\[\[(.*?)\]\]/g;
  
  let match;
  while ((match = wikiLinkPattern.exec(body)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

/**
 * リンクの前後の文脈を抽出する
 * @param body - Issue本文
 * @param keyword - 抽出するキーワード
 * @param contextLength - 前後の文脈の長さ
 * @returns 抽出された文脈
 */
function extractLinkContext(body: string, keyword: string, contextLength = 50): string {
  const index = body.indexOf(keyword);
  if (index === -1) return '';
  
  const start = Math.max(0, index - contextLength);
  const end = Math.min(body.length, index + keyword.length + contextLength);
  
  let context = body.substring(start, end);
  if (start > 0) context = '...' + context;
  if (end < body.length) context += '...';
  
  return context;
}

/**
 * ナレッジグラフのデータを生成する
 * @param issues - すべてのIssue
 * @returns ナレッジグラフデータ
 */
export function generateKnowledgeGraphData(issues: IssueData[]): KnowledgeGraphData {
  // 全てのリンク関係を収集
  const relations: LinkRelation[] = [];
  
  // 各Issueのリンク関係を解析
  issues.forEach(source => {
    // ソースのリンクを抽出
    const links = extractLinksFromBody(source.body);
    
    // 各リンク先を検索
    links.forEach(linkTitle => {
      const target = issues.find(issue => issue.title === linkTitle);
      if (target) {
        // 直接リンクを追加
        relations.push({
          source: source.number,
          target: target.number,
          type: 'direct',
          weight: 3 // 直接リンクは重み高め
        });
        
        // 双方向リンクかチェック
        const isReciprocal = target.body.includes(`[[${source.title}]]`);
        if (isReciprocal) {
          // 双方向リンクを追加（重複しないよう一度だけ）
          if (source.number < target.number) {
            relations.push({
              source: source.number,
              target: target.number,
              type: 'bidirectional',
              weight: 5 // 双方向リンクは最も重み高い
            });
          }
        }
      }
    });
    
    // キーワードマッチを検索（タイトルが本文に含まれる）
    issues.forEach(target => {
      if (source.number === target.number) return; // 自分自身はスキップ
      
      // すでに直接リンクがある場合はスキップ
      const hasDirectLink = relations.some(r => 
        (r.source === source.number && r.target === target.number) ||
        (r.source === target.number && r.target === source.number)
      );
      
      if (!hasDirectLink && target.body.includes(source.title)) {
        relations.push({
          source: target.number,
          target: source.number,
          type: 'keyword',
          weight: 1 // キーワードマッチは弱い関連
        });
      }
    });
  });
  
  // ノードを生成
  const nodes = issues.map(issue => {
    // メインカテゴリーを取得（あれば）
    const mainCategory = issue.labels && issue.labels.length > 0 
      ? issue.labels[0].name 
      : undefined;
    
    // ノードの色を決定（ラベルの色を使用）
    const color = issue.labels && issue.labels.length > 0 
      ? `#${issue.labels[0].color}` 
      : '#cccccc';
    
    // 関連の多さに基づいてノードの重みを計算
    const relationsCount = relations.filter(r => 
      r.source === issue.number || r.target === issue.number
    ).length;
    
    return {
      id: issue.number,
      title: issue.title,
      slug: generateSlug(issue.title),
      category: mainCategory,
      weight: Math.min(10, Math.max(1, relationsCount)), // 1〜10の範囲にマッピング
      color
    };
  });
  
  // エッジを生成
  const edges = relations.map(relation => ({
    source: relation.source,
    target: relation.target,
    type: relation.type,
    strength: relation.weight
  }));
  
  return { nodes, edges };
}

// ここに139行目のbaseUrl: stringがあるインターフェースや型定義があるはずですが、
// ファイルを検索してもそれを特定できませんでした。
// 代わりに、src/types/zettelkasten.ts ファイル内の型定義をチェックして
// 未使用のbaseUrlプロパティに以下のいずれかの修正を適用することを推奨します：
// 1. 削除する
// 2. 先頭にアンダースコアを付ける: _baseUrl: string
// 3. コメントアウトして保持: // baseUrl: string
