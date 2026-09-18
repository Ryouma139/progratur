---
id: threading-asyncio
title: スレッド / asyncio / multiprocessing
sidebar_label: スレッド / asyncio
---

# スレッド / asyncio / multiprocessing

## threading と concurrent.futures

```python
import threading
import multiprocessing
import concurrent.futures
import asyncio
import queue

# --- threading (I/O バウンドに適する) ---
lock = threading.Lock()
shared = []

def worker(n: int):
    with lock:       # スレッドセーフな書き込み
        shared.append(n)

threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads: t.start()
for t in threads: t.join()

# Semaphore — 同時実行数制限
sem = threading.Semaphore(3)
def limited_worker(n):
    with sem:
        time.sleep(0.1)  # 最大3スレッドまで同時実行

# Event — スレッド間シグナル
event = threading.Event()
def waiter():
    event.wait()          # シグナルまでブロック
    print("シグナル受信")

t = threading.Thread(target=waiter)
t.start()
event.set()   # シグナルを送る
t.join()

# Queue — スレッドセーフなキュー
q = queue.Queue(maxsize=10)

def producer():
    for i in range(5):
        q.put(i)
    q.put(None)  # 終了シグナル

def consumer():
    while True:
        item = q.get()
        if item is None: break
        print(f"消費: {item}")
        q.task_done()

# --- concurrent.futures (高レベルインターフェース) ---
# ThreadPoolExecutor — I/O バウンド
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(fetch_url, url) for url in urls]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]

# ProcessPoolExecutor — CPU バウンド (GIL を回避)
def heavy_compute(n: int) -> int:
    return sum(i * i for i in range(n))

with concurrent.futures.ProcessPoolExecutor() as executor:
    results = list(executor.map(heavy_compute, [10**6, 10**6, 10**6]))

# map と as_completed の違い
# map:          入力順に結果が返る (遅い方を待つ)
# as_completed: 完了した順に返る (高スループット)
```

:::note[threading vs multiprocessing]
[GIL とメモリ管理](../runtime/gil-and-memory) で触れたように、CPython の `threading` は CPU バウンドな処理を並列化できません（GILに阻まれる）。CPUを使い切りたい計算処理には `multiprocessing`（または `ProcessPoolExecutor`）でプロセスを分けます。ネットワーク待ちなどの I/O バウンドな処理には `threading` や `asyncio` で十分です。
:::

## asyncio — イベントループ

```python
import asyncio

# タスクの生成と管理
async def main():
    # create_task — バックグラウンドで実行
    task1 = asyncio.create_task(worker(1))
    task2 = asyncio.create_task(worker(2))

    # gather — 並列実行
    results = await asyncio.gather(task1, task2)

    # wait — タイムアウト付き
    done, pending = await asyncio.wait(
        [asyncio.create_task(slow()) for _ in range(5)],
        timeout=2.0
    )
    for task in pending:
        task.cancel()

# asyncio.Queue — async 対応のキュー
async def producer(q: asyncio.Queue):
    for i in range(5):
        await q.put(i)
        await asyncio.sleep(0.1)
    await q.put(None)

async def consumer(q: asyncio.Queue):
    while True:
        item = await q.get()
        if item is None: break
        print(f"受信: {item}")

async def queue_demo():
    q = asyncio.Queue(maxsize=3)
    await asyncio.gather(producer(q), consumer(q))

# asyncio.Lock / Semaphore
async def safe_op():
    async with asyncio.Lock():
        await asyncio.sleep(0.1)

asyncio.run(main())
```

`async` / `await` 構文そのものの説明は [async / await](../syntax/async-await) のページも参照してください。
