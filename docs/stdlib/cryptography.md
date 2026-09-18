---
id: cryptography
title: 暗号
sidebar_label: 暗号
---

# 暗号

`System.Security.Cryptography` 名前空間に、ハッシュ・共通鍵暗号・公開鍵暗号・乱数生成などの機能がまとまっています。

## ハッシュ値の計算

パスワードそのものの保存には使わず（後述の専用APIを使う）、ファイルの整合性チェックなどに使います。

```csharp
using System.Security.Cryptography;
using System.Text;

byte[] data = Encoding.UTF8.GetBytes("Hello, World!");

byte[] sha256Hash = SHA256.HashData(data);
string hex = Convert.ToHexString(sha256Hash).ToLowerInvariant();
Console.WriteLine(hex);

// ファイルのハッシュ
using FileStream fs = File.OpenRead("file.zip");
byte[] fileHash = SHA256.HashData(fs);
```

## パスワードのハッシュ化 — Rfc2898DeriveBytes (PBKDF2)

パスワードは平文はもちろん単純なハッシュでも保存してはいけません。ソルト付きの鍵導出関数（PBKDF2 / bcrypt / Argon2 等）を使います。

```csharp
byte[] salt = RandomNumberGenerator.GetBytes(16);

byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
    password: "user-password",
    salt: salt,
    iterations: 100_000,
    hashAlgorithm: HashAlgorithmName.SHA256,
    outputLength: 32);

// 保存時は salt と hash の両方を保存し、検証時は同じ salt で再計算して比較する
```

## 共通鍵暗号 — AES

```csharp
using Aes aes = Aes.Create();
aes.GenerateKey();
aes.GenerateIV();

byte[] plain = Encoding.UTF8.GetBytes("秘密のメッセージ");

// 暗号化
using ICryptoTransform encryptor = aes.CreateEncryptor();
byte[] encrypted = encryptor.TransformFinalBlock(plain, 0, plain.Length);

// 復号（同じ Key と IV が必要）
using Aes aesDecrypt = Aes.Create();
aesDecrypt.Key = aes.Key;
aesDecrypt.IV = aes.IV;
using ICryptoTransform decryptor = aesDecrypt.CreateDecryptor();
byte[] decrypted = decryptor.TransformFinalBlock(encrypted, 0, encrypted.Length);

Console.WriteLine(Encoding.UTF8.GetString(decrypted)); // 秘密のメッセージ
```

## 乱数生成

`Random` クラスは暗号用途には使えません（予測可能）。セキュリティが関わる場面では `RandomNumberGenerator` を使います。

```csharp
// 一般用途（ゲームのシャッフルなど）
var random = new Random();
int dice = random.Next(1, 7); // 1〜6

// 暗号論的に安全な乱数（トークン、ソルト、鍵の生成など）
byte[] secureBytes = RandomNumberGenerator.GetBytes(32);
string token = Convert.ToBase64String(secureBytes);
```

## HMAC — メッセージ認証コード

```csharp
byte[] key = RandomNumberGenerator.GetBytes(32);
byte[] message = Encoding.UTF8.GetBytes("integrity-checked-message");

byte[] mac = HMACSHA256.HashData(key, message);

// 検証側は同じ key で再計算し、定数時間比較する
byte[] recomputed = HMACSHA256.HashData(key, message);
bool valid = CryptographicOperations.FixedTimeEquals(mac, recomputed);
```

:::caution[比較には定数時間比較を使う]
ハッシュ値やMACの比較を `==` や `SequenceEqual` で行うと、タイミング攻撃によって内容を推測される可能性があります。`CryptographicOperations.FixedTimeEquals` のような定数時間比較APIを使ってください。
:::
