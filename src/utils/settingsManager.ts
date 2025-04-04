/**
 * 設定管理ユーティリティ
 */
import { DEFAULT_ZETTELKASTEN_CONFIG, DEFAULT_UI_CONFIG } from '@/config';
import type { ZettelkastenConfig } from '@/types/zettelkasten';
import type { UIConfig } from '@/config';

// ローカルストレージのキー
const ZETTELKASTEN_STORAGE_KEY = 'wiki-zettelkasten-config';
const UI_STORAGE_KEY = 'wiki-ui-config';

/**
 * Zettelkasten設定を取得
 * @returns Zettelkasten設定オブジェクト
 */
export function getZettelkastenConfig(): ZettelkastenConfig {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return DEFAULT_ZETTELKASTEN_CONFIG;
  }
  
  try {
    // ローカルストレージから設定を取得
    const storedConfig = localStorage.getItem(ZETTELKASTEN_STORAGE_KEY);
    
    if (storedConfig) {
      // 保存されている設定を使用
      const parsedConfig = JSON.parse(storedConfig) as Partial<ZettelkastenConfig>;
      return { ...DEFAULT_ZETTELKASTEN_CONFIG, ...parsedConfig };
    }
  } catch (error) {
    console.error('Zettelkasten設定の読み込みに失敗しました:', error);
  }
  
  return DEFAULT_ZETTELKASTEN_CONFIG;
}

/**
 * Zettelkasten設定を保存
 * @param config 保存する設定
 */
export function saveZettelkastenConfig(config: Partial<ZettelkastenConfig>): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // 現在の設定と新しい設定をマージ
    const currentConfig = getZettelkastenConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // ローカルストレージに保存
    localStorage.setItem(ZETTELKASTEN_STORAGE_KEY, JSON.stringify(newConfig));
    
    // カスタムイベントを発火して設定変更を通知
    const event = new CustomEvent('zettelkasten-config-changed', { detail: newConfig });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Zettelkasten設定の保存に失敗しました:', error);
  }
}

/**
 * UI設定を取得
 * @returns UI設定オブジェクト
 */
export function getUIConfig(): UIConfig {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return DEFAULT_UI_CONFIG;
  }
  
  try {
    // ローカルストレージから設定を取得
    const storedConfig = localStorage.getItem(UI_STORAGE_KEY);
    
    if (storedConfig) {
      // 保存されている設定を使用
      const parsedConfig = JSON.parse(storedConfig) as Partial<UIConfig>;
      return { ...DEFAULT_UI_CONFIG, ...parsedConfig };
    }
  } catch (error) {
    console.error('UI設定の読み込みに失敗しました:', error);
  }
  
  return DEFAULT_UI_CONFIG;
}

/**
 * UI設定を保存
 * @param config 保存する設定
 */
export function saveUIConfig(config: Partial<UIConfig>): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // 現在の設定と新しい設定をマージ
    const currentConfig = getUIConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // ローカルストレージに保存
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(newConfig));
    
    // CSS変数を設定
    applyUIConfig(newConfig);
    
    // カスタムイベントを発火して設定変更を通知
    const event = new CustomEvent('ui-config-changed', { detail: newConfig });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('UI設定の保存に失敗しました:', error);
  }
}

/**
 * UI設定をCSSに適用
 * @param config UI設定
 */
export function applyUIConfig(config: UIConfig): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  const root = document.documentElement;
  
  // サイドバーの幅を設定
  root.style.setProperty('--sidebar-width', `${config.sidebarWidth}px`);
  
  // コンテンツの最大幅を設定
  root.style.setProperty('--content-max-width', `${config.contentMaxWidth}px`);
}

/**
 * 設定の初期化（アプリケーション起動時に呼び出す）
 */
export function initializeSettings(): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return;
  }
  
  // UI設定を適用
  const uiConfig = getUIConfig();
  applyUIConfig(uiConfig);
}
