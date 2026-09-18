---
id: datetime
title: 日付・時間
sidebar_label: 日付・時間
---

# 日付・時間

```python
from datetime import date, time, datetime, timedelta, timezone
from zoneinfo import ZoneInfo   # Python 3.9+

# 基本
today    = date.today()
now      = datetime.now()
utc_now  = datetime.now(timezone.utc)

# 生成
d  = date(2024, 3, 15)
t  = time(10, 30, 0)
dt = datetime(2024, 3, 15, 10, 30, 0)

# タイムゾーン付き (zoneinfo を使う)
jst     = ZoneInfo("Asia/Tokyo")
jst_now = datetime.now(jst)
utc_now = jst_now.astimezone(timezone.utc)

# 演算
tomorrow   = today + timedelta(days=1)
last_month = today - timedelta(days=30)
next_week  = now   + timedelta(weeks=1)

diff = tomorrow - today      # timedelta(days=1)
print(diff.total_seconds())  # 86400.0
print(diff.days)             # 1

# 比較
print(tomorrow > today)  # True

# 書式
print(now.strftime("%Y/%m/%d %H:%M:%S"))  # 2024/03/15 10:30:00
print(now.strftime("%Y年%m月%d日"))
print(now.isoformat())   # 2024-03-15T10:30:00

# パース
dt = datetime.strptime("2024-03-15 10:30:00", "%Y-%m-%d %H:%M:%S")
dt = datetime.fromisoformat("2024-03-15T10:30:00")   # Python 3.7+

# UNIX タイムスタンプ
ts = now.timestamp()             # 秒
dt = datetime.fromtimestamp(ts)  # ローカル時間
dt = datetime.fromtimestamp(ts, tz=timezone.utc)  # UTC

# dateutil (pip install python-dateutil) — より柔軟なパース
# from dateutil import parser
# parser.parse("March 15, 2024 10:30 JST")
```

:::tip[zoneinfo を使う]
Python 3.9 以降は標準ライブラリの `zoneinfo` でIANAタイムゾーンデータベース（`"Asia/Tokyo"` など）を扱えます。それ以前のバージョンでは `pytz` サードパーティライブラリが必要でした。新規コードでは `zoneinfo` を優先します。
:::
