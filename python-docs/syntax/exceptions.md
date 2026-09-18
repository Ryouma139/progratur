---
id: exceptions
title: 例外処理
sidebar_label: 例外処理
---

# 例外処理

## try / except / else / finally

```python
# 基本
try:
    result = 10 / 0  # ZeroDivisionError
except ZeroDivisionError as e:
    print(f"ゼロ除算: {e}")
except Exception as e:
    print(f"その他の例外: {e}")
else:
    print("例外が起きなかった場合だけ実行")  # try が成功した時のみ
finally:
    print("必ず実行")

# 複数の例外型をまとめてキャッチ
try:
    value = int("abc")
except (ValueError, TypeError) as e:
    print(f"無効な値: {e}")

# 例外の握りつぶし (contextlib.suppress の方が簡潔)
from contextlib import suppress
with suppress(FileNotFoundError):
    import os
    os.remove("nonexistent.txt")  # エラーを無視
```

## カスタム例外と例外チェーン

```python
class DomainError(Exception):
    """アプリケーション固有のエラーの基底クラス"""
    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.error_code = error_code

class UserNotFoundError(DomainError):
    pass

def find_user(user_id: int):
    try:
        return database_lookup(user_id)
    except KeyError as e:
        # raise ... from e — 元の例外を「原因」として保持する
        raise UserNotFoundError(f"user {user_id} not found", "USER_404") from e

try:
    find_user(42)
except DomainError as e:
    print(e.error_code)          # USER_404
    print(e.__cause__)           # 元の KeyError
```

:::note[raise ... from e]
`raise NewError(...) from original` と書くと、トレースバックに「直接の原因」として元の例外を保持したまま新しい例外に変換できます。単に `except: raise NewError(...)` と書くよりも、根本原因を追いやすくなります。
:::

## 例外グループ (Python 3.11+)

```python
# 複数の独立した例外を一つにまとめて扱う
def process_all(items):
    errors = []
    for item in items:
        try:
            process(item)
        except Exception as e:
            errors.append(e)
    if errors:
        raise ExceptionGroup("処理中に複数のエラー", errors)

try:
    process_all([1, "bad", None])
except* ValueError as eg:
    print(f"ValueError が {len(eg.exceptions)} 件")
except* TypeError as eg:
    print(f"TypeError が {len(eg.exceptions)} 件")
```

:::tip[except* はいつ使うか]
`asyncio.TaskGroup` のように複数のタスクを並行実行すると、複数の例外が同時に発生しうるケースがあります。`ExceptionGroup` と `except*` 構文（Python 3.11+）は、そうした「1回の操作で複数の例外が起こりうる」状況を型ごとにまとめて処理するために設計されています。単発の例外処理には従来の `except` で十分です。
:::
