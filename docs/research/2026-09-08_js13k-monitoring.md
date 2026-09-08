# js13kGames 2026 定点観測レポート

- 観測日: **2026-09-08（JST）**
- 対象: js13kGames 2026 / Rainbow Relay
- 観測種別: 参加システム、Draft公開範囲、コミュニティ、提出時テスト、技術ノウハウ
- リポジトリ: https://github.com/hajime777/js13k-2026-rainbow-relay

---

## 0. 今回の調査境界

Rainbow Relay のゲームデザインが他作品に引っ張られるのを避けるため、今後の定点観測では **参加作品そのものの内容を見ない**。

原則として見てよいもの:

- js13kGames 公式ルール / 公式ブログ / Submit フロー
- Slack / Discord 等のコミュニティ運用情報
- 13KB制限、圧縮、ビルド、テスト、ブラウザ互換性などの技術情報
- 公開GitHubのビルド設定、テスト設定、圧縮ツール構成など
- Online relay / PartySocket / submission validator など大会システム

原則として見ないもの:

- 他参加作品のゲーム内容
- ゲームデザイン
- プレイ動画
- スクリーンショット
- 実際のゲームプレイ
- 作品説明からゲーム内容を掘る調査

ただし、大会システムの公開範囲を確認するため、公式のサンプルDraftや未プレイ状態のDraftページについて、UI上の `PLAY` / `NOT PLAYABLE YET` / `Source` / ZIPリンクの存在のみ確認した。

---

# 1. 結論

今回の定点観測で重要だった点は次の5つ。

1. **Draftは非公開ではない。**
2. **buildをアップロードしてPLAY可能になると、ログアウト状態の第三者も遊べると考えるべき。**
3. **「URLを知っている人だけ」の unlisted/private Draft 機能は確認できなかった。**
4. **2026年はZIPアップロード時に大会側がChromiumで自動テストする。**
5. **大会コミュニティはサイト内コメントだけでなく、Slack / Discordを中心に技術相談・バグ修正・playtestを助け合う文化が明示されている。**

Rainbow Relay への実務上の変更点は、前回の「早めにZIPをDraftへ上げる」という方針を少し修正すること。

```text
Draft作成
  ↓
作品名確保・投稿フォーム確認
  ↓
ローカル / Playwright / ZIPテスト継続
  ↓
公開されてもよい段階になったら build をアップロード
  ↓
大会側Chromiumテストを通す
```

**Draft自体は早めに作ってよいが、buildアップロードは公開プレイテスト開始とほぼ同義として扱う。**

---

# 2. Draftの公開範囲

## 2.1 Draft一覧はログアウト状態でも公開

2026-09-08時点の公式トップページでは、ログインしていない状態でも `Drafts` セクションが表示されている。

公式トップ:

https://js13kgames.com/

Draftは「works in progress / not yet submitted」として一般の一覧に表示される。

したがって、少なくとも以下は非公開ではない。

- Draftの存在
- タイトル
- Draft詳細ページ
- 作者情報など、登録済みの公開項目

---

## 2.2 buildがあるDraftはPLAY可能

公式のサンプルDraftをログアウト状態で確認すると、Draftページに以下が表示される。

- `DRAFT`
- `PLAY`
- `Source`
- ZIP容量 / ZIPリンク

`PLAY` は `play.js13kgames.com/...` のゲーム本体へ接続する。

ログインなしでPLAY先へ遷移できることを確認した。

したがって、**buildをDraftへ上げ、PLAY可能になった時点で一般公開される前提**で考える。

---

## 2.3 build未登録Draftは `NOT PLAYABLE YET`

buildがまだないDraftでは、公開Draftページ自体は存在するものの、ゲーム部分は `NOT PLAYABLE YET` となっている例を確認した。

このため、次の運用が可能。

```text
Draftだけ作る
  ↓
タイトルは公開される
  ↓
ゲーム本体はまだ公開しない
```

Rainbow Relayではこの状態を利用するのが安全。

---

## 2.4 private / unlisted は確認できない

2026年公式の公開UI、公式ブログ、確認したDraftページでは、以下の設定は確認できなかった。

- private Draft
- unlisted Draft
- 「リンクを知っている人だけPLAY可能」
- Draft一覧から隠す設定

したがって、機能が存在すると仮定しない。

**現時点の運用ルール: Draft buildは公開物として扱う。**

---

# 3. 2026 Submitフローの重要変更

公式2026 Submit form記事で、2026年のアップロード時自動検査が明記されている。

公式:

https://js13kgames.com/2026/blog/submit-form-open

## 3.1 ZIPアップロードごとにブラウザテスト

build ZIPを送るたびに、ゲームは大会側の基本的なブラウザテストを受ける。

例として公式が挙げているのは、missing assets等による **console error**。

エラーがある場合、次のSubmissionステップへ進めない。

これはRainbow Relayにとって重要。

こちらですでに行っているPlaywright UIテストは、方向として大会側の検査と相性がよい。

---

## 3.2 大会側テストはChromium

公式によると自動テストには **Chromium** が使われる。

ただし、実行環境は共有かつリソース制限あり。

公式が注意例として挙げているもの:

- Roadroller等で強く圧縮され、起動時の展開に時間がかかるもの
- page load前に重いCPU処理を行うもの
- 起動時に大量のprocedural asset generationを行うもの

これらはローカルPCでは動いても、大会側環境ではリソース制限に引っかかる可能性がある。

### Rainbow Relayへの影響

容量だけを詰めるのではなく、**起動時間・展開負荷もSubmission品質の一部**として扱う。

Roadrollerを導入する場合も、最終ZIPサイズだけでなく大会側Chromiumでの起動を確認する。

---

## 3.3 自動サムネイル生成

ZIPテスト時、ゲーム起動直後のスクリーンショットから cover / thumbnail が自動生成される。

Presentationステップで正式画像を設定するまでの暫定画像として使われる。

そのため、**起動直後に完全な真っ白画面が長く続く構成は避ける**方がよい。

これはゲーム内容ではなく提出UX上の注意。

---

## 3.4 締切後のminor fixes

2026年は試験的に、締切後24時間の **minor fixes** 枠がある。

ただし、すべて手動validation / acceptが必要。

これを通常の開発時間として期待しない。

Rainbow Relayは従来通り **9月13日 13:00 CEST（20:00 JST）までに正常build完成** を基準にする。

---

# 4. コミュニティの状況

公式開始記事:

https://js13kgames.com/2026/blog/competition-has-started

公式は参加者に対して明示的に以下を勧めている。

- collaborate
- document
- share
- promote
- theme ideasの相談
- bug fixの助け合い
- playtest

主なコミュニティとして:

- js13kGames Slack
- Gamedev.js Discord の `#js13kGames`

が案内されている。

公式トップにもSlack / Discordへの導線が常設されている。

---

## 4.1 サイト内フィードバック

2026開始記事では、Expertによるfeedbackに加え、**fellow developersから多数のcommentsが得られる**ことが説明されている。

主催は各entryに少なくとも1件のExpert feedbackを目指している。

したがってjs13kGamesは、単に提出して採点されるだけではなく、参加者同士のレビュー文化が強い大会と判断できる。

---

## 4.2 「今どれくらい盛り上がっているか」の限界

Slack / Discordの会話ログ自体は一般Web検索から十分取得できなかった。

そのため、2026-09-08時点で、例えば以下を定量的には確認できない。

- 1日何件投稿されているか
- Roadrollerの話題が何件あるか
- Submission error報告が何件あるか
- Online relayのトラブル件数

これらを本当に定点観測するにはコミュニティへの参加が必要。

ただし、参加した場合もRainbow Relayの独自性を守るため、**技術チャンネル / 技術キーワード中心に観測し、他ゲームの内容は見ない**運用とする。

観測候補キーワード:

```text
13kb
compression
zip
Roadroller
Terser
ECT
build
submission
console error
Chromium
mobile
Safari
WebAudio
Canvas
Online
WebSocket
PartySocket
relay
offline-first
```

---

# 5. 公開技術ノウハウの傾向

他作品のゲーム内容は見ず、公開ソースの **開発・ビルド構成だけ** を参考にする方針。

これまでの観察では、js13k系でよく使われる構成は以下。

```text
読みやすい開発ソース
  ↓
bundle
  ↓
minify / mangle
  ↓
必要ならRoadroller等
  ↓
HTMLへinline
  ↓
ZIP
  ↓
最終ZIPサイズ測定
  ↓
実ブラウザテスト
```

重要なのは「元ソースが動く」ではなく、**最終提出物が動くこと**。

Rainbow Relayで現在作っている:

```text
npm run build
npm run test:logic
npm run test:ui
```

という基盤は、この大会の技術的性格に適している。

---

# 6. Roadroller / 強圧縮について

Roadrollerはjs13kGamesで長く使われているJavaScript圧縮手段。

公式過去記事:

https://js13kgames.com/2021/blog/roadroller-postmortem

ただし2026年は大会側Chromium validatorがあるため、単に最小サイズを目指すだけでなく、**復号・初期化時間**も見る必要がある。

Rainbow Relayは現在ZIPにまだ大きな余裕があるため、現段階で極端な最適化は不要。

推奨:

```text
通常開発
  → 軽いminify + ZIP

容量が厳しくなったら
  → Terser設定強化
  → Roadroller比較
  → ZIPサイズ比較
  → Playwright
  → 大会Draft Chromium検証
```

「強い圧縮を入れたから必ず採用」ではなく、**サイズ / 起動負荷 / 安定性で比較**する。

---

# 7. Onlineカテゴリ再確認

公式:

https://js13kgames.com/2026/online

2026 Onlineの重要点は変わっていない。

- WebSocket relayを利用可能
- PartySocket v1.3.0を大会サーバーから外部import可能
- PartySocketを13KB ZIPへ含めなくてよい
- relayで送るデータは原則としてゲーム自身が生成
- **offline-first必須**
- Online機能はoptional
- Onlineカテゴリ自体がexperimentalで、ルール変更可能性あり

Rainbow Relayでは、オンライン機能を入れる場合も:

```text
オフライン
  = コアゲーム完成

オンライン
  = 追加の存在感 / 共有 / 雰囲気 / 一時的状態
```

という構造を維持する。

---

# 8. js13kGamesは年次イベント

公式トップでは、js13kGamesは **2012年以来毎年**、8月13日から9月13日に開催されていると説明されている。

https://js13kgames.com/

13KB制限は大会そのもののアイデンティティであり、テーマは毎年変わる。

したがって今年のRainbow Relayで得た以下は、2027年以降にも再利用できる。

- 13,312 bytesサイズゲート
- minify / ZIP pipeline
- Canvas中心の軽量設計
- Playwright UI test
- Logic test
- Mobile / Desktop test
- 最終ZIP test
- offline-first Online設計
- Draft / Submitフローの知識
- 大会側Chromium validatorへの対応

今年のゲーム結果とは別に、**js13k用スターターキット / 開発ノウハウを獲得すること自体に価値がある**。

これは提案・評価であり、大会公式の記述ではない。

---

# 9. 前回レポートからの差分

前回:

`2026-09-07_participation-and-rainbow-relay-status.md`

## 差分1: Draft公開性を確認

前回はDraftを早めに作り、現状のZIPを大会サイトで試すことを推奨していた。

今回、ログアウト状態での公開範囲を確認した結果、方針を修正する。

### 旧

```text
Draft作成
↓
すぐZIPアップロード
↓
大会サイトでテスト
```

### 新

```text
Draft作成
↓
タイトル・フォーム確認
↓
ローカルで開発・テスト
↓
公開されてもよい時点でZIPアップロード
↓
大会サイトでテスト
```

---

## 差分2: 2026 Submission validatorを確認

2026年はZIP upload時にChromiumのbasic in-browser testが実施される。

Rainbow RelayのPlaywright導入価値がさらに高くなった。

---

## 差分3: 起動負荷も評価対象になった

Roadroller等の強圧縮や、起動前の重いprocedural generationは、大会側の共有・制限Chromium環境で問題になる可能性が公式に明記された。

以後は:

- ZIP bytes
- 実行可否
- console error
- startup time / startup CPU

をセットで見る。

---

# 10. Rainbow Relayへの反映候補

優先度順。

## A. すぐ行う

1. Draftは作成してよい
2. buildアップロードは公開可能になってから
3. 現在のLogic / Playwrightテストを維持
4. `dist` と `game.zip` 展開後テストを追加する

## B. Submission前

5. Console error = 0 を確認
6. Chromiumで提出ZIPを起動
7. 起動直後に画面が描画されることを確認
8. ネットワークなしでコアゲームが成立することを確認
9. 大会Draftへアップロードし公式validatorを通す

## C. 容量が厳しくなった場合

10. Roadroller等を比較導入
11. 圧縮率だけでなく起動負荷も比較
12. 最終ZIPを唯一のサイズ判定対象にする

---

# 11. 次回定点観測項目

次回は、他作品の内容を見ずに以下を確認する。

1. Submission form / validatorの仕様変更
2. Draft公開範囲の変更
3. minor fixes運用の追加説明
4. Onlineカテゴリルール変更
5. PartySocket / relay障害・仕様変更
6. 公式ブログの技術注意事項
7. Slack / Discordで技術的な共通障害が起きているか
8. Chromium / Mobile / Safari等の互換性トラブル
9. Roadroller / Terser / ZIP最適化の新しい知見
10. Rainbow Relayへ反映すべきものがあるか

特に、他作品の **ゲーム内容は観測対象外** とする。

---

# 12. 参照先

## 公式

- js13kGames 2026: https://js13kgames.com/
- Competition started: https://js13kgames.com/2026/blog/competition-has-started
- Submit form 2026: https://js13kgames.com/2026/blog/submit-form-open
- Online 2026: https://js13kgames.com/2026/online
- Rules: https://js13kgames.com/2026/rules
- Contact / community links: https://js13kgames.com/contact
- Resources: https://js13kgames.com/resources
- Roadroller postmortem: https://js13kgames.com/2021/blog/roadroller-postmortem

## Rainbow Relay

- Repository: https://github.com/hajime777/js13k-2026-rainbow-relay

---

# 13. 現時点の判断

Rainbow Relayは、13KBという特殊な制約に対する **開発・圧縮・テスト基盤** がすでにかなり整っている。

今回の調査で新たに重要になったのは、

> **大会サイトへのDraft buildアップロードは、単なる非公開ステージング環境ではない**

という点。

したがって、ローカルでのPlaywright / Logic / ZIPテストを先に充実させ、公開可能な状態になってから大会側validatorへ持ち込む方針が最も安全。
