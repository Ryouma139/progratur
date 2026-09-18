---
id: datetime
title: 日付・時間
sidebar_label: 日付・時間
---

# 日付・時間

## DateTime と DateTimeOffset

`DateTime` はタイムゾーン情報を持たず（`Kind` プロパティで Local/Utc/Unspecified を区別するのみ）、`DateTimeOffset` はUTCとの差分オフセットを保持します。サーバーサイドやAPI連携では基本的に `DateTimeOffset` を使うのが安全です。

```csharp
DateTime now = DateTime.Now;      // ローカル時刻
DateTime utcNow = DateTime.UtcNow; // UTC時刻
DateTime specific = new DateTime(2026, 9, 14, 10, 30, 0);

DateTimeOffset dto = DateTimeOffset.Now;
DateTimeOffset dtoUtc = DateTimeOffset.UtcNow;

Console.WriteLine(now.Year);
Console.WriteLine(now.DayOfWeek); // 曜日
```

## 加算・比較・差分

```csharp
DateTime today = DateTime.Today;
DateTime tomorrow = today.AddDays(1);
DateTime nextMonth = today.AddMonths(1);

TimeSpan diff = tomorrow - today; // TimeSpan: 1.00:00:00
Console.WriteLine(diff.TotalHours); // 24

bool isFuture = tomorrow > today;
```

## TimeSpan — 期間

```csharp
TimeSpan duration = new TimeSpan(hours: 1, minutes: 30, seconds: 0);
TimeSpan fromMinutes = TimeSpan.FromMinutes(90); // 上と同じ長さ

Console.WriteLine(duration.TotalMinutes); // 90
Console.WriteLine(duration.ToString());   // "01:30:00"
```

## フォーマット・パース

```csharp
DateTime date = new DateTime(2026, 9, 14);

Console.WriteLine(date.ToString("yyyy-MM-dd"));       // 2026-09-14
Console.WriteLine(date.ToString("yyyy年MM月dd日"));     // 2026年09月14日
Console.WriteLine(date.ToString("F"));                 // ロケール依存の長い形式

DateTime parsed = DateTime.Parse("2026-09-14");
bool ok = DateTime.TryParse("invalid", out DateTime result);
DateTime exact = DateTime.ParseExact("14/09/2026", "dd/MM/yyyy", null);
```

## DateOnly / TimeOnly (.NET 6+)

日付だけ、時刻だけを扱いたい場合は `DateOnly` / `TimeOnly` が時刻情報の混入を防げて安全です。

```csharp
DateOnly birthday = new DateOnly(1996, 4, 1);
TimeOnly openTime = new TimeOnly(9, 0);

DateOnly today = DateOnly.FromDateTime(DateTime.Now);
int ageInDays = today.DayNumber - birthday.DayNumber;
```

## タイムゾーン変換

```csharp
TimeZoneInfo jst = TimeZoneInfo.FindSystemTimeZoneById("Tokyo Standard Time"); // Windows ID
// Linux/macOS の場合は "Asia/Tokyo" (IANA ID) を使う

DateTime utc = DateTime.UtcNow;
DateTime jstTime = TimeZoneInfo.ConvertTimeFromUtc(utc, jst);
```

:::caution[タイムゾーンIDの違い]
Windows と Linux/macOS ではタイムゾーンIDの体系が異なります（`"Tokyo Standard Time"` vs `"Asia/Tokyo"`）。クロスプラットフォームなアプリでは `TimeZoneInfo.FindSystemTimeZoneById` の呼び出しで例外が起きないよう、実行環境に応じたIDを使うか、IANA形式に統一的に対応した仕組み（.NET 6+ は両方受け付ける環境が増えています）を確認してください。
:::
