import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // サイトのベースURLを設定
  site: 'https://nao-amj.github.io',
  base: '/starlight-issue-wiki-refactored',
  
  // 出力ディレクトリを明示的に指定
  outDir: './dist',
  
  // 静的サイトとして出力
  output: 'static',
  
  // ビルド時の詳細設定
  build: {
    format: 'directory',
    assets: '_assets'
  },
  
  // エイリアスの設定
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@utils': '/src/utils',
        '@lib': '/src/lib',
        '@types': '/src/types',
        '@config': '/src/config.ts',
      }
    }
  }
});