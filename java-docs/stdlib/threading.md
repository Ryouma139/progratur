---
id: threading
title: スレッド・並列処理
sidebar_label: スレッド・並列処理
---

# スレッド・並列処理

## ExecutorService と CompletableFuture

```java
import java.util.concurrent.*;

// ExecutorService — スレッドプール
ExecutorService pool = Executors.newFixedThreadPool(4);

// タスクの送信
Future<Integer> future = pool.submit(() -> {
    Thread.sleep(100);
    return 42;
});
int result = future.get(); // ブロッキングで結果を取得

// シャットダウン
pool.shutdown();
pool.awaitTermination(5, TimeUnit.SECONDS);

// CompletableFuture — 非同期チェーン
CompletableFuture<String> cf =
    CompletableFuture.supplyAsync(() -> "Hello")       // 非同期実行
        .thenApply(s -> s + ", World")                  // 変換
        .thenApply(String::toUpperCase)
        .exceptionally(e -> "エラー: " + e.getMessage()); // エラー処理

System.out.println(cf.join()); // HELLO, WORLD

// 複数の非同期処理を並列実行
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "B");

// 両方完了後
CompletableFuture<String> combined = f1.thenCombine(f2, (a, b) -> a + b);
System.out.println(combined.join()); // AB

// いずれか完了後
CompletableFuture<Object> any = CompletableFuture.anyOf(f1, f2);

// すべて完了後
CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2);
all.join(); // すべて待つ

// バーチャルスレッド (Java 21+ / Project Loom)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        int taskId = i;
        executor.submit(() -> {
            Thread.sleep(100); // ブロッキング I/O も OK
            System.out.println("Task " + taskId);
        });
    }
} // AutoCloseable で自動 shutdown
```

## 同期プリミティブ

```java
// synchronized — 排他制御
class Counter {
    private int count = 0;
    public synchronized void increment() { count++; }
    public synchronized int  get()       { return count; }
}

// ReentrantLock — より細かい制御
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // クリティカルセクション
} finally {
    lock.unlock();
}

// Semaphore — 同時アクセス数制限
Semaphore sem = new Semaphore(3);
sem.acquire();
try {
    // 最大3スレッドまで同時実行
} finally {
    sem.release();
}

// AtomicInteger — ロックなしの原子操作
AtomicInteger atomic = new AtomicInteger(0);
atomic.incrementAndGet();                        // ++
atomic.addAndGet(10);                            // += 10
int prev = atomic.getAndSet(0);                  // 0 にリセット
atomic.compareAndSet(0, 1);                      // CAS

// CountDownLatch — N個のタスク完了を待つ
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    pool.submit(() -> {
        doWork();
        latch.countDown();
    });
}
latch.await(); // 3つすべて完了まで待機
```

:::tip[バーチャルスレッドで I/O バウンドが楽になる]
Java 21 で正式導入されたバーチャルスレッド（Project Loom）は、OSスレッドを1本占有せずに大量の軽量スレッドを生成できます。I/O 待ちが多い処理（HTTP呼び出しやDBアクセス）を大量に並行実行したい場合、`Executors.newVirtualThreadPerTaskExecutor()` を使うとスレッドプールのサイズ調整に悩まずに済みます。
:::
