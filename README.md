# pi-codex-app-server

Pi Coding Agentのモデル、セッション、実行系をそのまま使い、Codex App ServerおよびChatGPT Remote Controlのプロトコルで公開するPiパッケージです。エージェント、ツール、パーミッション、サンドボックスは再実装せず、Piの挙動を維持します。

## 現在の実装

- Codex App Server互換のstdioサーバー
- 複数クライアントで共有できるローカルWebSocket daemon
- ChatGPT Remote Control protocol v3のリレー、ペアリング、トークン更新、再接続
- PiのOpenAI OAuthセッションの流用。独自OAuthトークンは作成しません
- 全Piモデルの`model/list`公開
- 全Pi JSONLセッションの一覧、読取、再開、アーカイブ、削除
- スレッド開始、ターン開始、中断、steer、compact、名前変更
- PiイベントからCodexのターン、メッセージ、reasoning、ツール通知への変換
- SQLite sidecarによるCodex固有メタデータ管理。会話履歴の正本はPi JSONLです

プロトコル型は固定した`openai/codex`リビジョンから生成し、リクエストとレスポンスは同梱の公式JSON SchemaをAjvで検証します。JSON-RPCの双方向通信と要求相関には`json-rpc-2.0`を使用しています。詳細は[ADR 0020](docs/adr/0020-use-generated-codex-contracts-with-json-rpc-2-0.md)を参照してください。

固定リビジョンのstable APIとexperimental APIをどちらも公開します。Piのモデル、認証、スレッド、ターン、履歴、アーカイブ、削除に対応するメソッドはPiへ接続し、Codex固有でPiに対応機能がないメソッドは公式レスポンスSchemaに適合するneutral responseを返します。未対応機能をPiへ追加したり、Codexのsandbox・permission・agent実装を再現したりはしません。

## 必要条件

- Node.js 22.19以降
- `@earendil-works/pi-coding-agent` 0.84系
- ChatGPT Remote Controlを使う場合は、PiでOpenAI OAuthログイン済みであること

## 開発版の導入

このリポジトリはまだnpm公開前です。ローカルパッケージとして導入できます。

```bash
bun install
bun run build
pi install /absolute/path/to/pi-codex-app-server
```

Pi TUIを再起動すると拡張機能が読み込まれます。プロジェクト内だけで有効にする場合は`pi install -l /absolute/path/to/pi-codex-app-server`を使用します。

## 使い方

Pi TUIでは次のコマンドを使用できます。

```text
/codex-server status
/codex-server start
/codex-server stop
/codex-server pair
```

Pi TUIの起動時にバックグラウンドdaemonも自動起動し、フッターへ稼働状態を表示します。`status`ではPID、WebSocket URL、起動時刻、Remote Controlと自動起動の設定、現在のPiセッション、保存先を確認できます。`pair`はChatGPTで読み取るQRコードと手動入力コードを両方表示します。認証トークンは画面やログへ出力しません。

`start`はdaemonを明示的に起動し、接続先を`~/.pi/agent/codex-app-server/endpoint.json`へ書き込みます。`stop`は共有daemonを停止します。サブコマンドはPiの引数補完候補に表示されます。

CLIから直接起動する場合:

```bash
pi-codex-app-server app-server
pi-codex-app-server daemon
pi-codex-app-server pair
```

## 設定

設定は環境変数で固定します。

| 変数 | 既定値 | 用途 |
| --- | --- | --- |
| `PI_CODEX_APP_SERVER_AUTOSTART` | `1` | `0`でPi起動時のdaemon自動起動を無効化 |
| `PI_CODEX_APP_SERVER_HOME` | `~/.pi/agent/codex-app-server` | DB、ログ、endpointの保存先 |
| `PI_CODEX_APP_SERVER_HOST_NAME` | OSのホスト名 | ChatGPTへ表示するサーバー名 |
| `PI_CODEX_APP_SERVER_LISTEN` | `ws://127.0.0.1:0` | ローカルdaemonの待受URL |
| `PI_CODEX_REMOTE_CONTROL` | `1` | `0`でRemote Controlを無効化 |
| `PI_CODEX_REMOTE_BASE_URL` | `https://chatgpt.com/backend-api/` | Remote Control APIのベースURL |

安全のためRemote URLはChatGPTの公式ホスト、stagingホスト、localhostだけを受理し、localhost以外ではHTTPSを必須とします。

## 互換性の方針

Piに同等機能がある要求はPi APIへ変換します。同等機能がないが安全に無視できるCodex固有設定は、型検証後に受理して適用しません。Piの実行モデルを変える要求や、虚偽の成功を返すと危険な操作はエラーにします。

現段階ではCodexの全リクエストメソッドを実装済みという意味での完全互換ではありません。モバイル接続に必要なRemote Controlデータプレーンと主要な会話操作を優先実装しています。公式参照リビジョンは[vendorのUPSTREAM](vendor/openai-codex-app-server-protocol/UPSTREAM.md)に記録しています。

## 開発

```bash
bun run typecheck
bun x ultracite check
bun run test
bun run build
```

lintルールは無効化しません。外部境界は公式JSON SchemaまたはZodで検証し、ログはLogTapeのredactionを通します。
