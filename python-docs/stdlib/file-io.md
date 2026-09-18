---
id: file-io
title: ファイル I/O
sidebar_label: ファイル I/O
---

# ファイル I/O (pathlib, Python 3.4+)

```python
from pathlib import Path
import shutil

# Path オブジェクト
p = Path("data") / "reports" / "2024.txt"
home = Path.home()
cwd  = Path.cwd()

# 情報
print(p.name)          # 2024.txt
print(p.stem)          # 2024
print(p.suffix)        # .txt
print(p.parent)        # data/reports
print(p.exists())      # False
print(p.is_file())
print(p.is_dir())
print(p.stat().st_size)  # ファイルサイズ

# 読み書き
p.parent.mkdir(parents=True, exist_ok=True)  # ディレクトリ作成
p.write_text("Hello, pathlib!\n2行目", encoding="utf-8")
text  = p.read_text(encoding="utf-8")
lines = p.read_text().splitlines()
data  = p.read_bytes()

# 追記
with p.open("a", encoding="utf-8") as f:
    f.write("追記内容\n")

# 大きなファイルを行ごとに処理
with p.open("r", encoding="utf-8") as f:
    for line in f:                  # メモリ効率が良い
        print(line.rstrip())

# ファイル操作
p.rename(p.with_name("renamed.txt"))   # リネーム
p.replace(p.with_suffix(".bak"))       # 上書き移動
p.unlink(missing_ok=True)             # 削除

# ディレクトリ操作
d = Path("output")
d.mkdir(exist_ok=True)
shutil.copy2(p, d / p.name)          # コピー (メタデータ保持)
shutil.move(str(p), str(d))          # 移動
shutil.rmtree(d)                      # ディレクトリごと削除

# パターンマッチング
src = Path("src")
for py_file in src.rglob("*.py"):    # 再帰的
    print(py_file)
for txt_file in src.glob("*.txt"):   # 直下のみ
    print(txt_file)

# 一時ファイル
import tempfile
with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp:
    tmp.write(b"temporary data")
    print(tmp.name)

with tempfile.TemporaryDirectory() as tmpdir:
    (Path(tmpdir) / "file.txt").write_text("test")
```

:::tip[os.path より pathlib]
Python 3.4 以降は文字列ベースの `os.path` よりも、パスをオブジェクトとして扱う `pathlib.Path` が推奨されます。`/` 演算子でパスを結合できる（`Path("a") / "b"`）ため、OSごとの区切り文字を気にする必要がありません。
:::
