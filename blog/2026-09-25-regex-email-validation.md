---
slug: regex-email-validation
title: 正規表現でメールアドレスを検証するときに気をつけること
authors: [ryouma]
tags: [csharp, regex, security, dotnet]
---

「メールアドレスの形式チェック」は実装頻度が高い一方で、正規表現一発で完璧にやろうとすると詰みやすい処理です。.NET公式ドキュメントの実装例を題材に、単純な正規表現の限界と、実務で気をつけるべきポイントを整理します。

{/* truncate */}

## 完全な正規表現でメールを検証しようとしてはいけない

メールアドレスの形式はRFCで定義されていますが、それを100%満たす正規表現を書こうとすると、式が非常に複雑になりデバッグも改善も困難になります。しかも、たとえ構文的に正しい形式だと判定できても、**そのアドレスが実在するかどうかは正規表現では分かりません**。

.NET公式ドキュメントでは、この点について明確な指針を示しています。

- ✔️ 小さな正規表現で「構造として妥当かどうか」だけを確認する
- ✔️ 実際にそのアドレス宛にテストメールを送って存在確認をする
- ❌ 正規表現だけをメール検証の唯一の手段にしない

つまり正規表現は「あからさまにおかしい入力を弾くフィルタ」であって、「正しさの証明」ではない、と割り切るのが現実的な設計です。

## 信頼できない入力に正規表現を使う怖さ（ReDoS）

もう一つ見落とされがちなのが、**信頼できない入力に対して正規表現を無制限に実行する危険性**です。書き方によっては、特定の入力パターンに対して正規表現エンジンが破滅的バックトラッキングを起こし、処理時間が入力長に対して指数的に増加することがあります。これを悪用した攻撃が **ReDoS（Regular expression Denial of Service）** です。

対策として、.NETの `Regex` クラスには**タイムアウト**を指定できます。

```csharp
Regex.IsMatch(email,
    @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    RegexOptions.IgnoreCase,
    TimeSpan.FromMilliseconds(250));
```

第4引数に `TimeSpan` を渡すと、その時間内にマッチングが終わらない場合は `RegexMatchTimeoutException` がスローされます。ユーザー入力やAPI経由で受け取った文字列を正規表現にかけるときは、このタイムアウトを必ず設定し、例外を捕捉して「無効な入力として扱う」ようにするのが安全です。

## ドメイン名の国際化対応（IdnMapping）

もう一つの実務上のポイントが、**国際化ドメイン名（IDN）** の扱いです。メールアドレスのドメイン部分には日本語などUnicode文字を含むドメインが使われることがありますが、内部的なメール配送やDNS解決ではASCII表現（Punycode、`xn--` 始まりの形式）に変換する必要があります。

.NETでは `System.Globalization.IdnMapping` クラスの `GetAscii` メソッドがこの変換を担います。

処理の流れは次の通りです。

1. `Regex.Replace(email, @"(@)(.+)$", DomainMapper, ...)` で、メールアドレスを `@` の前後（ローカル部とドメイン部）に分割する
2. マッチした部分を `MatchEvaluator` デリゲート（`DomainMapper` メソッド）に渡す
3. `DomainMapper` の中で `IdnMapping.GetAscii()` を呼び、ドメイン名をUnicodeからPunycode（ASCII）に変換する
4. 変換後のドメイン名を `@` の前の部分と結合し、正規化されたメールアドレス文字列として返す

**MatchEvaluatorデリゲート**は、`Regex.Replace` の第3引数に渡せる「マッチした部分をどう置き換えるかを決める関数」です。単純な文字列置換では対応できない、"マッチ結果を加工してから置き換える"というケースで使います。今回の例では「ドメイン名部分だけを取り出してPunycode変換し、`@`と結合し直す」という加工をこのデリゲートの中で行っています。

不正なドメイン名が渡された場合、`GetAscii` は `ArgumentException` を投げるため、これも合わせて捕捉する必要があります。

## 実装例と正規表現パターンの解説

公式ドキュメントに掲載されている実装全体は次の通りです。

```csharp
using System;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RegexExamples
{
    class RegexUtilities
    {
        public static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                // ドメイン名を正規化する
                email = Regex.Replace(email, @"(@)(.+)$", DomainMapper,
                                      RegexOptions.None, TimeSpan.FromMilliseconds(200));

                // マッチしたドメイン部分を処理・正規化するローカル関数
                string DomainMapper(Match match)
                {
                    // IdnMappingクラスでUnicodeドメイン名を変換する
                    var idn = new IdnMapping();

                    // ドメイン名を取り出して処理する（不正な場合はArgumentException）
                    string domainName = idn.GetAscii(match.Groups[2].Value);

                    return match.Groups[1].Value + domainName;
                }
            }
            catch (RegexMatchTimeoutException e)
            {
                return false;
            }
            catch (ArgumentException e)
            {
                return false;
            }

            try
            {
                return Regex.IsMatch(email,
                    @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                    RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
            }
            catch (RegexMatchTimeoutException)
            {
                return false;
            }
        }
    }
}
```

1つ目の正規表現 `(@)(.+)$` は、ドメイン名を切り出すためだけのシンプルな式です。

| パターン | 説明 |
| --- | --- |
| `(@)` | `@` 文字にマッチ。1番目のキャプチャグループ |
| `(.+)` | 1文字以上の任意の文字にマッチ。2番目のキャプチャグループ（ドメイン部分） |
| `$` | 文字列の末尾で照合を終了 |

2つ目の正規表現 `^[^@\s]+@[^@\s]+\.[^@\s]+$` が、実際の形式チェックを行っています。

| パターン | 説明 |
| --- | --- |
| `^` | 文字列の先頭から照合開始 |
| `[^@\s]+` | `@`でも空白でもない文字が1文字以上（ローカル部） |
| `@` | `@` 文字にマッチ |
| `[^@\s]+` | `@`でも空白でもない文字が1文字以上（ドメイン名の一部） |
| `\.` | ピリオド1文字にマッチ |
| `[^@\s]+` | `@`でも空白でもない文字が1文字以上（トップレベルドメインなど） |
| `$` | 文字列の末尾で照合終了 |

ドキュメント自身も明記している通り、この正規表現は「有効なメールアドレスのすべての側面をカバーするものではなく、必要に応じて拡張するための一例」です。また、このメソッドはトップレベルドメインがIANAのルートゾーンデータベースに実在するかどうかまでは検証しません。

## まとめ

メールアドレスの正規表現検証で押さえておきたいポイントは3つです。

1. **正規表現は「明らかにおかしい入力」を弾くための軽いチェックに留め、完全性を求めない**。実在確認は実際にメールを送って行う
2. **信頼できない入力を正規表現にかける際は必ずタイムアウトを設定し、ReDoSに備える**
3. **国際化ドメインを扱う場合は `IdnMapping` でPunycode変換してから照合する**。`MatchEvaluator` はマッチ結果を加工してから置換したいときの標準的な手段

「バリデーションは正規表現で全部やる」という発想自体を見直すきっかけになる、良い実装例です。

参考: [文字列が有効な電子メール形式であることを確認する方法 - .NET | Microsoft Learn](https://learn.microsoft.com/ja-jp/dotnet/standard/base-types/how-to-verify-that-strings-are-in-valid-email-format)
