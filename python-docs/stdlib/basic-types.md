---
id: basic-types
title: 基本型
sidebar_label: 基本型
---

# 基本型

| 型 | 説明 | 例 |
| --- | --- | --- |
| `int` | 任意精度整数 | `2 ** 100`（制限なし） |
| `float` | 64 bit 浮動小数点 | `3.14, 1e10, float('inf')` |
| `complex` | 複素数 | `3 + 4j` |
| `bool` | True / False（int のサブクラス） | `True == 1` |
| `str` | Unicode 文字列（不変） | `"hello", 'world'` |
| `bytes` | バイト列（不変） | `b"hello"` |
| `bytearray` | 可変バイト列 | `bytearray(b"hello")` |
| `None` | null 相当 | `x = None` |

```python
# 数値
print(10 // 3)    # 3  (切り捨て除算)
print(10 %  3)    # 1  (余り)
print(2  ** 10)   # 1024
print(abs(-5))    # 5
print(round(3.567, 2))  # 3.57

# 数値変換
int("42")         # 42
int("0xFF", 16)   # 255
float("3.14")     # 3.14
bin(255)          # '0b11111111'
hex(255)          # '0xff'

# 文字列操作
s = "Hello, Python!"
print(s.upper())              # HELLO, PYTHON!
print(s.lower())              # hello, python!
print(s.split(", "))          # ['Hello', 'Python!']
print(s.replace("Python", "World"))  # Hello, World!
print(s.startswith("Hello")) # True
print(s.strip())              # 前後の空白除去
print(s[7:13])                # Python
print(s[::-1])                # !nohtyP ,olleH (逆順)
print(", ".join(["A","B","C"])) # A, B, C
print(s.count("l"))           # 2
print(s.find("Python"))       # 7 (-1 なら未発見)

# f 文字列 (Python 3.6+)
name = "Alice"
age  = 30
pi   = 3.14159
print(f"名前: {name}, 年齢: {age}")
print(f"{pi:.4f}")    # 3.1416
print(f"{1234567:,}") # 1,234,567
print(f"{name!r}")    # 'Alice' (repr())
print(f"{name!s:>10}")# "     Alice" (右揃え10文字)

# bytes と str の変換
encoded = "日本語".encode("utf-8")    # bytes
decoded = encoded.decode("utf-8")      # str
print(type(encoded))  # <class 'bytes'>
```

:::note[int は桁溢れしない]
Python の `int` は任意精度なので、`2 ** 100` のような巨大な数を計算してもオーバーフローせず正確な値になります。一方 `float` は他言語同様 64bit 浮動小数点なので誤差が生じます（`0.1 + 0.2 != 0.3`）。
:::
