---
id: clr-and-gc
title: CLR と GC
sidebar_label: CLR と GC
---

# CLR と GC

## CLR（共通言語ランタイム）とは

C# のソースコードはコンパイル時に **IL（中間言語, Intermediate Language）** に変換され、実行時に **CLR (Common Language Runtime)** が JIT（Just-In-Time）コンパイラでネイティブコードに変換しながら実行します。

```text
C# ソース (.cs)
   ↓ csc / Roslyn コンパイラ
IL コード + メタデータ (.dll / .exe)
   ↓ CLR が実行時にロード
JIT コンパイラがネイティブコードへ変換
   ↓
CPU が実行
```

CLR が担う主な役割:

- **JIT コンパイル** — 実際に呼び出されたメソッドだけをその場でネイティブコード化（起動を速くするため ReadyToRun / AOT というアプローチもある）
- **型安全性の保証** — 不正なキャストやメモリアクセスを実行時に検出
- **ガベージコレクション** — 不要になったオブジェクトのメモリを自動回収
- **例外処理** — `try/catch/finally` の統一的な機構
- **相互運用 (Interop)** — アンマネージド (P/Invoke) コードとの連携

## 値型と参照型

```csharp
// 値型 (struct, int, bool, enum など): スタックまたは格納先に直接値を保持
int a = 10;
int b = a; // 値のコピー
b = 20;
Console.WriteLine(a); // 10（影響を受けない）

// 参照型 (class, string, array など): ヒープにオブジェクトを確保し、変数は参照を保持
var list1 = new List<int> { 1, 2, 3 };
var list2 = list1; // 参照のコピー（同じオブジェクトを指す）
list2.Add(4);
Console.WriteLine(list1.Count); // 4（同じインスタンスなので影響を受ける）
```

## ガベージコレクション (GC)

.NET の GC は **世代別 (generational)** GC です。オブジェクトは寿命に応じて 3 つの世代に分類され、短命なオブジェクトほど頻繁に回収対象になります。

- **Gen 0** — 生成されたばかりのオブジェクト。最も頻繁に GC が走る領域
- **Gen 1** — Gen 0 の GC を生き延びたオブジェクトの一時置き場
- **Gen 2** — 長く生き続けるオブジェクト（キャッシュ、静的に保持されるデータなど）。回収コストが最も高い

```csharp
// GCへの手動介入は原則不要・非推奨だが、挙動を観察する例として
Console.WriteLine(GC.CollectionCount(0)); // Gen0 の GC が発生した回数

var data = new byte[10_000_000];
GC.Collect(); // 明示的な回収を要求（通常のコードでは書かない）
```

**LOH (Large Object Heap)**: 85,000 バイト以上の大きなオブジェクトは通常のヒープとは別の LOH に配置され、断片化を避けるため世代別 GC の対象外（Gen 2 と一緒に回収）として扱われます。大きな配列やバッファを頻繁に生成すると LOH の断片化・GC 負荷につながるため、`ArrayPool<T>` などで再利用するのが定石です。

## IDisposable と using

GC はメモリ以外のリソース（ファイルハンドル、ソケット、DB 接続など）を**タイミングよく**解放してくれません。そのため、`IDisposable` を実装した型は `using` で確実に解放します。

```csharp
// using 文: スコープを抜けると自動的に Dispose() が呼ばれる
using (var reader = new StreamReader("data.txt"))
{
    string content = reader.ReadToEnd();
}

// using 宣言（C# 8.0+）: 囲むブロックの終わりで Dispose される
using var writer = new StreamWriter("out.txt");
writer.WriteLine("Hello");
```

:::note[ファイナライザ (デストラクタ) との違い]
`~ClassName() { }` のようなファイナライザは GC が実行するタイミングを制御できず、実行自体が保証されないこともあります。決定的にリソースを解放したい場合は `IDisposable` + `using` を使うのが基本方針です。
:::
