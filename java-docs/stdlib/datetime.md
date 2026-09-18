---
id: datetime
title: 日付・時間
sidebar_label: 日付・時間
---

# 日付・時間 (java.time)

:::tip[java.time を使う]
Java 8 以降は `java.time` パッケージを使用します。旧来の `java.util.Date` / `Calendar` は非推奨扱いです。
:::

```java
import java.time.*;
import java.time.format.*;
import java.time.temporal.*;

// 主要クラス
LocalDate     date    = LocalDate.now();             // 日付のみ (タイムゾーンなし)
LocalTime     time    = LocalTime.now();             // 時刻のみ
LocalDateTime dt      = LocalDateTime.now();         // 日時 (タイムゾーンなし)
ZonedDateTime zdt     = ZonedDateTime.now(ZoneId.of("Asia/Tokyo")); // タイムゾーン付き
Instant       instant = Instant.now();               // UTC エポック秒

// 生成
LocalDate d  = LocalDate.of(2024, 3, 15);
LocalDate d2 = LocalDate.of(2024, Month.MARCH, 15);
LocalTime t  = LocalTime.of(10, 30, 0);
LocalDateTime fixed = LocalDateTime.of(2024, 3, 15, 10, 30);

// 演算
LocalDate tomorrow   = date.plusDays(1);
LocalDate lastMonth  = date.minusMonths(1);
LocalDate nextYear   = date.plusYears(1);

// Duration (時間の長さ) / Period (日付の長さ)
Duration dur    = Duration.ofHours(2).plusMinutes(30); // 2h30m
Period   period = Period.of(1, 2, 3);                  // 1年2ヶ月3日
System.out.println(dur.toMinutes()); // 150

Duration between = Duration.between(LocalTime.NOON, LocalTime.of(14, 30));
Period   diff    = Period.between(LocalDate.of(2020, 1, 1), LocalDate.now());

// 比較
boolean isBefore = date.isBefore(tomorrow);   // true
boolean isAfter  = tomorrow.isAfter(date);     // true

// 書式
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy年M月d日 HH:mm");
String formatted = dt.format(fmt);
LocalDateTime parsed = LocalDateTime.parse("2024-03-15T10:30:00");

// タイムゾーン変換
ZoneId jst  = ZoneId.of("Asia/Tokyo");
ZoneId utc  = ZoneId.of("UTC");
ZonedDateTime jstTime = ZonedDateTime.now(jst);
ZonedDateTime utcTime = jstTime.withZoneSameInstant(utc);
System.out.println(utcTime);

// Instant ↔ LocalDateTime 変換
Instant now   = Instant.now();
LocalDateTime local = LocalDateTime.ofInstant(now, ZoneId.systemDefault());
Instant back  = local.atZone(ZoneId.systemDefault()).toInstant();
```

:::note[Duration と Period の使い分け]
`Duration` は「時・分・秒」の絶対的な時間の長さ、`Period` は「年・月・日」のカレンダー上の長さです。夏時間の切り替えなどを考慮すると、日付同士の差には `Period`、時刻同士や時間の計測には `Duration` を使うのが適切です。
:::
