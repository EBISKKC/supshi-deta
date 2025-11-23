/**
 * Google Sheetsの初期化スクリプト
 *
 * 使い方:
 * npx tsx scripts/init-sheet.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// .env.localを読み込む
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { googleSheetsClient } from '../lib/google-sheets';

async function initializeSheet() {
  try {
    console.log('Google Sheetsを初期化しています...');

    // ヘッダー行を設定
    await googleSheetsClient.updateSheetData('sheet1!A1:E1', [
      ['タイムスタンプ', 'プレイヤーの手', 'コンピュータの手', '結果', '備考'],
    ]);

    console.log('✅ 初期化完了！');
    console.log('以下のヘッダーが設定されました:');
    console.log('  A列: タイムスタンプ');
    console.log('  B列: プレイヤーの手');
    console.log('  C列: コンピュータの手');
    console.log('  D列: 結果');
    console.log('  E列: 備考');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

initializeSheet();
