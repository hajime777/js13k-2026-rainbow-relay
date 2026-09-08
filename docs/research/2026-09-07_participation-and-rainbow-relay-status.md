# js13kGames 2026 参加方法と Rainbow Relay 現状まとめ

- 調査日: 2026-09-07
- 対象大会: js13kGames 2026
- 公式テーマ: **Unicorns and Rainbows**
- 開催期間: **2026-08-13 13:00 CEST ～ 2026-09-13 13:00 CEST**
- 日本時間の締切: **2026-09-13 20:00 JST**
- 公式サイト: https://js13kgames.com/
- Rainbow Relay リポジトリ: https://github.com/hajime777/js13k-2026-rainbow-relay

---

## 1. js13kGames 2026 の概要

js13kGames は、ブラウザで動くゲームを **13KB の ZIP** に収めて制作・提出するゲーム開発コンテスト。

2026年は第15回で、テーマは **Unicorns and Rainbows**。

標準カテゴリは次の2つ。

- Desktop
- Mobile

追加カテゴリとして以下がある。

- Online
- WebXR
- Wavedash
- Unfinished

追加カテゴリは任意。

Rainbow Relay は現状、まず **Desktop + Mobile** を基本対象にし、オンライン機能が完成した場合に **Online** を追加する方針が自然。

---

## 2. 2026年の参加状況

2026-09-07 時点で、公式サイトは以下の状態。

- 大会開催中
- Submission 受付中
- `Sign in to participate` が表示されている
- Draft作品が公開されている
- Submit済みで審査待ちの作品は `Purrgatory` として表示されている

したがって、現在は **新規参加・Draft作成・Submission が可能な期間**。

---

## 3. 参加から提出までの流れ

### 3.1 公式サイトへログイン

公式サイト:

https://js13kgames.com/

からログインし、`Sign in to participate` から参加する。

---

### 3.2 Draft を作成

現在の js13kGames は、いきなり完成版を提出するのではなく、まず Draft を作成して進める方式。

現行の投稿フローでは、Draft を作ることで以下ができる。

- 作品名を確保
- ゲーム情報を編集
- 作者情報を設定
- チームメンバーを追加
- 説明文を入力
- スクリーンショットを登録
- プレイ動画を登録
- 実際の大会サイト上でゲームをテスト
- 完成後に Submit

2026年の公式トップにも `Drafts` が表示されているため、この Draft ベースの運用が継続していることは確認できる。

※ 個々の入力項目については、2025年の公式投稿フロー説明を基準に整理。2026年の実フォームで最終確認する。

---

### 3.3 カテゴリを選択

Rainbow Relay の現時点の候補:

- Desktop
- Mobile

将来オンライン要素を入れた場合:

- Online を追加

未完成であっても `Unfinished` カテゴリが存在する。

---

### 3.4 提出用 ZIP を作成

Rainbow Relay では、現在すでに以下で生成可能。

```powershell
npm run build
```

生成物:

```text
dist/game.zip
```

現在確認済みのビルド例:

```text
source html : 11,300 bytes
minified    :  9,758 bytes
game.zip    :  4,310 / 13,312 bytes (32.4%)
remaining   :  9,002 bytes
```

現在はかなり余裕がある。

ビルドスクリプトは、13,312 bytes を超えた場合でも開発を止めず、警告を出す方式へ変更済み。

例:

```text
WARNING     : OVER BY xxx bytes
```

---

## 4. 13KB 制限

提出物の ZIP は **13,312 bytes 以下**を目標とする。

ZIP 内にゲーム本体を含め、ブラウザで起動できる形にする。

Rainbow Relay では開発時にファイルを分割していても、ビルド時には必要な JavaScript を HTML に埋め込み、最終的には `index.html` を中心とした提出物にまとめる構成。

現在は:

```text
src/
  index.html
  logic.js

        ↓ npm run build

dist/
  index.html
  game.zip
```

という流れ。

---

## 5. 公開ソース

Rainbow Relay は公開 GitHub リポジトリを用意済み。

https://github.com/hajime777/js13k-2026-rainbow-relay

開発用ソースは読みやすい状態を維持し、提出時のみ minify / ZIP 圧縮する。

方針:

- ゲーム本体: 現時点では広い再利用ライセンスを付与しない
- 開発ツール類: MIT License
- 圧縮版だけでなく、人が読めるソースも GitHub で公開

---

## 6. Online カテゴリの重要ルール

2026年の Online カテゴリには公式ルールがある。

### Offline-first

最重要。

**ゲームはネットワークなしでも動作しなければならない。**

つまり Rainbow Relay は、

```text
オフライン
  ↓
1人でゲームとして成立

オンライン
  ↓
追加の演出・共有・他プレイヤーの存在などが加わる
```

という構成にする必要がある。

オンライン機能をゲーム成立の必須条件にはできない。

---

### WebSocket relay

Online カテゴリでは、公式の WebSocket relay を利用できる。

ルームに接続したプレイヤー同士でメッセージを交換できる。

---

### PartySocket

公式ルール上、PartySocket v1.3.0 を大会サーバーから読み込める。

これは **13KB ZIP に含めなくてよい特例**。

PartySocket は必須ではなく、ネイティブ WebSocket を直接使ってもよい。

---

### 外部データ

Online でプレイヤー間に送るデータは、基本的に提出した13KBゲームのコードによって生成される必要がある。

ユーザー生成コンテンツを使う場合も、そのコンテンツ自体をゲーム内で生成する方式が前提。

---

### Online は実験的カテゴリ

公式ページには、Online カテゴリは実験的であり、ルールが変更される可能性があると明記されている。

そのため実装開始後もルール確認を続ける。

---

## 7. Rainbow Relay の現在のゲーム案

現在の基本案:

- パステル調
- 青空と固定された虹が背景に存在
- 画面全体が灰色の曇りベールで覆われている
- プレイヤーが画面をこする
- 曇りベールが削れ、その下の青空と虹が見えてくる
- 雲そのものは全部消さなくてよい
- 虹の発見率が一定以上になるとクリア
- 現在のクリア基準は約 62%
- 将来、夜になると星空とユニコーン座が現れる案あり

重要な方針:

**既存の見た目・操作感を勝手に変更せず、変更要求があった部分だけ更新する。**

---

## 8. 現在の開発環境

現在の主な構成:

```text
src/
  index.html
  logic.js

tools/
  build.mjs

tests/
  logic/
  ui/

docs/
  concept.md
  build.md
  online.md
```

使用中の主な技術:

- Vanilla JavaScript
- Canvas 2D
- Vite（開発サーバ）
- html-minifier-terser
- fflate
- Playwright
- Node.js built-in test runner

---

## 9. UI 自動テスト

Playwright を導入済み。

現在、自動でブラウザを操作して以下を確認している。

- ゲームが起動する
- JavaScript エラーがない
- `Rainbow Revealed` が初期状態 0%
- Canvas が表示される
- Restart ボタンが表示される
- 虹の位置を自動でドラッグ
- ドラッグ後に進捗率が増える
- Restart で 0% に戻る
- 縦画面でも横方向にはみ出さない
- 外部ネットワークを遮断しても基本プレイできる

実行:

```powershell
npm run test:ui
```

画面を見ながら実行:

```powershell
npm run test:ui:headed
```

デバッグ:

```powershell
npm run test:ui:debug
```

実機確認済み結果:

```text
4 passed
```

---

## 10. ロジックテスト

UIテストとは分離して実装済み。

現在のロジックテスト対象:

- 点と線分の距離計算
- 虹の発見率計算
- 62% のクリア閾値
- スクラブ範囲内の虹ポイント判定
- すでに発見済みのポイントを二重カウントしないこと
- ゼロ長線分などの境界ケース

実行:

```powershell
npm run test:logic
```

UIとまとめて実行:

```powershell
npm run test:all
```

ロジックテストはゲーム本体と同じ `src/logic.js` を直接利用する。

テスト専用にロジックをコピーしているわけではない。

---

## 11. 今後追加するテスト

今後追加候補:

### ロジック

- Restart / 初期状態
- ワールド座標と画面座標
- レベル進行
- オンライン状態マージ
- 同期ルール

### UI

- minify 後の `dist/index.html`
- `game.zip` を実際に展開してのテスト
- 横画面 / 縦画面バリエーション追加
- タッチ操作
- クリアまでの自動操作
- Online 実装後の複数ブラウザ同時接続

最終的な見た目・操作感・楽しさについては、人間が手動確認する。

---

## 12. 提出前の推奨テスト構成

最終的には以下を目標にする。

```text
Logic Test
  ↓
純粋ロジックが正しい

Playwright / src
  ↓
開発版が遊べる

Playwright / dist
  ↓
minify後も遊べる

Playwright / ZIP
  ↓
提出ZIPそのものが遊べる

Playwright / offline
  ↓
ネットなしでも遊べる

Playwright / online
  ↓
複数ブラウザ間の通信確認

Manual Test
  ↓
最終的な見た目・操作感・楽しさ
```

---

## 13. 現在の参加準備状況

2026-09-07 時点。

| 項目 | 状況 |
|---|---|
| js13kGames 2026 開催中確認 | ✅ |
| テーマ確認 | ✅ Unicorns and Rainbows |
| 公開GitHub | ✅ |
| ゲームプロトタイプ | ✅ |
| Desktop動作確認 | ✅ |
| Mobile縦画面向け確認 | ✅ 自動テストあり |
| offline-first簡易確認 | ✅ |
| Playwright UIテスト | ✅ |
| ロジックテスト | ✅ |
| 13KBビルド環境 | ✅ |
| ZIP生成 | ✅ |
| 現在のZIP容量 | ✅ 約4.3KB |
| Draft作成 | 未確認 |
| js13kGamesサイト上でのアップロード試験 | 未実施 |
| Online機能 | 未実装 |
| 最終提出 | 未実施 |

---

## 14. 次にやること

優先順。

1. **js13kGames にログイン**
2. **Rainbow Relay の Draft を作成**
3. **Draft の実際の入力項目を確認**
4. **現状の `game.zip` を一度アップロード**
5. **大会サイト上でゲームが動くか確認**
6. 開発継続
7. `dist` / ZIP版の自動テストを追加
8. Online案を実装するか判断
9. 最終手動テスト
10. **2026-09-13 20:00 JST までに Submit**

Draft は完成してから作る必要はない。

むしろ、実際の投稿画面と大会サイト上での動作を早めに確認するため、現時点で一度作成しておく価値が高い。

---

## 15. 注意事項

### 締切

公式締切:

```text
2026-09-13 13:00 CEST
```

日本時間:

```text
2026-09-13 20:00 JST
```

締切直前のトラブルを避けるため、最終版は早めに大会サイト上で動作確認する。

---

### AI利用

2026年について、AI利用を全面禁止する公式ルールは今回の参加方法調査では確認していない。

実際に2026年の公開作品 `PRISMHORN` には、作品ページ上で **Built with AI assistance** と明記された例が存在する。

ただし、これは「すべてのAI利用方法について公式に無条件許可」と同義ではない。

Rainbow Relay では、使用したAI・用途・制作過程を必要に応じて説明できるよう記録しておく。

---

## 16. 公式情報源

### js13kGames 2026

公式トップ:

https://js13kgames.com/

2026 Competition started:

https://js13kgames.com/2026/blog/competition-has-started

2026 Games:

https://js13kgames.com/2026/games

2026 Online category:

https://js13kgames.com/2026/online

### 現行 Submit フローの参考

2025公式 Submit form 説明:

https://js13kgames.com/2025/blog/submit-form-open

2026年公式トップでは Submission が開いていること、および Draft / Purrgatory が実際に運用されていることを確認済み。

### AI利用例

PRISMHORN:

https://js13kgames.com/2026/games/prismhorn

### Online実装例

Rainbow Rumble:

https://js13kgames.com/2026/games/rainbow-rumble

---

## 17. 現時点の判断

Rainbow Relay は、まだゲーム内容そのものは開発途中だが、**コンテスト参加のための技術基盤はかなり整っている**。

特に、

- 13KB自動計測
- minify / ZIP
- UI自動テスト
- ロジックテスト
- offline-first確認
- 公開GitHub

まで揃っているため、次の段階は「応募できるか調べる」ではなく、

**実際に Draft を作り、大会サイト上で現在のZIPを一度通してみる**

段階に入っている。
