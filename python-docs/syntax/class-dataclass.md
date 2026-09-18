---
id: class-dataclass
title: class / dataclass
sidebar_label: class / dataclass
---

# class / dataclass

## クラスの基礎

```python
class Animal:
    # クラス変数
    count = 0

    def __init__(self, name: str, age: int) -> None:
        self.name = name   # インスタンス変数
        self._age  = age   # 慣習的に _: "protected"
        Animal.count += 1

    # プロパティ
    @property
    def age(self) -> int:
        return self._age

    @age.setter
    def age(self, value: int) -> None:
        if value < 0:
            raise ValueError("年齢は0以上")
        self._age = value

    # 特殊メソッド (dunder methods)
    def __str__ (self) -> str: return f"{self.name} (年齢: {self._age})"
    def __repr__(self) -> str: return f"Animal({self.name!r}, {self._age!r})"
    def __eq__  (self, other) -> bool:
        return isinstance(other, Animal) and self.name == other.name
    def __hash__(self) -> int: return hash(self.name)
    def __lt__  (self, other) -> bool: return self._age < other._age

    def speak(self) -> str:
        return "..."

# 継承
class Dog(Animal):
    def __init__(self, name: str, age: int, breed: str) -> None:
        super().__init__(name, age)
        self.breed = breed

    def speak(self) -> str:
        return "ワン！"

    # クラスメソッド
    @classmethod
    def from_dict(cls, d: dict) -> "Dog":
        return cls(d["name"], d["age"], d["breed"])

    # 静的メソッド
    @staticmethod
    def is_valid_age(age: int) -> bool:
        return 0 <= age <= 30

dog = Dog("ポチ", 3, "柴犬")
print(dog.speak())         # ワン！
print(isinstance(dog, Animal))  # True
```

:::note[_age に慣習的な意味しかない]
Python にはアクセス修飾子（`private` など）がありません。先頭 `_` は「外部から触らない想定」という慣習にすぎず、実際には `dog._age` で普通にアクセスできてしまいます。強制的に隠したい場合は `__age`（名前マングリング）を使いますが、多くの場面では慣習で十分とされています。
:::

## dataclass (Python 3.7+)

```python
from dataclasses import dataclass, field
from typing import ClassVar

@dataclass
class Person:
    name: str
    age:  int
    tags: list[str] = field(default_factory=list)  # ミュータブルなデフォルト値
    _id:  int       = field(init=False, repr=False) # 初期化から除外

    # クラス変数 (field 不要)
    registry: ClassVar[list] = []

    def __post_init__(self):
        if self.age < 0:
            raise ValueError("年齢は0以上")
        self._id = id(self)

    def greet(self) -> str:
        return f"こんにちは、{self.name}です"

alice = Person("Alice", 30, ["Python", "ML"])
print(alice)            # Person(name='Alice', age=30, tags=['Python', 'ML'])
print(alice == Person("Alice", 30))  # True (__eq__ が自動生成)

# 不変 dataclass
@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5

p = Point(3.0, 4.0)
print(p.distance())  # 5.0
# p.x = 1.0  # FrozenInstanceError!

# NamedTuple との比較 — 軽量な不変データ
from typing import NamedTuple
class Color(NamedTuple):
    r: int
    g: int
    b: int
    a: float = 1.0

red = Color(255, 0, 0)
print(red[0])  # 255 (インデックスでアクセス可)
```

:::caution[ミュータブルなデフォルト値]
`tags: list[str] = []` のように可変オブジェクトを直接デフォルト値にすると、全インスタンスが同じリストを共有してしまう Python 共通の落とし穴があります。`dataclass` では `field(default_factory=list)` を使ってインスタンスごとに新しいリストを生成する必要があります。
:::

## ABC と Protocol

```python
from abc import ABC, abstractmethod
from typing import Protocol

# ABC — 明示的な継承が必要
class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

    def describe(self) -> str:
        return f"面積: {self.area():.2f}, 周長: {self.perimeter():.2f}"

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self)      -> float: return 3.14159 * self.radius ** 2
    def perimeter(self) -> float: return 2 * 3.14159 * self.radius

# Protocol — 構造的サブタイピング (継承不要)
class Drawable(Protocol):
    def draw(self) -> None: ...

class Square:
    def draw(self) -> None:
        print("□")

def render(d: Drawable) -> None:  # Square は Drawable を継承していないが OK
    d.draw()

render(Square())  # 型チェックOK、継承不要
```

:::tip[ABC vs Protocol]
`ABC` は Java の abstract class に近く、明示的な継承と実装が必要です。`Protocol` は Java の interface というより「構造的部分型（ダックタイピングの型チェック版）」で、継承しなくても必要なメソッドさえ持っていれば型チェッカーに適合とみなされます。型ヒントの詳細は [型ヒント](typing) のページも参照してください。
:::
