---
id: json
title: JSON
sidebar_label: JSON
---

# JSON

.NET 標準の `System.Text.Json` を使うと、外部パッケージなしで JSON の読み書きができます（`Newtonsoft.Json` を使うプロジェクトも依然として多いですが、ここでは標準ライブラリを扱います）。

## オブジェクトのシリアライズ / デシリアライズ

```csharp
using System.Text.Json;

public record Person(string Name, int Age);

var person = new Person("Alice", 30);

// オブジェクト → JSON文字列
string json = JsonSerializer.Serialize(person);
// {"Name":"Alice","Age":30}

// JSON文字列 → オブジェクト
Person? restored = JsonSerializer.Deserialize<Person>(json);
Console.WriteLine(restored?.Name); // Alice
```

## シリアライズオプション

```csharp
var options = new JsonSerializerOptions
{
    WriteIndented = true,                                  // 整形出力
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,      // camelCase に変換
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // null プロパティを省略
};

string pretty = JsonSerializer.Serialize(person, options);
/*
{
  "name": "Alice",
  "age": 30
}
*/
```

## 属性による制御

```csharp
public class Product
{
    [JsonPropertyName("product_name")]
    public string Name { get; set; } = "";

    [JsonIgnore]
    public string InternalNote { get; set; } = "";

    public decimal Price { get; set; }
}
```

## 動的な JSON の扱い — JsonDocument / JsonNode

型を事前に定義できない場合は `JsonDocument`（読み取り専用）や `JsonNode`（読み書き可能）が使えます。

```csharp
string raw = """{"name":"Bob","tags":["admin","user"]}""";

using JsonDocument doc = JsonDocument.Parse(raw);
JsonElement root = doc.RootElement;
string name = root.GetProperty("name").GetString()!;
foreach (var tag in root.GetProperty("tags").EnumerateArray())
{
    Console.WriteLine(tag.GetString());
}

// JsonNode: 書き換えて再度文字列化したい場合に便利
JsonNode? node = JsonNode.Parse(raw);
node!["age"] = 25; // プロパティを追加
Console.WriteLine(node.ToJsonString());
```

## 非同期でのファイル / HTTP との連携

```csharp
// ファイルへの直接シリアライズ
await using FileStream fs = File.Create("person.json");
await JsonSerializer.SerializeAsync(fs, person);

// HTTPレスポンスをそのままデシリアライズ
using var client = new HttpClient();
Person? apiResult = await client.GetFromJsonAsync<Person>("https://api.example.com/person/1");
```

:::note[コンストラクタとレコード]
`record` や `readonly` プロパティのみのクラスも、`System.Text.Json` はコンストラクタ引数とプロパティ名を照合してデシリアライズできます（大文字小文字は既定で区別されないマッチングが行われます）。
:::
