---
id: json
title: JSON
sidebar_label: JSON
---

# JSON

:::note[標準ライブラリには含まれない]
Java 標準ライブラリには使いやすい JSON 処理が含まれていません。実際のプロジェクトでは **Jackson** または **Gson** を使用します。Java 17+ では `javax.json` (Jakarta JSON) も選択肢です。
:::

## Jackson (最も広く使われる)

```java
// Maven: com.fasterxml.jackson.core:jackson-databind:2.17.x
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.annotation.*;

// モデル
public class User {
    public int    id;
    public String name;
    public String email;

    @JsonProperty("created_at")         // JSON キーをカスタマイズ
    public String createdAt;

    @JsonIgnore                          // シリアライズから除外
    public String passwordHash;
}

ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // null フィールドを除外

// シリアライズ
User user = new User();
user.id   = 1;
user.name = "Alice";
String json = mapper.writeValueAsString(user);         // 1行
String pretty = mapper.writerWithDefaultPrettyPrinter()
    .writeValueAsString(user);                          // インデント

// デシリアライズ
User parsed = mapper.readValue(json, User.class);
System.out.println(parsed.name); // Alice

// リスト
List<User> users = mapper.readValue(
    "[{\"id\":1,\"name\":\"Alice\"}]",
    new TypeReference<List<User>>() {}
);

// ファイルへの書き込み / 読み込み
mapper.writeValue(new File("users.json"), users);
List<User> fromFile = mapper.readValue(
    new File("users.json"),
    new TypeReference<>() {}
);

// JsonNode — 動的解析
JsonNode root  = mapper.readTree("{\"name\":\"Bob\",\"scores\":[10,20]}");
String name    = root.get("name").asText();   // Bob
JsonNode scores = root.get("scores");
scores.forEach(n -> System.out.println(n.asInt())); // 10, 20
```

:::tip[FAIL_ON_UNKNOWN_PROPERTIES は無効化推奨]
デフォルトでは JSON 側に未知のプロパティがあるとデシリアライズが例外で失敗します。API のレスポンスに将来フィールドが増える可能性がある場合は `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES` を `false` にしておくと壊れにくくなります。
:::
