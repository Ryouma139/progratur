---
id: typing
title: 型ヒント
sidebar_label: 型ヒント
---

# 型ヒント (Python 3.9+ / 3.10+)

```python
from typing import TypeVar, Generic, Callable, Any
from collections.abc import Sequence, Iterator

# 基本的な型ヒント
def greet(name: str, times: int = 1) -> str:
    return (name + " ") * times

# Python 3.10+ の簡略記法
def process(value: int | str | None) -> int | None:
    if value is None: return None
    return int(value)

# 旧来の書き方
from typing import Optional, Union
def old_style(value: Optional[str]) -> Union[int, str]:
    ...

# コレクション型 (Python 3.9+ は小文字で直接書ける)
def sum_list(items: list[int]) -> int: return sum(items)
def first(d: dict[str, int]) -> str:   return next(iter(d))
def unique(s: set[str]) -> list[str]:  return list(s)
def to_tuple(a: int, b: str) -> tuple[int, str]: return (a, b)

# TypeVar — ジェネリック関数
T = TypeVar("T")
S = TypeVar("S", bound=str)

def first_elem(lst: list[T]) -> T:
    return lst[0]

def upper(s: S) -> S:
    return s.upper()  # type: ignore

# ジェネリッククラス (Python 3.12+: class Stack[T])
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

stack: Stack[int] = Stack()
stack.push(1)
stack.push(2)
print(stack.pop())  # 2

# Callable
def apply(func: Callable[[int], str], value: int) -> str:
    return func(value)

# TypedDict — 辞書の型安全な定義
from typing import TypedDict
class UserDict(TypedDict):
    name: str
    age: int
    email: str

def get_user() -> UserDict:
    return {"name": "Alice", "age": 30, "email": "a@example.com"}

# Literal — 特定の値のみ許可
from typing import Literal
def set_direction(direction: Literal["left", "right", "up", "down"]) -> None:
    ...

# ParamSpec / TypeAlias
from typing import ParamSpec, TypeAlias
P = ParamSpec("P")
JSON: TypeAlias = dict[str, Any]
```

:::tip[型ヒントは実行時に強制されない]
Python の型ヒントはあくまで注釈であり、実行時には何もチェックされません。矛盾する型を代入してもエラーにはならず、`mypy` や `pyright` のような静的型チェッカーを別途実行して初めて検出されます。型の恩恵を最大化するには、CIに型チェッカーを組み込むのが実践的です。
:::

:::note[list[int] はいつから使えるか]
`list[int]` のように組み込みコレクションをそのままジェネリクスとして書けるのは Python 3.9 以降です。それ以前は `typing.List[int]` のように `typing` モジュールの別名を使う必要がありました。
:::
