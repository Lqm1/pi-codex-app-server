# Release Please と生成ファイルの扱い

## 結論

- `CHANGELOG.md` は Release Please が更新する生成物として扱い、Oxfmt の対象外にする。
- npm 公開ジョブでは、リリース済みコミットを検証して公開するだけにし、ファイルを書き換えない。
- 公開条件は Release Please の `release_created` 出力だけにする。
- 同一ワークフロー内で Release Please の `sha` をチェックアウトし、`version` と `package.json` の一致を確認してから公開する。

## 根拠

Release Please は Conventional Commits からリリース PR を維持し、その PR でバージョンと `CHANGELOG.md` を更新するツールである。したがって、`CHANGELOG.md` の表現は Release Please が所有する生成結果として扱うのが自然である。

- [Release Please Action: How release please works](https://github.com/googleapis/release-please-action#how-release-please-works)

公式の npm 公開例は、`release_created` が真になった同じワークフロー内で checkout、依存関係の導入、`npm publish` を行う。ルートパッケージでは `sha` と `version` も正式な出力として提供される。

- [Release Please Action: Automating publication to npm](https://github.com/googleapis/release-please-action#automating-publication-to-npm)
- [Release Please Action: Outputs](https://github.com/googleapis/release-please-action#outputs)

公開直前に `fix` を実行すると、GitHub Release が指すコミットと実際に梱包する作業ツリーが一致しなくなる可能性がある。これは上記仕様からの設計上の判断であり、公開ジョブは検証に失敗したら停止させ、修正は次のコミットまたは Release PR に含める。

Release Please が既定の `GITHUB_TOKEN` で作成した release や tag によるイベントは、原則として別のワークフローを起動しない。公開処理を `release.created` などに分離せず、Release Please の出力に続ける構成なら、追加の PAT も不要になる。

- [Release Please Action: Other Actions on Release Please PRs](https://github.com/googleapis/release-please-action#other-actions-on-release-please-prs)
- [GitHub Docs: Triggering a workflow from a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow)

## 採用した運用

通常の変更は Conventional Commits で `main` に取り込み、Release Please が更新する Release PR をマージする。リリース作成時だけ npm 公開ジョブが動く。`CHANGELOG.md` は formatter から除外するが、Release PR のレビュー対象には含める。
