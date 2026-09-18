---
id: cryptography
title: 暗号
sidebar_label: 暗号
---

# 暗号 (java.security / javax.crypto)

## ハッシュ と HMAC

```java
import java.security.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import java.util.HexFormat;

// SHA-256 ハッシュ
String input = "Hello, World!";
MessageDigest digest = MessageDigest.getInstance("SHA-256");
byte[] hash  = digest.digest(input.getBytes(StandardCharsets.UTF_8));
String hexHash = HexFormat.of().formatHex(hash);
// "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986d"

// SHA-512
MessageDigest sha512 = MessageDigest.getInstance("SHA-512");
String b64 = Base64.getEncoder().encodeToString(
    sha512.digest(input.getBytes(StandardCharsets.UTF_8)));

// HMAC-SHA256
byte[] keyBytes = new SecureRandom().generateSeed(32);
SecretKeySpec hmacKey = new SecretKeySpec(keyBytes, "HmacSHA256");
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(hmacKey);
byte[] signature = mac.doFinal("メッセージ".getBytes(StandardCharsets.UTF_8));

// SecureRandom — 暗号学的に安全な乱数
SecureRandom sr    = new SecureRandom();
byte[] randomBytes = new byte[16];
sr.nextBytes(randomBytes);
```

## AES 暗号化

```java
// AES-256-GCM (認証付き暗号化)
public static byte[] encrypt(byte[] plaintext, SecretKey key) throws Exception {
    byte[] iv = new byte[12]; // GCM は 96-bit IV
    new SecureRandom().nextBytes(iv);

    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE, key,
        new GCMParameterSpec(128, iv)); // 128-bit auth tag

    byte[] ciphertext = cipher.doFinal(plaintext);

    // IV + ciphertext を結合して返す
    byte[] result = new byte[iv.length + ciphertext.length];
    System.arraycopy(iv, 0, result, 0, iv.length);
    System.arraycopy(ciphertext, 0, result, iv.length, ciphertext.length);
    return result;
}

public static byte[] decrypt(byte[] ivAndCiphertext, SecretKey key) throws Exception {
    byte[] iv         = Arrays.copyOfRange(ivAndCiphertext, 0, 12);
    byte[] ciphertext = Arrays.copyOfRange(ivAndCiphertext, 12, ivAndCiphertext.length);

    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
    return cipher.doFinal(ciphertext);
}

// 鍵生成
KeyGenerator keygen = KeyGenerator.getInstance("AES");
keygen.init(256);
SecretKey key = keygen.generateKey();

byte[] data      = "秘密のメッセージ".getBytes(StandardCharsets.UTF_8);
byte[] encrypted = encrypt(data, key);
byte[] decrypted = decrypt(encrypted, key);
System.out.println(new String(decrypted, StandardCharsets.UTF_8));
```

## RSA 署名

```java
// RSA キーペア生成
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048, new SecureRandom());
KeyPair keyPair = kpg.generateKeyPair();

byte[] message = "署名対象のデータ".getBytes(StandardCharsets.UTF_8);

// 署名 (秘密鍵)
Signature signer = Signature.getInstance("SHA256withRSA");
signer.initSign(keyPair.getPrivate());
signer.update(message);
byte[] signature = signer.sign();

// 検証 (公開鍵)
Signature verifier = Signature.getInstance("SHA256withRSA");
verifier.initVerify(keyPair.getPublic());
verifier.update(message);
boolean isValid = verifier.verify(signature);
System.out.println("署名有効: " + isValid); // true
```

:::caution[IV / nonce は使い回さない]
AES-GCM の IV（初期化ベクトル）は同じ鍵に対して**絶対に再利用してはいけません**。再利用すると暗号文から平文や鍵の情報が漏れる恐れがあります。上記のように暗号化のたびに `SecureRandom` で新しい IV を生成し、暗号文と一緒に保存・送信するのが一般的なパターンです。
:::
