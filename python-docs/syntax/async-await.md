---
id: async-await
title: async / await
sidebar_label: async / await
---

# async / await (Python 3.5+)

```python
import asyncio
import aiohttp  # pip install aiohttp

# 基本的なコルーチン
async def greet(name: str) -> str:
    await asyncio.sleep(0.1)  # I/O 待機のシミュレーション
    return f"Hello, {name}!"

# asyncio.run() でエントリポイント
async def main():
    result = await greet("World")
    print(result)  # Hello, World!

asyncio.run(main())

# 並列実行 — asyncio.gather
async def fetch(session, url: str) -> str:
    async with session.get(url) as resp:
        return await resp.text()

async def parallel_fetch():
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            fetch(session, "https://example.com/1"),
            fetch(session, "https://example.com/2"),
            fetch(session, "https://example.com/3"),
        )
    return results

# TaskGroup (Python 3.11+)
async def with_task_group():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(greet("Alice"))
        task2 = tg.create_task(greet("Bob"))
    # すべてのタスクが完了
    print(task1.result(), task2.result())

# タイムアウト
async def with_timeout():
    try:
        async with asyncio.timeout(5.0):  # Python 3.11+
            await long_operation()
    except TimeoutError:
        print("タイムアウト")

# 非同期ジェネレータ
async def async_range(n: int):
    for i in range(n):
        await asyncio.sleep(0)  # 他のコルーチンに制御を渡す
        yield i

async def consume():
    async for value in async_range(5):
        print(value)

# 非同期コンテキストマネージャ
class AsyncResource:
    async def __aenter__(self):
        await asyncio.sleep(0)
        return self

    async def __aexit__(self, *args):
        await asyncio.sleep(0)

async def use_async_cm():
    async with AsyncResource() as r:
        pass  # 使用
```

:::note[gather vs TaskGroup]
`asyncio.gather` は古くからある並列実行手段ですが、いずれかのタスクが例外を投げても他のタスクをキャンセルせず結果を待ち続けることがあります。Python 3.11+ の `asyncio.TaskGroup` は、いずれかのタスクが失敗すると残りを自動でキャンセルし、複数の例外を `ExceptionGroup` としてまとめて報告するため、新しいコードでは `TaskGroup` が推奨されます。
:::

:::caution[async 関数はそのままでは実行されない]
`async def` で定義した関数を呼び出しても、それだけではコルーチンオブジェクトが返るだけで中身は実行されません。`await` するか `asyncio.run()` / `asyncio.create_task()` に渡す必要があります。
:::
