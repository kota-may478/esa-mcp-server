import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const ESA_API_BASE = "https://api.esa.io/v1";

async function esaRequest(
  token: string,
  teamName: string,
  method: string,
  path: string,
  body?: object
): Promise<unknown> {
  const url = `${ESA_API_BASE}/teams/${teamName}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `esa API error ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

export function createServer(token: string, teamName: string): Server {
  const server = new Server(
    { name: "esa-mcp-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // Tool definitions
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "esa_list_posts",
        description:
          "esaの記事一覧を取得します。カテゴリやキーワードで絞り込みができます。",
        inputSchema: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description:
                "検索クエリ。例: 'category:日報', 'wip:false', '#タグ名'",
            },
            per_page: {
              type: "number",
              description: "1ページあたりの件数 (最大100、デフォルト20)",
            },
            page: {
              type: "number",
              description: "ページ番号 (デフォルト1)",
            },
          },
        },
      },
      {
        name: "esa_get_post",
        description: "esaの特定の記事を記事番号で取得します。",
        inputSchema: {
          type: "object",
          properties: {
            post_number: {
              type: "number",
              description: "記事番号",
            },
          },
          required: ["post_number"],
        },
      },
      {
        name: "esa_create_post",
        description:
          "esaに新しい記事を作成します。カテゴリはスラッシュ区切りでディレクトリ構造を表現できます。",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "記事のタイトル",
            },
            body_md: {
              type: "string",
              description: "記事の本文 (Markdown形式)",
            },
            category: {
              type: "string",
              description:
                "カテゴリ (例: '日報/2025/04', 'プロジェクト/設計')",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "タグの配列",
            },
            wip: {
              type: "boolean",
              description:
                "WIP（下書き）状態にするか。false でShip It（公開）になります。デフォルトはtrue。",
            },
            message: {
              type: "string",
              description: "変更メッセージ（コミットメッセージのようなもの）",
            },
          },
          required: ["name", "body_md"],
        },
      },
      {
        name: "esa_update_post",
        description: "esaの既存の記事を更新します。",
        inputSchema: {
          type: "object",
          properties: {
            post_number: {
              type: "number",
              description: "更新する記事の番号",
            },
            name: {
              type: "string",
              description: "新しいタイトル",
            },
            body_md: {
              type: "string",
              description: "新しい本文 (Markdown形式)",
            },
            category: {
              type: "string",
              description: "新しいカテゴリ",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "新しいタグの配列",
            },
            wip: {
              type: "boolean",
              description: "WIP状態にするか",
            },
            message: {
              type: "string",
              description: "変更メッセージ",
            },
          },
          required: ["post_number"],
        },
      },
      {
        name: "esa_delete_post",
        description: "esaの記事を削除します。",
        inputSchema: {
          type: "object",
          properties: {
            post_number: {
              type: "number",
              description: "削除する記事の番号",
            },
          },
          required: ["post_number"],
        },
      },
      {
        name: "esa_get_members",
        description: "esaチームのメンバー一覧を取得します。",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  }));

  // Tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "esa_list_posts": {
          const params = new URLSearchParams();
          if (args?.q) params.set("q", String(args.q));
          if (args?.per_page) params.set("per_page", String(args.per_page));
          if (args?.page) params.set("page", String(args.page));
          const query = params.toString() ? `?${params}` : "";
          const data = await esaRequest(token, teamName, "GET", `/posts${query}`);
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        }

        case "esa_get_post": {
          const data = await esaRequest(
            token, teamName, "GET", `/posts/${args!.post_number}`
          );
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        }

        case "esa_create_post": {
          const postFields: Record<string, unknown> = {
            name: args!.name,
            body_md: args!.body_md,
            wip: args?.wip !== undefined ? args.wip : true,
          };
          if (args?.category !== undefined) postFields.category = args.category;
          if (args?.tags !== undefined) postFields.tags = args.tags;
          if (args?.message !== undefined) postFields.message = args.message;
          const body = { post: postFields };
          const data = await esaRequest(token, teamName, "POST", "/posts", body);
          const post = data as { number: number; url: string; full_name: string };
          return {
            content: [
              {
                type: "text",
                text: `✅ 記事を作成しました！\n\nタイトル: ${post.full_name}\nURL: ${post.url}\n記事番号: ${post.number}\n\n詳細:\n${JSON.stringify(data, null, 2)}`,
              },
            ],
          };
        }

        case "esa_update_post": {
          const postNumber = args!.post_number;
          const postBody: Record<string, unknown> = {};
          if (args?.name !== undefined) postBody.name = args.name;
          if (args?.body_md !== undefined) postBody.body_md = args.body_md;
          if (args?.category !== undefined) postBody.category = args.category;
          if (args?.tags !== undefined) postBody.tags = args.tags;
          if (args?.wip !== undefined) postBody.wip = args.wip;
          if (args?.message !== undefined) postBody.message = args.message;

          const data = await esaRequest(
            token, teamName, "PATCH", `/posts/${postNumber}`, { post: postBody }
          );
          const post = data as { number: number; url: string; full_name: string };
          return {
            content: [
              {
                type: "text",
                text: `✅ 記事を更新しました！\n\nタイトル: ${post.full_name}\nURL: ${post.url}\n\n詳細:\n${JSON.stringify(data, null, 2)}`,
              },
            ],
          };
        }

        case "esa_delete_post": {
          const postNumber = args!.post_number;
          await esaRequest(token, teamName, "DELETE", `/posts/${postNumber}`);
          return {
            content: [
              { type: "text", text: `✅ 記事 #${postNumber} を削除しました。` },
            ],
          };
        }

        case "esa_get_members": {
          const data = await esaRequest(token, teamName, "GET", "/members");
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err) {
      const error = err as Error;
      return {
        content: [{ type: "text", text: `❌ エラー: ${error.message}` }],
        isError: true,
      };
    }
  });

  return server;
}
