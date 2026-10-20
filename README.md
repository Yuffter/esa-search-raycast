<img width="2172" height="724" alt="d50055ed-a766-47db-bb2b-672b3590fad7" src="https://github.com/user-attachments/assets/bb34fa43-536b-4eaa-89b4-cd8a25d87f14" />

# esa Search (Raycast)

複数のesaチームを横断して記事を検索するRaycast拡張です。チームごとにセクション分けして表示します。

## セットアップ

1. esaで個人用アクセストークンを発行（`https://<チーム名>.esa.io/user/applications` → Personal access tokens v1、権限は **Read** でOK）
2. このフォルダで実行:
   ```
   npm install
   npm run dev
   ```
3. Raycastで `Search esa Posts` を開くと初回に設定を聞かれるので、トークンとチーム名（カンマ区切り）を入力
4. 一度 `npm run dev` すればRaycastに登録され、以降は開発サーバーを止めても使えます
   （`npm run build` でも登録できます）
   
   ※もし、エラーが発生する場合はRaycastを再起動してください。
## 使い方

- 検索窓に入力すると全チームを並列で検索（esaの検索構文 `category:foo` `tag:bar` `user:xxx` などがそのまま使えます）
- 何も入力しないと各チームの最近更新された記事を表示
- Enter: ブラウザで開く / ⌘C: URLコピー / ⌘⇧C: Markdownリンクコピー

## 補足

- トークンは個人単位なので、所属している全チームで同じものが使えます
- 1チームあたり最大20件表示
- 通信エラー（トークン無効、チーム名間違い等）はチーム名のセクション横に⚠で表示されます
