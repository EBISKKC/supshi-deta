# ✊✋✌️ じゃんけんゲーム with Google Sheets

じゃんけんゲームの勝敗履歴をGoogle Sheetsに記録・分析できるアプリケーションです。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- React 19
- CSS Modules
- Google Sheets API (googleapis)

## セットアップ手順

### 1. Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. **APIとサービス** > **ライブラリ** から「Google Sheets API」を有効化
4. **APIとサービス** > **認証情報** に移動
5. **認証情報を作成** > **サービスアカウント** を選択
6. サービスアカウントを作成し、以下の情報を取得：
   - サービスアカウントのメールアドレス
   - 秘密鍵（JSON形式でダウンロード）

### 2. Google Sheetsの共有設定

1. 使用したいGoogle Spreadsheetsを開く
2. 右上の「共有」ボタンをクリック
3. サービスアカウントのメールアドレスを追加（編集権限を付与）
4. スプレッドシートのIDをURLから取得
   - URLの形式: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - `SPREADSHEET_ID`の部分をコピー

### 3. 環境変数の設定

1. `.env.local.example`を`.env.local`にコピー
   ```bash
   cp .env.local.example .env.local
   ```

2. `.env.local`を編集して以下の情報を設定：
   ```env
   GOOGLE_SHEET_ID=your_spreadsheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
   ```

   **注意**: `GOOGLE_PRIVATE_KEY`は改行を`\n`に置き換えてください。

### 4. 依存関係のインストール

```bash
npm install
```

### 5. Google Sheetsの初期化

初回のみ、以下のコマンドでGoogle Sheetsにヘッダー行を設定します：

```bash
npm run init-sheet
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアクセスできます。

## 機能

### 🎮 ゲーム機能
- ✊ グー・✋ パー・✌️ チョキから選んで対戦
- 🤖 コンピュータとのじゃんけん対戦
- 📊 リアルタイムで統計情報を表示

### 📈 分析機能
- 総試合数の表示
- 勝敗数の集計
- 勝率の計算（パーセント表示）
- 対戦履歴の一覧表示（時系列）

### 💾 データ管理
- Google Sheetsへの自動保存
- 対戦結果の永続化
- タイムスタンプ付きの詳細記録

## プロジェクト構成

```
supshi-deta/
├── app/
│   ├── api/
│   │   └── sheets/          # Google Sheets API エンドポイント
│   │       ├── route.ts     # GET/POST (取得・更新)
│   │       └── append/
│   │           └── route.ts # POST (行の追加)
│   ├── layout.tsx           # アプリケーションレイアウト
│   ├── page.tsx             # メインページ
│   └── globals.css          # グローバルスタイル
├── components/
│   ├── DataTable.tsx        # データテーブルコンポーネント
│   └── DataTable.module.css # テーブルスタイル
├── lib/
│   └── google-sheets.ts     # Google Sheets APIクライアント
├── types/
│   └── sheet.ts             # TypeScript型定義
└── .env.local.example       # 環境変数のサンプル
```

## 使い方

1. アプリケーションを起動すると、Google Sheetsのデータが自動的に読み込まれます
2. テーブル内のセルをクリックして直接編集できます
3. **保存**ボタンで変更をGoogle Sheetsに反映
4. **行を追加**ボタンで新しい行を追加
5. **再読み込み**ボタンで最新のデータを取得

## トラブルシューティング

### データが取得できない場合

- 環境変数が正しく設定されているか確認
- サービスアカウントにスプレッドシートの共有権限があるか確認
- スプレッドシートIDが正しいか確認

### 保存できない場合

- サービスアカウントに**編集権限**があるか確認
- ブラウザのコンソールでエラーメッセージを確認

## ライセンス

MIT
