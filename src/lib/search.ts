/**
 * 検索機能のユーティリティ関数
 */
import type { IssueData, SearchResultItem } from '@/types/github';
import { generateSlug } from './github';

/**
 * 検索文字列に一致するIssueをフィルタリングする
 * @param issues - Issueの配列
 * @param query - 検索クエリ
 * @returns フィルタリングされたIssue配列
 */
export function filterIssuesByQuery(issues: IssueData[], query: string): SearchResultItem[] {
  if (!query || query.length < 2 || !Array.isArray(issues)) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  // クエリに一致するIssueをフィルタリング
  const matchedIssues = issues.filter(issue => 
    (issue.title && issue.title.toLowerCase().includes(lowerQuery)) || 
    (issue.body && issue.body.toLowerCase().includes(lowerQuery))
  );
  
  // 検索結果を整形
  return matchedIssues.map(issue => {
    const slug = generateSlug(issue.title);
    const snippet = extractContext(issue.body, query);
    
    return {
      issueNumber: issue.number,
      title: issue.title,
      snippet,
      labels: issue.labels,
      slug
    };
  });
}

/**
 * テキスト内の検索クエリをハイライトする
 * @param text - 対象テキスト
 * @param query - 検索クエリ
 * @returns ハイライトされたHTML
 */
export function highlightText(text: string, query: string): string {
  if (!text || !query) return '';
  
  try {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  } catch (error) {
    console.error('ハイライト処理でエラーが発生しました:', error);
    return text;
  }
}

/**
 * 検索クエリに一致するテキストの前後のコンテキストを抽出する
 * @param text - 対象テキスト
 * @param query - 検索クエリ
 * @param contextLength - 前後のコンテキストの長さ
 * @returns 抽出されたテキスト
 */
export function extractContext(text: string, query: string, contextLength = 80): string {
  if (!text || !query) return '';
  
  try {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);
    
    if (matchIndex >= 0) {
      const startPos = Math.max(0, matchIndex - contextLength);
      const endPos = Math.min(text.length, matchIndex + lowerQuery.length + contextLength);
      let excerpt = text.substring(startPos, endPos);
      
      // 前後が切れている場合は省略記号を追加
      if (startPos > 0) excerpt = '...' + excerpt;
      if (endPos < text.length) excerpt = excerpt + '...';
      
      return excerpt;
    }
    
    // 本文にキーワードが含まれない場合は先頭を表示
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  } catch (error) {
    console.error('コンテキスト抽出でエラーが発生しました:', error);
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  }
}

/**
 * 正規表現用に文字列をエスケープする
 * @param string - エスケープする文字列
 * @returns エスケープされた文字列
 */
export function escapeRegExp(string: string): string {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

/**
 * 検索結果のスコアリングを行う
 * @param issues - Issueの配列
 * @param query - 検索クエリ
 * @returns スコア付けされた検索結果
 */
export function scoreSearchResults(
  issues: IssueData[],
  query: string
): { issue: IssueData; score: number }[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: { issue: IssueData; score: number }[] = [];
  
  issues.forEach(issue => {
    let score = 0;
    const titleLower = issue.title.toLowerCase();
    const bodyLower = issue.body.toLowerCase();
    
    // タイトルに完全一致
    if (titleLower === lowerQuery) {
      score += 100;
    }
    // タイトルに部分一致
    else if (titleLower.includes(lowerQuery)) {
      score += 50;
    }
    
    // 本文に一致
    if (bodyLower.includes(lowerQuery)) {
      // クエリの出現回数をカウント
      const matches = bodyLower.match(new RegExp(escapeRegExp(lowerQuery), 'g'));
      if (matches) {
        score += matches.length * 2;
      }
    }
    
    // ラベルに一致
    const matchingLabels = issue.labels?.filter(
      label => label.name.toLowerCase().includes(lowerQuery)
    );
    if (matchingLabels && matchingLabels.length > 0) {
      score += matchingLabels.length * 5;
    }
    
    // 最近更新されたものは少しボーナス
    const updateDate = new Date(issue.updated_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 30) {
      score += Math.max(0, (30 - daysDiff) / 10);
    }
    
    if (score > 0) {
      results.push({ issue, score });
    }
  });
  
  // スコア順にソート
  return results.sort((a, b) => b.score - a.score);
}
