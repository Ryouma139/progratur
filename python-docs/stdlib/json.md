---
id: json
title: JSON
sidebar_label: JSON
---

# JSON

```python
import json
from pathlib import Path
from dataclasses import dataclass, asdict
from datetime import datetime

# 基本的なシリアライズ / デシリアライズ
data = {"name": "Alice", "age": 30, "tags": ["Python", "ML"], "active": True}

# dict → JSON 文字列
json_str = json.dumps(data)
pretty   = json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True)

# JSON 文字列 → dict
parsed = json.loads(json_str)
print(parsed["name"])  # Alice

# ファイルへの書き込み / 読み込み
path = Path("data.json")
with path.open("w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

with path.open("r", encoding="utf-8") as f:
    loaded = json.load(f)

# カスタムエンコーダ (datetime など非対応型)
class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

data_with_date = {"timestamp": datetime.now(), "value": 42}
json.dumps(data_with_date, cls=CustomEncoder)

# または default 引数に関数を渡す
def encode_default(obj):
    if isinstance(obj, datetime): return obj.isoformat()
    raise TypeError(f"型 {type(obj)} は非対応")

json.dumps(data_with_date, default=encode_default)

# dataclass を辞書経由でシリアライズ
@dataclass
class User:
    name: str
    age:  int

user = User("Bob", 25)
json.dumps(asdict(user))  # {"name": "Bob", "age": 25}

# object_hook — デシリアライズ時にカスタム変換
def as_user(d: dict):
    if "name" in d and "age" in d:
        return User(**d)
    return d

user_obj = json.loads('{"name":"Bob","age":25}', object_hook=as_user)
print(type(user_obj))  # <class 'User'>
```

:::note[ensure_ascii=False を忘れずに]
`json.dumps` はデフォルトで非ASCII文字（日本語など）を `\uXXXX` にエスケープします。人が読めるJSONにしたい場合や、ファイルに書き出す場合は `ensure_ascii=False` を指定します。
:::
