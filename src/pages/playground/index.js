import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function PlaygroundPage() {
  return (
    <Layout
      title="コードエディター"
      description="Python / Java / C# のコードをブラウザから実行できるサンドボックス環境">
      <main style={{padding: '2rem 0'}}>
        <div style={{maxWidth: '960px', margin: '0 auto', padding: '0 2rem'}}>
          <Heading as="h1">コードエディター</Heading>
        </div>
        <BrowserOnly fallback={<div style={{textAlign: 'center', padding: '2rem'}}>読み込み中…</div>}>
          {() => {
            const Playground = require('./Playground').default;
            return <Playground />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
