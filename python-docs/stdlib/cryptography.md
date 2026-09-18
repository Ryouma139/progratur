---
id: cryptography
title: 暗号
sidebar_label: 暗号
---

# 暗号 (hashlib / hmac / secrets)

## ハッシュ と HMAC

```python
import hashlib
import hmac
import secrets

# SHA-256 ハッシュ
data = b"Hello, World!"
h    = hashlib.sha256(data)
print(h.hexdigest())    # dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986d
print(h.digest())       # bytes

# 1行で
digest = hashlib.sha256(data).hexdigest()

# SHA-512 / SHA3 / BLAKE2
hashlib.sha512(data).hexdigest()
hashlib.sha3_256(data).hexdigest()
hashlib.blake2b(data, digest_size=32).hexdigest()  # 高速

# ファイルのハッシュ (大きなファイル対応)
def file_hash(path: str, algorithm: str = "sha256") -> str:
    h = hashlib.new(algorithm)
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

# HMAC-SHA256 — メッセージ認証コード
key     = secrets.token_bytes(32)
message = b"重要なデータ"
mac     = hmac.new(key, message, hashlib.sha256).hexdigest()

# 検証 (タイミング攻撃対策)
mac2 = hmac.new(key, message, hashlib.sha256).hexdigest()
print(hmac.compare_digest(mac, mac2))  # True (タイミング安全な比較)
```

:::caution[パスワードには使わない]
`hashlib.sha256` などの高速ハッシュ関数はそのままパスワード保存に使うべきではありません（総当たり攻撃に弱い）。パスワードには `bcrypt` / `argon2` / `scrypt` のような意図的に低速化されたハッシュ関数を使います。
:::

## secrets — 安全な乱数

```python
import secrets
import string

# 安全な乱数 (random モジュールは暗号用途に使わない)
token_hex   = secrets.token_hex(16)       # 32文字の16進数文字列
token_bytes = secrets.token_bytes(32)     # 32 バイトのランダムデータ
token_url   = secrets.token_urlsafe(16)   # URL-safe な base64

# 安全なパスワード生成
alphabet = string.ascii_letters + string.digits + string.punctuation
password = "".join(secrets.choice(alphabet) for _ in range(16))
print(password)  # 例: "aB3#kL9@mX2$yZ8!"

# 比較 (タイミング攻撃対策)
secrets.compare_digest("a"*32, "a"*32)   # True
```

## cryptography ライブラリ (pip install cryptography)

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
import os

# AES-256-GCM — 認証付き暗号化
key       = AESGCM.generate_key(bit_length=256)
aesgcm    = AESGCM(key)
nonce     = os.urandom(12)              # 96-bit nonce (使い捨て)
plaintext = "秘密のメッセージ".encode("utf-8")

ciphertext = aesgcm.encrypt(nonce, plaintext, None)   # 暗号化
recovered  = aesgcm.decrypt(nonce, ciphertext, None)  # 復号
print(recovered.decode("utf-8"))  # 秘密のメッセージ

# RSA-2048 署名と検証
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048
)
public_key = private_key.public_key()

message   = b"署名対象のデータ"
signature = private_key.sign(message, padding.PSS(
    mgf=padding.MGF1(hashes.SHA256()),
    salt_length=padding.PSS.MAX_LENGTH
), hashes.SHA256())

try:
    public_key.verify(signature, message, padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ), hashes.SHA256())
    print("署名有効")
except Exception:
    print("署名無効")

# 鍵のシリアライズ / デシリアライズ
pem_private = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)
pem_public = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)
```

:::note[random モジュールは暗号用途に使わない]
標準の `random` モジュールはメルセンヌ・ツイスタという予測可能な擬似乱数生成器を使っており、トークンやパスワード生成には不適切です。暗号学的に安全な乱数が必要な場面では必ず `secrets` モジュールを使います。
:::
