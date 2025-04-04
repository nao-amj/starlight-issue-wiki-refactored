/**
 * テーマ管理ユーティリティ
 */
import { DEFAULT_THEME_CONFIG, type ThemeConfig } from '@/config';

// ローカルストレージのキー
const THEME_STORAGE_KEY = 'wiki-theme-config';

/**
 * 現在のテーマ設定を取得
 * @returns テーマ設定オブジェクト
 */
export function getThemeConfig(): ThemeConfig {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_CONFIG;
  }
  
  try {
    // ローカルストレージから設定を取得
    const storedConfig = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (storedConfig) {
      // 保存されている設定を使用
      const parsedConfig = JSON.parse(storedConfig) as Partial<ThemeConfig>;
      return { ...DEFAULT_THEME_CONFIG, ...parsedConfig };
    }
  } catch (error) {
    console.error('テーマ設定の読み込みに失敗しました:', error);
  }
  
  return DEFAULT_THEME_CONFIG;
}

/**
 * テーマ設定を保存
 * @param config 保存するテーマ設定
 */
export function saveThemeConfig(config: Partial<ThemeConfig>): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // 現在の設定と新しい設定をマージ
    const currentConfig = getThemeConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // ローカルストレージに保存
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newConfig));
    
    // ダークモード設定を適用
    applyDarkMode(newConfig.darkMode);
    
    // CSS変数を設定
    applyCssVariables(newConfig);
  } catch (error) {
    console.error('テーマ設定の保存に失敗しました:', error);
  }
}

/**
 * ダークモードの切り替え
 * @param isDark ダークモードにする場合はtrue
 */
export function applyDarkMode(isDark: boolean): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

/**
 * CSS変数を設定してテーマを適用
 * @param config テーマ設定
 */
export function applyCssVariables(config: ThemeConfig): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  const root = document.documentElement;
  
  // 基本カラーの設定
  root.style.setProperty('--color-primary', config.primaryColor);
  root.style.setProperty('--color-secondary', config.secondaryColor);
  
  // フォントファミリーの設定
  root.style.setProperty('--font-family', config.fontFamily);
  
  // ダークモードに応じた色の設定
  if (config.darkMode) {
    // ダークモード用のカラー
    root.style.setProperty('--color-bg', '#1a1a1a');
    root.style.setProperty('--color-text', '#e0e0e0');
    root.style.setProperty('--color-border', '#444444');
    root.style.setProperty('--color-card-bg', '#2a2a2a');
    root.style.setProperty('--color-sidebar-bg', '#252525');
    root.style.setProperty('--color-link', '#a989ff');
    root.style.setProperty('--color-header-bg', '#141414');
  } else {
    // ライトモード用のカラー
    root.style.setProperty('--color-bg', '#f9f9f9');
    root.style.setProperty('--color-text', '#333333');
    root.style.setProperty('--color-border', '#eeeeee');
    root.style.setProperty('--color-card-bg', '#ffffff');
    root.style.setProperty('--color-sidebar-bg', '#ffffff');
    root.style.setProperty('--color-link', config.primaryColor);
    root.style.setProperty('--color-header-bg', config.primaryColor);
  }
}

/**
 * テーマの初期化（アプリケーション起動時に呼び出す）
 */
export function initializeTheme(): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    return;
  }
  
  // 保存されたテーマ設定を取得
  const config = getThemeConfig();
  
  // ダークモードを適用
  applyDarkMode(config.darkMode);
  
  // CSS変数を設定
  applyCssVariables(config);
}

/**
 * システムのダークモード設定を監視するためのイベントリスナーを設定
 */
export function setupSystemThemeListener(): void {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  // システムのカラースキーム変更を検出するメディアクエリ
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 変更イベントのリスナー
  const handleChange = (e: MediaQueryListEvent): void => {
    const config = getThemeConfig();
    const newConfig = { ...config, darkMode: e.matches };
    saveThemeConfig(newConfig);
  };
  
  // リスナーを登録
  mediaQuery.addEventListener('change', handleChange);
}
