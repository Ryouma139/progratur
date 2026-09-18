---
id: file-io
title: ファイル I/O
sidebar_label: ファイル I/O
---

# ファイル I/O

## 手軽な読み書き — File クラス

小〜中規模のファイルなら `File` クラスの静的メソッドが簡単です。

```csharp
// 書き込み（上書き）
File.WriteAllText("data.txt", "Hello, World!\n");
File.WriteAllLines("lines.txt", new[] { "1行目", "2行目" });

// 追記
File.AppendAllText("data.txt", "追加行\n");

// 読み込み
string content = File.ReadAllText("data.txt");
string[] lines = File.ReadAllLines("lines.txt");

// 非同期版もある
string asyncContent = await File.ReadAllTextAsync("data.txt");
```

## ストリームを使った読み書き

大きなファイルや逐次処理には `StreamReader` / `StreamWriter` を使い、`using` で確実に破棄します。

```csharp
using (var writer = new StreamWriter("big.txt"))
{
    for (int i = 0; i < 1000; i++)
    {
        writer.WriteLine($"line {i}");
    }
} // ここで自動的に Flush + Close される

using (var reader = new StreamReader("big.txt"))
{
    string? line;
    while ((line = reader.ReadLine()) != null)
    {
        Console.WriteLine(line);
    }
}
```

## バイナリファイル

```csharp
byte[] bytes = File.ReadAllBytes("image.png");
File.WriteAllBytes("copy.png", bytes);

using var fs = new FileStream("data.bin", FileMode.Create);
using var bw = new BinaryWriter(fs);
bw.Write(42);
bw.Write("文字列データ");
```

## ディレクトリ操作

```csharp
Directory.CreateDirectory("output");
bool exists = Directory.Exists("output");

foreach (var file in Directory.EnumerateFiles("output", "*.txt"))
{
    Console.WriteLine(file);
}

foreach (var dir in Directory.EnumerateDirectories("."))
{
    Console.WriteLine(dir);
}

File.Copy("data.txt", "output/data.txt", overwrite: true);
File.Move("data.txt", "archive/data.txt");
File.Delete("temp.txt");
```

## Path クラス — パス操作をOS非依存に

```csharp
string full = Path.Combine("output", "logs", "app.log"); // OSごとの区切り文字を自動使用
string ext = Path.GetExtension(full);        // ".log"
string name = Path.GetFileNameWithoutExtension(full); // "app"
string dir = Path.GetDirectoryName(full);
```

:::caution[例外処理を忘れずに]
ファイル操作は他プロセスによるロックや権限不足などで例外（`IOException`, `UnauthorizedAccessException` など）が発生しえます。ユーザー操作に起因するファイル I/O は `try/catch` で捕捉し、適切なメッセージを表示するのが基本です。
:::
