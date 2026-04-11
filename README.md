> Japanese version continues after English version. / 日本語版は英語版の後に続きます。

# esa MCP Server

An MCP (Model Context Protocol) server that lets you create, edit, search, and manage esa posts directly from Claude Desktop — no browser required.

## What You Can Do

| Tool | Description |
|---|---|
| `esa_list_posts` | List and search posts (filter by category, keyword, tag, WIP status, etc.) |
| `esa_get_post` | Retrieve a specific post by post number |
| `esa_create_post` | Create a new post (with optional category, tags, WIP flag, and change message) |
| `esa_update_post` | Update an existing post |
| `esa_delete_post` | Delete a post |
| `esa_get_members` | List all team members |

---

## Setup

### Step 1 — Get an esa Access Token

1. Log in to esa and open `https://[your-team-name].esa.io/user/applications`
2. Under **Personal Access Tokens**, click **"Generate new token"**
3. Select both **`read`** and **`write`** scopes, then generate the token
4. Copy and save the token somewhere safe — it is shown only once

> **Token type:** Use **Personal Access Token v1 (PAT v1)**.

> **Team name:** The team name is the `xxx` part of `xxx.esa.io`.

---

### Step 2 — Install Node.js

**macOS**

```bash
# Using Homebrew
brew install node

# Or download the .pkg installer from https://nodejs.org
```

**Windows**

Download the **.msi installer** from [https://nodejs.org](https://nodejs.org) and run it.

After installation, open **PowerShell** and check the version:

```powershell
node --version   # v18 or later required
npm --version
```

> **If npm commands fail in PowerShell** (e.g. "running scripts is disabled on this system"), run this once:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

### Step 3 — Clone or Download This Repository

```bash
git clone https://github.com/k-fuji/esa-mcp-server.git
cd esa-mcp-server
```

Or download and extract the ZIP, then navigate to the folder.

---

### Step 4 — Install Dependencies and Build

```bash
npm install
npm run build
```

This generates `dist/index.js`, which is the file Claude Desktop will run.

---

### Step 5 — Edit the Claude Desktop Configuration File

**File location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**To open on Windows (PowerShell):**
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

Add the following to the file (replace `YOUR_*` with your actual values):

```json
{
  "mcpServers": {
    "esa": {
      "command": "node",
      "args": [
        "/absolute/path/to/esa-mcp-server/dist/index.js"
      ],
      "env": {
        "ESA_ACCESS_TOKEN": "YOUR_ESA_ACCESS_TOKEN",
        "ESA_TEAM_NAME": "YOUR_TEAM_NAME"
      }
    }
  }
}
```

**Path examples:**

macOS:
```json
"/Users/yourname/projects/esa-mcp-server/dist/index.js"
```

Windows:
```json
"C:\\Users\\yourname\\projects\\esa-mcp-server\\dist\\index.js"
```

> **Always use absolute paths.** Relative paths and `~` are not supported.

> On Windows, backslashes in JSON must be escaped as `\\`.

---

### Step 6 — Restart Claude Desktop

A simple window close is not enough. You must **fully quit** Claude Desktop:

- **macOS:** `Cmd+Q` or right-click the Dock icon → Quit
- **Windows:** In the Claude Desktop menu bar, click **File → Exit** (closing the window only minimizes it to the tray)

Then relaunch Claude Desktop.

---

## Verifying the Connection

In Claude Desktop, click the **"+"** button at the bottom-left of the chat input area, then select **Connectors**. You should see `esa` listed there.

If the connector appears, the server is connected and ready to use.

---

## Usage Examples

Just talk to Claude naturally in the chat:

```
Create a post in the "Project/Design Notes" category titled "API Design Policy".
Body: "## Basic Policy\n- RESTful design\n- JSON format"
```

```
Show me the 5 most recently updated posts.
```

```
What does post number 123 say?
```

```
Create today's daily report in the "Daily/2025/04/11" category. Keep it as WIP.
```

```
Search for posts tagged "meeting".
```

---

## Debugging

**Check the log file:**

macOS:
```bash
cat ~/Library/Logs/Claude/mcp-server-esa.log
```

Windows (PowerShell):
```powershell
type "$env:APPDATA\Claude\logs\mcp-server-esa.log"
```

**Common issues:**

| Symptom | Likely cause |
|---|---|
| Connector not shown in "+" menu | Path to `dist/index.js` is wrong, or `npm run build` was not run |
| Connector shown but tools fail | `ESA_ACCESS_TOKEN` or `ESA_TEAM_NAME` is incorrect |
| `401 Unauthorized` error | Access token is expired or invalid |
| `404 Not Found` error | Team name is wrong (should be `xxx`, not `xxx.esa.io`) |
| Config changes not reflected | Claude Desktop was not fully quit and restarted |

---

## Development

To develop or extend the server:

### Run in Development Mode (without building)

```bash
npm run dev
```

This runs `src/index.ts` directly using `tsx` — no build step needed.

### Project Structure

```
esa-mcp-server/
├── src/
│   └── index.ts      # Main server logic and all tool definitions
├── dist/             # Compiled output (generated by npm run build)
├── package.json
└── tsconfig.json
```

### Adding a New Tool

1. Open [src/index.ts](src/index.ts)
2. Add a tool definition in the `ListToolsRequestSchema` handler (around line 52)
3. Add a case for the tool in the `CallToolRequestSchema` handler (around line 194)
4. Run `npm run build` to compile

### Build

```bash
npm run build
```

Compiles TypeScript to `dist/index.js`.

---

## Requirements

- Node.js v18 or later
- Claude Desktop
- An esa team and a Personal Access Token v1 (PAT v1) with `read` and `write` scopes

---

---

# esa MCP サーバー

Claude Desktop から直接 esa の記事を作成・編集・検索・管理できる MCP（Model Context Protocol）サーバーです。ブラウザを開かなくても esa を操作できます。

## できること

| ツール名 | 説明 |
|---|---|
| `esa_list_posts` | 記事一覧の取得・検索（カテゴリ、キーワード、タグ、WIP状態などで絞り込み可） |
| `esa_get_post` | 記事番号で特定の記事を取得 |
| `esa_create_post` | 新規記事の作成（カテゴリ・タグ・WIPフラグ・変更メッセージ指定可） |
| `esa_update_post` | 既存記事の更新 |
| `esa_delete_post` | 記事の削除 |
| `esa_get_members` | チームメンバー一覧の取得 |

---

## セットアップ

### ステップ 1 — esa アクセストークンの取得

1. esa にログインし、`https://[チーム名].esa.io/user/applications` を開く
2. **「個人用アクセストークン」** の欄で **「新しいトークンを生成」** をクリック
3. スコープで **`read`** と **`write`** の両方を選択し、トークンを生成
4. 表示されたトークンをコピーして保存する（再表示はできないので注意）

> **トークンの種類:** **Personal Access Token v1（PAT v1）** を使用してください。

> **チーム名:** `xxx.esa.io` の `xxx` 部分がチーム名です。

---

### ステップ 2 — Node.js のインストール

**macOS**

```bash
# Homebrew を使う場合
brew install node

# またはhttps://nodejs.org から .pkg インストーラーをダウンロード
```

**Windows**

[https://nodejs.org](https://nodejs.org) から **.msi インストーラー** をダウンロードして実行します。

インストール後、**PowerShell** を開いてバージョンを確認:

```powershell
node --version   # v18 以上が必要
npm --version
```

> **PowerShell で npm コマンドが実行できない場合**（「スクリプトの実行が無効になっています」などのエラー）は、以下を一度だけ実行してください:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

---

### ステップ 3 — リポジトリをクローンまたはダウンロード

```bash
git clone https://github.com/k-fuji/esa-mcp-server.git
cd esa-mcp-server
```

または ZIP をダウンロードして展開し、そのフォルダに移動してください。

---

### ステップ 4 — 依存関係のインストールとビルド

```bash
npm install
npm run build
```

これで `dist/index.js` が生成されます。Claude Desktop はこのファイルを実行します。

---

### ステップ 5 — Claude Desktop の設定ファイルを編集

**ファイルの場所:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Windows でメモ帳で開くコマンド（PowerShell）:**
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

ファイルに以下を追加します（`YOUR_*` を実際の値に置き換えてください）:

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

**パスの例:**

macOS:
```json
"/Users/yourname/projects/esa-mcp-server/dist/index.js"
```

Windows:
```json
"C:\\Users\\yourname\\projects\\esa-mcp-server\\dist\\index.js"
```

> **パスは必ず絶対パスで指定してください。** 相対パスや `~` は使えません。

> Windows では JSON 内のバックスラッシュを `\\` とエスケープする必要があります。

---

### ステップ 6 — Claude Desktop を再起動

ウィンドウを閉じるだけでは不十分です。**完全に終了**してから再起動してください:

- **macOS:** `Cmd+Q` または Dock のアイコンを右クリック → 「終了」
- **Windows:** Claude Desktop のメニューバーで **「File → 終了」** をクリック（ウィンドウを閉じるだけではトレイに常駐し続けます）

その後、Claude Desktop を再起動してください。

---

## 接続確認

Claude Desktop のチャット入力欄の左下にある **「+」ボタン** をクリックし、**「Connectors」** を選択します。そこに `esa` が表示されていれば接続成功です。

---

## 使い方の例

Claude のチャットで自然に話しかけるだけです:

```
「プロジェクト/設計メモ」カテゴリに「API設計方針」という記事を作って。
本文は「## 基本方針\n- RESTful設計\n- JSON形式」で。
```

```
最近更新された記事を5件見せて。
```

```
記事番号123の内容を教えて。
```

```
「日報/2025/04/11」カテゴリに今日の日報を作って。WIPで。
```

```
「ミーティング」タグのついた記事を検索して。
```

---

## デバッグ

**ログファイルを確認する:**

macOS:
```bash
cat ~/Library/Logs/Claude/mcp-server-esa.log
```

Windows（PowerShell）:
```powershell
type "$env:APPDATA\Claude\logs\mcp-server-esa.log"
```

**よくあるトラブルと原因:**

| 症状 | 考えられる原因 |
|---|---|
| 「+」メニューに Connector が出ない | `dist/index.js` のパスが間違っている、または `npm run build` を実行していない |
| Connector は表示されるがツールが動かない | `ESA_ACCESS_TOKEN` または `ESA_TEAM_NAME` が正しくない |
| `401 Unauthorized` エラー | アクセストークンが無効または期限切れ |
| `404 Not Found` エラー | チーム名が間違っている（`xxx.esa.io` ではなく `xxx` のみを指定する） |
| 設定を変えても反映されない | Claude Desktop を完全に終了・再起動していない |

---

## 開発（機能の追加・拡張）

### ビルドなしで開発する（開発モード）

```bash
npm run dev
```

`tsx` を使って `src/index.ts` を直接実行します。ビルド不要で変更をすぐに確認できます。

### プロジェクト構成

```
esa-mcp-server/
├── src/
│   └── index.ts      # サーバーのメインロジックとツール定義
├── dist/             # コンパイル済みファイル（npm run build で生成）
├── package.json
└── tsconfig.json
```

### ツールを追加する方法

1. [src/index.ts](src/index.ts) を開く
2. `ListToolsRequestSchema` ハンドラー（約 52 行目付近）にツール定義を追加する
3. `CallToolRequestSchema` ハンドラー（約 194 行目付近）に対応する `case` を追加する
4. `npm run build` を実行してコンパイルする

### ビルド

```bash
npm run build
```

TypeScript を `dist/index.js` にコンパイルします。

---

## 動作要件

- Node.js v18 以上
- Claude Desktop
- esa チームアカウントおよび `read` と `write` スコープを持つ Personal Access Token v1（PAT v1）
