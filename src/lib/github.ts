/**
 * GitHub APIとの通信を処理するモジュール
 */
import { REPO_OWNER, REPO_NAME, CACHE_TTL, SOURCE_REPO_OWNER, SOURCE_REPO_NAME } from '@/config';
import type { IssueData, Comment } from '@/types/github';

// キャッシュオブジェクト
interface CacheStore {
  issues?: IssueData[];
  timestamp?: number;
  singleIssues: Record<number, { issue: IssueData; timestamp: number }>;
  comments: Record<number, { data: Comment[]; timestamp: number }>;
}

const cache: CacheStore = {
  singleIssues: {},
  comments: {}
};

// サーバーAPIを使ってIssueを取得する関数
export async function getIssues(): Promise<IssueData[]> {
  try {
    // キャッシュが有効な場合はキャッシュを返す
    if (cache.issues && cache.timestamp && (Date.now() - cache.timestamp < CACHE_TTL)) {
      console.log('Using cached issues');
      return cache.issues;
    }

    console.log('Fetching issues from GitHub API');
    
    // GitHub APIから直接取得を試みる（OPEN状態のIssueのみ）
    const owner = SOURCE_REPO_OWNER || REPO_OWNER;
    const repo = SOURCE_REPO_NAME || REPO_NAME;
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100`);
    
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status}`);
    }
    
    // レスポンスをJSONとしてパース
    const data = await response.json();
    
    // プルリクエストを除外
    const issues = data.filter((issue: any) => !issue.pull_request) as IssueData[];
    console.log(`Fetched ${issues.length} issues from GitHub API`);
    
    // キャッシュを更新
    cache.issues = issues;
    cache.timestamp = Date.now();
    
    return issues;
  } catch (error) {
    console.error('Error fetching issues:', error);
    // 静的データにフォールバック
    try {
      // フォールバックデータを取得
      const response = await fetch('/data/issues.json');
      if (!response.ok) {
        throw new Error('Failed to load fallback data');
      }
      const staticData = await response.json() as IssueData[];
      // 静的データからOpen状態のIssueのみをフィルタリング
      return staticData.filter(issue => issue.state === 'open');
    } catch (fallbackError) {
      console.error('Error loading fallback data:', fallbackError);
      return []; // 最終フォールバックとして空配列を返す
    }
  }
}

// 特定のIssueを取得する関数
export async function getIssue(issueNumber: number): Promise<IssueData | null> {
  try {
    // キャッシュをチェック
    const cachedIssue = cache.singleIssues[issueNumber];
    if (cachedIssue && (Date.now() - cachedIssue.timestamp < CACHE_TTL)) {
      return cachedIssue.issue;
    }
    
    // 全issueを取得してから目的のものを検索
    const allIssues = await getIssues();
    const issue = allIssues.find(i => i.number === issueNumber);
    
    if (!issue) {
      console.warn(`Issue #${issueNumber} not found in issues list, checking API directly`);
      
      // 直接そのIssueをAPIから取得
      try {
        const owner = SOURCE_REPO_OWNER || REPO_OWNER;
        const repo = SOURCE_REPO_NAME || REPO_NAME;
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`);
        
        if (!response.ok) {
          throw new Error(`GitHub API Error: ${response.status}`);
        }
        
        const singleIssue = await response.json() as IssueData;
        
        // Pull Requestでないか確認
        if ('pull_request' in singleIssue) {
          return null;
        }
        
        // キャッシュを更新
        cache.singleIssues[issueNumber] = {
          issue: singleIssue,
          timestamp: Date.now()
        };
        
        return singleIssue;
      } catch (error) {
        console.error(`Error fetching single issue #${issueNumber}:`, error);
        return null;
      }
    }
    
    // キャッシュを更新
    cache.singleIssues[issueNumber] = {
      issue,
      timestamp: Date.now()
    };
    
    return issue;
  } catch (error) {
    console.error(`Error fetching issue #${issueNumber}:`, error);
    // 静的データから再検索
    try {
      const response = await fetch('/data/issues.json');
      if (!response.ok) {
        throw new Error('Failed to load fallback data');
      }
      const staticData = await response.json() as IssueData[];
      const staticIssue = staticData.find(i => i.number === issueNumber);
      return staticIssue || null;
    } catch (fallbackError) {
      console.error('Error loading fallback data:', fallbackError);
      return null;
    }
  }
}

// Issueのコメントを取得する関数
export async function getIssueComments(issueNumber: number): Promise<Comment[]> {
  try {
    // キャッシュをチェック
    const cachedComments = cache.comments[issueNumber];
    if (cachedComments && (Date.now() - cachedComments.timestamp < CACHE_TTL)) {
      return cachedComments.data;
    }
    
    console.log(`Fetching comments for issue #${issueNumber} from GitHub API`);
    
    const owner = SOURCE_REPO_OWNER || REPO_OWNER;
    const repo = SOURCE_REPO_NAME || REPO_NAME;
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
    
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status}`);
    }
    
    const comments = await response.json() as Comment[];
    
    // キャッシュを更新
    cache.comments[issueNumber] = {
      data: comments,
      timestamp: Date.now()
    };
    
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for issue #${issueNumber}:`, error);
    return [];
  }
}

// ラベルからカテゴリーを抽出する関数
export function extractCategories(issues: IssueData[]): { id: string; name: string; count: number; color: string; description?: string }[] {
  const categories = new Map<string, { id: string; name: string; count: number; color: string; description?: string }>();
  
  // すべてのIssueからユニークなラベルを抽出
  issues.forEach(issue => {
    issue.labels?.forEach(label => {
      const id = label.name.toLowerCase().replace(/[^\w]/g, '-');
      
      if (categories.has(id)) {
        // 既存のカテゴリはカウントを増やす
        const category = categories.get(id)!;
        category.count += 1;
      } else {
        // 新しいカテゴリを追加
        categories.set(id, {
          id,
          name: label.name,
          count: 1,
          color: label.color,
          description: label.description
        });
      }
    });
  });
  
  // カテゴリーをカウント降順でソート
  return Array.from(categories.values())
    .sort((a, b) => b.count - a.count);
}

// スラッグから対応するIssueを検索する関数
export function findIssueBySlug(issues: IssueData[], slug: string): IssueData | undefined {
  return issues.find(issue => {
    const issueSlug = generateSlug(issue.title);
    return issueSlug === slug;
  });
}

// スラッグを生成する関数（改良版）
export function generateSlug(title: string): string {
  // タイトルに日本語が含まれるか、または空のスラッグになる場合
  if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(title) || 
      title.replace(/[^\w\s-]/g, '').trim() === '') {
    // 基本スラッグを生成（日本語文字を保持）
    let baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
      
    // 空のスラッグになる場合は、\"issue\"という文字を追加
    if (baseSlug === '') {
      baseSlug = 'issue';
    }
    
    return encodeURIComponent(baseSlug);
  }
  
  // 英数字のみのタイトルの場合は従来の処理
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// IDからスラッグを生成する関数
export function slugFromId(id: number): string {
  return `issue-${id}`;
}
