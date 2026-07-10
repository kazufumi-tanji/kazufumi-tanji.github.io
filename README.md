# kazufumi-tanji.github.io

丹治和史の研究者向け個人ホームページです。HTML、CSS、JavaScriptだけで構成され、ビルド処理なしでGitHub Pagesに公開できます。

## サイト構成

- `index.html`：日本語版
- `en/index.html`：英語版
- `assets/css/style.css`：配色、フォント、レイアウト
- `assets/js/site.js`：ナビゲーション、BibTeX・Markdownの読み込みと一覧生成
- `data/MyPapers.bib`：論文の元データ
- `data/Conference.md`：学会発表の元データ

## VS Code Live Previewで確認する

1. VS Codeでこのリポジトリのフォルダーを開きます。
2. Microsoftの拡張機能「Live Preview」をインストールします。
3. `index.html`を開き、エディター右上のプレビューボタン、またはコマンドパレットの `Live Preview: Show Preview` を実行します。
4. 日本語版を確認し、ヘッダーの「English」から英語版にも移動できることを確認します。

論文・発表データはブラウザの `fetch` を使って読み込むため、HTMLファイルをエクスプローラーから直接開くのではなく、Live Previewなどのローカルサーバーを使ってください。

## GitHub Pagesで公開する

1. 変更を `main` ブランチへコミットし、GitHubへプッシュします。
2. GitHubでリポジトリの **Settings → Pages** を開きます。
3. **Build and deployment** の **Source** で **Deploy from a branch** を選びます。
4. **Branch** で `main` と `/(root)` を選び、**Save** を押します。
5. 公開処理の完了後、`https://kazufumi-tanji.github.io/` を確認します。

GitHub Actions、Jekyll、Node.js、npmは不要です。

## 論文を追加する

`data/MyPapers.bib` にBibTeXエントリーを追加します。既存データと同様に `author`、`title`、`year` を記載し、存在する場合は `journal` または `booktitle`、`volume`、`pages`、`doi`、`eprint` も記載してください。保存するとJavaScriptが分類ごとに年の新しい順に並べます。`@inproceedings` はProceedingsへ、それ以外のエントリーはPapersへ分類されます。著者名が `Tanji, Kazufumi` または `Kazufumi Tanji` なら自動的に下線が付きます。

## 学会発表を追加する

`data/Conference.md` の該当する表に1行追加します。列の順序（Author、Title、Conference、Place、Year and Date、Talk / Poster）は変えないでください。`Year and Date` に西暦4桁の年、月、開始日を記載すると、開催日の新しい順に並べます。会議名に `QIT` と回数（例：`QIT54`）を含む発表は「査読なし」、それ以外は「査読あり」に分類されます。`Kazufumi Tanji`、`丹治 和史`、`丹治和史` には自動的に下線が付きます。

## 日本語版・英語版を修正する

- 日本語の見出し、経歴、受賞、連絡先：`index.html`
- 英語の見出し、経歴、受賞、連絡先：`en/index.html`
- 両言語に共通する論文・学会発表：`data/` 内の2ファイル
- 一覧の表示処理やメニューボタン：`assets/js/site.js`

一方の言語で経歴などを変更した場合は、もう一方にも同じ内容を反映してください。

## 配色やフォントを変更する

`assets/css/style.css` 冒頭の `:root` にあるCSSカスタムプロパティを編集します。

- `--navy`：基調色
- `--red`：アクセント色
- `--ink`：本文色
- `--paper`：背景色
- `--sans`：氏名・見出しを含むサイト全体のフォント

現在は端末にNotoフォントがあれば優先して使い、なければOS標準フォントへ切り替わります。外部フォント配信サービスには依存していません。
