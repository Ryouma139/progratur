---
id: file-io
title: ファイル I/O
sidebar_label: ファイル I/O
---

# ファイル I/O (java.nio.file)

```java
import java.nio.file.*;
import java.nio.charset.StandardCharsets;

Path path = Path.of("sample.txt");  // or Paths.get(...)

// 読み書き (小さなファイル向け)
Files.writeString(path, "Hello, Java!\n行2");
String text  = Files.readString(path);
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
byte[] bytes = Files.readAllBytes(path);

// 書き込みオプション
Files.writeString(path, "追記内容", StandardOpenOption.APPEND);
Files.write(path, List.of("line1", "line2"), StandardOpenOption.CREATE);

// 大きなファイル — ストリームで行単位
try (Stream<String> lineStream = Files.lines(path)) {
    lineStream
        .filter(l -> !l.isBlank())
        .forEach(System.out::println);
}

// ファイル操作
boolean exists = Files.exists(path);
Files.copy(path, Path.of("copy.txt"), StandardCopyOption.REPLACE_EXISTING);
Files.move(path, Path.of("new.txt"), StandardCopyOption.REPLACE_EXISTING);
Files.delete(path);
Files.deleteIfExists(path);

// ディレクトリ
Files.createDirectory(Path.of("newdir"));
Files.createDirectories(Path.of("a/b/c")); // 中間ディレクトリも作成

// ディレクトリ一覧
try (Stream<Path> files = Files.list(Path.of("."))) {
    files.filter(Files::isRegularFile).forEach(System.out::println);
}

// 再帰的一覧 (walk)
try (Stream<Path> tree = Files.walk(Path.of("src"))) {
    tree.filter(p -> p.toString().endsWith(".java"))
        .forEach(System.out::println);
}

// Path ユーティリティ
Path p      = Path.of("/home/user/docs/report.txt");
System.out.println(p.getFileName()); // report.txt
System.out.println(p.getParent());   // /home/user/docs
System.out.println(p.getRoot());     // /
System.out.println(p.toAbsolutePath());

// 一時ファイル
Path tempFile = Files.createTempFile("prefix_", ".tmp");
Path tempDir  = Files.createTempDirectory("myapp_");
```

:::tip[java.io から java.nio.file へ]
Java 7 (2011年) 以降は、旧来の `java.io.File` よりも `java.nio.file.Path` + `Files` ユーティリティを使うのが基本です。シンボリックリンクの扱いやエラー発生時の例外メッセージがより明確で、`try-with-resources` と組み合わせた行単位ストリーム処理（`Files.lines`）もできます。
:::
