---
id: exceptions
title: 例外処理
sidebar_label: 例外処理
---

# 例外処理

## try / catch / finally と try-with-resources

```java
// 基本
try {
    int result = 10 / 0;  // ArithmeticException
} catch (ArithmeticException e) {
    System.out.println("ゼロ除算: " + e.getMessage());
} catch (Exception e) {
    System.out.println("その他の例外: " + e.getMessage());
} finally {
    System.out.println("必ず実行");
}

// マルチキャッチ (Java 7+)
try {
    // ...
} catch (NumberFormatException | IllegalArgumentException e) {
    System.out.println("無効な引数: " + e.getMessage());
}

// try-with-resources — AutoCloseable を自動的に close()
try (var reader = new java.io.BufferedReader(new java.io.FileReader("file.txt"));
     var writer = new java.io.FileWriter("out.txt")) {
    String line;
    while ((line = reader.readLine()) != null) {
        writer.write(line + "\n");
    }
} // reader と writer が自動で close される

// カスタム例外
public class DomainException extends RuntimeException {
    private final String errorCode;

    public DomainException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public DomainException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() { return errorCode; }
}

// Checked vs Unchecked
// Checked (Exception) — メソッドシグネチャに throws が必要
public void readFile(String path) throws java.io.IOException {
    // ...
}

// Unchecked (RuntimeException) — throws 不要
public void validate(String value) {
    if (value == null) throw new IllegalArgumentException("null は許可されません");
}
```

:::caution[checked 例外の乱用に注意]
checked 例外（`Exception` を直接継承した例外）は呼び出し元に `throws` 宣言か `try/catch` を強制しますが、乱用するとコードが例外処理で埋め尽くされがちです。「呼び出し側が現実的に回復できるエラー」だけを checked にし、プログラミングミスに近いもの（不正な引数など）は `RuntimeException` 系の unchecked 例外にするのが一般的な指針です。
:::

:::note[try-with-resources の後始末順]
複数のリソースを `try (...)` にまとめて宣言した場合、`close()` は宣言と逆順（後に書いたものから先）に呼ばれます。上の例では `writer` → `reader` の順で閉じられます。
:::
