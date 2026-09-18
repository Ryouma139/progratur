---
id: http
title: HTTP
sidebar_label: HTTP
---

# HTTP

:::tip[標準ライブラリより requests / httpx]
標準の `urllib` は低レベルで使いにくいため、実際のプロジェクトでは `requests`（同期）または `httpx`（非同期対応）が広く使われます。
:::

## urllib (標準ライブラリ)

```python
import urllib.request
import urllib.parse
import json

# GET
with urllib.request.urlopen("https://api.github.com/users/python") as resp:
    body = resp.read().decode("utf-8")
    data = json.loads(body)
    print(data["name"])
    print(resp.status)        # 200
    print(resp.headers["Content-Type"])

# POST JSON
payload = json.dumps({"name": "Alice"}).encode("utf-8")
req = urllib.request.Request(
    "https://api.example.com/users",
    data    = payload,
    headers = {"Content-Type": "application/json"},
    method  = "POST"
)
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode("utf-8"))
```

## requests (サードパーティ)

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# セッション (接続の再利用 + 共通ヘッダー)
session = requests.Session()
session.headers.update({
    "Authorization": "Bearer token123",
    "Accept": "application/json"
})

# リトライ設定
retry = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503])
session.mount("https://", HTTPAdapter(max_retries=retry))

# GET
resp = session.get("https://api.example.com/users",
    params={"page": 1, "limit": 10},
    timeout=10
)
resp.raise_for_status()   # 4xx/5xx で例外
data = resp.json()

# POST
resp = session.post("https://api.example.com/users",
    json={"name": "Alice", "age": 30}
)

# ファイルアップロード
with open("image.png", "rb") as f:
    resp = session.post("https://api.example.com/upload",
        files={"file": ("image.png", f, "image/png")}
    )

# 非同期 HTTP — httpx (pip install httpx)
import httpx
import asyncio

async def fetch_all():
    async with httpx.AsyncClient() as client:
        tasks = [client.get(f"https://api.example.com/{i}") for i in range(5)]
        responses = await asyncio.gather(*tasks)
    return [r.json() for r in responses]
```

:::caution[raise_for_status を忘れない]
`requests` は 4xx / 5xx のレスポンスが返ってきても例外を投げません。`resp.raise_for_status()` を呼んで初めて `HTTPError` が送出されるため、エラーハンドリングを書く際は明示的に呼び出す必要があります。
:::
