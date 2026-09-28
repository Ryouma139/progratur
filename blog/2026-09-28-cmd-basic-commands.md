---
slug: cmd-basic-commands
title: マウス操作をコマンドプロンプトに置き換える基本コマンド集
authors: [ryouma]
tags: [windows, cmd, cli, productivity]
---

エクスプローラーでのフォルダ作成・移動・検索は、慣れるとコマンドプロンプト（cmd.exe）からの方が速いことが多いです。よく使う操作を目的別に整理しました。

{/* truncate */}

## ディレクトリ操作

```cmd
cd path\to\folder      REM フォルダ移動
cd ..                  REM 1つ上の階層へ
md abc\def\ghi         REM abc, abc\def, abc\def\ghi を一度に作成
tree /f                REM サブフォルダ・ファイルまで含めて構造を表示
tree /f > tree.txt     REM 結果をテキストファイルへ出力
```

`md`（`mkdir`）は、Unix系の`mkdir -p`のように**途中の階層が存在しなくても、バックスラッシュ区切りで指定した階層をまとめて作成**してくれます。`md abc\def\ghi`と打てば、`abc`フォルダが無くても`abc`→`abc\def`→`abc\def\ghi`まで一気に作られます。

## ファイル操作

```cmd
copy src.txt dst.txt        REM コピー
move src.txt dst\           REM 移動
del file.txt                REM 削除
ren old.txt new.txt         REM リネーム
fc file1.txt file2.txt      REM 2つのファイルの差分を表示
find "検索文字列" file.txt   REM ファイル内の文字列検索
```

`fc`（File Compare）は2つのテキストファイルを行単位で比較し、差分箇所を表示してくれるので、設定ファイルの変更点を目視で確認したいときに便利です。`find`は単純な文字列検索用で、正規表現を使いたい場合は`findstr`を使います。

## ディスク・システム管理

```cmd
chkdsk C:              REM ドライブのエラーチェック
defrag C:              REM ドライブの最適化（デフラグ）
shutdown /s /t 0       REM 即座にシャットダウン
shutdown /r /t 0       REM 即座に再起動
shutdown /a            REM スケジュールされたシャットダウンを中止
```

`shutdown`の`/t`オプションは「実行までの待ち時間（秒）」を指定します。`/t 0`は即実行、`/t 60`なら60秒後に実行という意味になり、`/a`でその予約をキャンセルできます。

## ネットワーク確認

```cmd
ping example.com        REM 疎通確認
ipconfig                REM ネットワーク設定の概要を表示
ipconfig /all            REM アダプタごとの詳細情報を表示
ipconfig /flushdns       REM DNSキャッシュのクリア
```

`ping`で応答が返ってくるかどうかは「相手のサーバーに到達できるか」の一次切り分けとして使え、`ipconfig`は自分側のIPアドレスやDNS設定を確認する際の基本コマンドです。

## Windows 10以降でのコピー＆ペースト挙動の変化

MS-DOS時代からの慣習で、コマンドプロンプトでは長らく`Ctrl+C`は文字列のコピーではなく**実行中の処理を中断するショートカット**として扱われていました。テキストをコピーするには右クリックメニューから「範囲指定（Mark）」モードに入る必要があり、他のアプリと挙動が異なっていました。

Windows 10以降ではこの点が改善され、コンソールのプロパティで「エクスペリエンスの新しいコンソールを使う」系の設定を有効にすると、テキストを選択した状態での`Ctrl+C`/`Ctrl+V`によるコピー＆ペーストに対応しています（実行中断は`Ctrl+Break`などに引き継がれています）。長年cmdを使ってきた人ほど、この挙動の違いに驚くポイントです。

## まとめ

フォルダの多階層作成（`md`の一括作成）や`tree /f`によるファイル構造の書き出しなど、GUIでは地味に手間がかかる作業ほどコマンド化の恩恵が大きくなります。まずは「よく使うフォルダ移動・作成」「ファイル比較・検索」あたりから置き換えていくと、コマンドプロンプトの効率の良さを実感しやすいです。

参考: [Windowsコマンドプロンプトの使い方まとめ - TechMania](https://techmania.jp/blog/cmd0002/)
