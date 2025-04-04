/**
 * Wiki関連の型定義
 */

// baseUrlプロパティを使用していなければ削除するか、以下のように修正してください
export interface WikiParams {
  slug: string;
  issueNumber?: number;
  // 使用していないプロパティにはアンダースコアを付けて警告を抑制
  _baseUrl?: string;
}
