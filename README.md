# esa MCP Server

Claude Desktop から直接 esa に記事を作成・編集・検索できる MCP サーバーです。

## できること

| ツール名 | 説明 |
|---|---|
| `esa_list_posts` | 記事一覧の取得・検索 |
| `esa_get_post` | 記事番号で記事を取得 |
| `esa_create_post` | 新規記事の作成（カテゴリ・タグ・WIP指定可） |
| `esa_update_post` | 既存記事の更新 |
| `esa_delete_post` | 記事の削除 |
| `esa_get_members` | チームメンバー一覧の取得 |

---

## セットアップ手順

### 1. esa アクセストークンの取得

1. esa にログインし `https://[チーム名].esa.io/user/applications` を開く
2. **「個人用アクセストークン」** → **「新しいトークンを生成」** をクリック
3. スコープは `read` と `write` を選択してトークンを生成
4. 生成されたトークンをコピーして保存しておく

### 2. Node.js のインストール確認

```bash
node --version  # v18 以上が必要
npm --version
```

### 3. このリポジトリをクローン or ダウンロード

```bash
git clone <このリポジトリのURL>
cd esa-mcp-server
```

または zip を展開して任意のディレクトリに配置してください。

### 4. 依存関係のインストールとビルド

```bash
npm install
npm run build
```

これで `dist/index.js` が生成されます。

### 5. Claude Desktop の設定ファイルを編集

設定ファイルの場所:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

ファイルを開き、以下を追加します（`YOUR_*` の部分を実際の値に置き換えてください）:

```json
{
  "mcpServers": {
    "esa": {
      "command": "node",
      "args": [
        "/絶対パス/esa-mcp-server/dist/index.js"
      ],
      "env": {
        "ESA_ACCESS_TOKEN": "YOUR_ESA_ACCESS_TOKEN",
        "ESA_TEAM_NAME": "YOUR_TEAM_NAME"
      }
    }
  }
}
```

**パスの例 (macOS)**:
```json
"/Users/yourname/projects/esa-mcp-server/dist/index.js"
```

> ⚠️ `args` のパスは **絶対パス** で指定してください。`~` は使えません。

### 6. Claude Desktop を再起動

完全に終了（Cmd+Q / 右クリックでQuit）してから再起動します。

チャット入力欄の下にハンマーアイコン🔨が表示されれば接続成功です。

---

## 使い方の例

Claude Desktop のチャットで以下のように話しかけるだけです:

```
「プロジェクト/設計メモ」カテゴリに「APIの設計方針」という記事を作って。
本文は「## 基本方針\n- RESTful設計\n- JSON形式」で。
```

```
最近更新された記事を5件見せて
```

```
記事番号123の内容を教えて
```

```
「日報/2025/04/11」カテゴリに今日の日報を作って。WIPで。
```

---

## トラブルシューティング

**ハンマーアイコンが出ない場合**

Claude Desktopのログを確認:
```bash
# macOS
cat ~/Library/Logs/Claude/mcp-server-esa.log
```

よくある原因:
- `dist/index.js` のパスが間違っている（相対パスや `~` を使っていない）
- `npm run build` を実行していない
- JSON の構文エラー（カンマの過不足など）

**API エラーが出る場合**

- アクセストークンが正しいか確認
- チーム名（`ESA_TEAM_NAME`）が `xxx.esa.io` の `xxx` 部分になっているか確認
