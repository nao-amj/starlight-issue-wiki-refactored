/**
 * Wiki ルートパラメータの型定義
 */
export interface WikiParams {
  slug: string;
  issueNumber?: number;
  // baseUrl は使用されていないためアンダースコアをつけて未使用プロパティであることを明示
  _baseUrl?: string;
}
