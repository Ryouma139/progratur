---
slug: aspnet-core-on-lambda
title: ASP.NET CoreアプリをAWS Lambdaで動かす仕組み
authors: [ryouma]
tags: [aws, lambda, aspnet, dotnet, serverless]
---

ASP.NET Coreは「常駐するWebサーバー（Kestrel）で動かすもの」というイメージが強いですが、AWS Lambda上でサーバーレスに動かすこともできます。普段のASP.NET Coreアプリと何が違うのか、AWS公式ドキュメントをもとに整理します。

{/* truncate */}

## 基本的な考え方

通常のASP.NET Coreは、Kestrelというウェブサーバーが直接HTTPリクエストを受け取って処理します。Lambda上で動かす場合、リクエストの入口がKestrelではなく**API GatewayやApplication Load Balancer（ALB）**になり、LambdaはそれらからイベントペイロードとしてHTTPリクエストを受け取る形になります。

この「Lambdaのイベント形式」と「ASP.NET Coreが期待するHTTPリクエスト/レスポンス形式」を相互変換する役目を担うのが、**`Amazon.Lambda.AspNetCoreServer`** というNuGetパッケージです。Kestrelの代わりにこのパッケージが差し込まれることで、コントローラーやミドルウェアなどASP.NET Core側のコードはほぼそのまま維持できます。

## 通常のASP.NET Coreとの違い

最大の違いはエントリーポイントです。

### Web API（コントローラーベース）の場合

```csharp title="LambdaEntryPoint.cs"
public class LambdaEntryPoint : Amazon.Lambda.AspNetCoreServer.APIGatewayProxyFunction
{
    protected override void Init(IWebHostBuilder builder)
    {
        builder.UseStartup<Startup>();
    }

    protected override void Init(IHostBuilder builder)
    {
    }
}
```

`Program.cs`で直接`Run()`する代わりに、`APIGatewayProxyFunction`などの基底クラスを継承した`LambdaEntryPoint`が起点になります。

### Minimal APIの場合

.NET 8以降のMinimal APIでは、`Program.cs`に1行追加するだけで対応できます。

```csharp title="Program.cs"
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

// この1行でLambda対応にする
builder.Services.AddAWSLambdaHosting(LambdaEventSource.RestApi);

var app = builder.Build();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => "Welcome to running ASP.NET Core Minimal API on AWS Lambda");
app.Run();
```

専用のエントリーポイントクラスを書かずに、`AddAWSLambdaHosting()`の呼び出しだけで既存のMinimal APIをLambda対応にできる点が、Web APIパターンとの大きな違いです。

## API Gateway / ALBとの連携は「基底クラスの選択」で決まる

Lambda関数の手前に何を置くかによって、継承する基底クラス（またはMinimal APIなら`LambdaEventSource`列挙値）を使い分けます。

| 手前に置くもの | Web APIで継承する基底クラス | Minimal APIでの指定 |
| --- | --- | --- |
| API Gateway（REST API / v1） | `APIGatewayProxyFunction` | `LambdaEventSource.RestApi` |
| API Gateway（HTTP API / v2） | `APIGatewayHttpApiV2ProxyFunction` | `LambdaEventSource.HttpApi` |
| Application Load Balancer | `ApplicationLoadBalancerFunction` | `LambdaEventSource.ApplicationLoadBalancer` |

どのクラス・設定を選んでも、コントローラーやルーティングなどアプリ本体のコードは共通のまま使い回せます。

## Lambdaのハンドラー文字列の形

通常のLambda関数は `名前空間.クラス名::ハンドラーメソッド名` という形式でハンドラーを指定しますが、ASP.NET Coreの場合は基底クラスに含まれる`FunctionHandlerAsync`メソッドを指定します。

```text
AspNetOnLambda::AspNetOnLambda.LambdaEntryPoint::FunctionHandlerAsync
```

`FunctionHandlerAsync`がLambdaイベントを受け取り、ASP.NET Core側のリクエストパイプラインに橋渡しする役割を担っています。

## セットアップとデプロイの流れ

```bash
# 事前準備: デプロイツールとテンプレートをインストール
dotnet tool install -g Amazon.Lambda.Tools
dotnet new --install Amazon.Lambda.Templates

# Web APIパターンのプロジェクトを作成
dotnet new serverless.AspNetCoreWebAPI -n AspNetOnLambda

# デプロイ（CloudFormation/SAMベース）
cd AspNetOnLambda/src/AspNetOnLambda
dotnet lambda deploy-serverless
```

`dotnet lambda deploy-serverless`を実行すると、アプリのビルド→`serverless.template`（SAM/CloudFormation定義）の読み込み→CloudFormationスタックの作成・更新→Lambda関数のデプロイ、という流れが一括で行われます。

関数名を固定したい場合は、`serverless.template`内の`AWS::Serverless::Function`リソースに`FunctionName`プロパティを追加します。

```yaml
Resources:
  AspNetOnLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: MyCustomFunctionName
      Handler: AspNetOnLambda::AspNetOnLambda.LambdaEntryPoint::FunctionHandlerAsync
```

## プロジェクトに含まれる設定ファイル

テンプレートから生成されるプロジェクトには、通常のASP.NET Coreにはない設定ファイルが追加されます。

| ファイル | 役割 |
| --- | --- |
| `LambdaEntryPoint.cs` | Lambda用のエントリーポイント（Web APIパターンのみ） |
| `serverless.template` | SAM/CloudFormation定義。関数・IAMロール・トリガーを記述 |
| `aws-lambda-tools-defaults.json` | デプロイ先S3バケットやスタック名などのデプロイツール設定 |
| `appsettings.json` / `appsettings.Development.json` | 通常のASP.NET Coreと同じアプリ設定ファイル |

## 導入時に意識しておきたい点

ドキュメントの手順そのものとは別に、サーバーレスでASP.NET Coreを動かす上で一般的に注意が必要なポイントも押さえておくと安心です。

- **コールドスタート**: .NETランタイムとASP.NET Coreの初期化はNode.jsなどに比べて重く、呼び出し間隔が空くとレイテンシが増えやすい。Provisioned Concurrencyの利用や、必要に応じたメモリサイズの引き上げで緩和できる
- **パッケージサイズの上限**: Lambdaのデプロイパッケージには圧縮後のサイズ制限があるため、不要な依存関係を含めないようにする
- **タイムアウト・メモリ設定**: Webアプリとして使う場合、デフォルトの設定値のままだと短すぎる/小さすぎることがあるため、用途に応じて`serverless.template`側で調整する

## まとめ

ASP.NET CoreをLambdaで動かす仕組みの本質は、「Kestrelの代わりに`Amazon.Lambda.AspNetCoreServer`がAPI Gateway/ALBのイベントとHTTPリクエストを相互変換する」という1点に集約されます。Web APIパターンでは専用のエントリーポイントクラスを、Minimal APIパターンでは`AddAWSLambdaHosting()`の1行を追加するだけで、既存のASP.NET Core資産をほぼそのままサーバーレス化できるのが大きな利点です。

参考: [ASP.NET Core Web アプリケーションのデプロイ - AWS Lambda 開発者ガイド](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/csharp-package-asp.html)
