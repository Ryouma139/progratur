import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

const languages = [
  {
    id: 'csharp',
    name: 'C# & .NET',
    tagline: '文法・CLR・標準ライブラリ',
    href: '/csharp/intro',
    ready: true,
  },
  {
    id: 'java',
    name: 'Java',
    tagline: '文法・JVM・標準ライブラリ',
    href: '/java/intro',
    ready: true,
  },
  {
    id: 'python',
    name: 'Python',
    tagline: '文法・ランタイム・標準ライブラリ',
    href: '/python/intro',
    ready: true,
  },
];

function LanguageCard({id, name, tagline, href, ready}) {
  return (
    <Link
      to={href}
      style={{
        display: 'block',
        border: '1px solid var(--ifm-toc-border-color, #333)',
        borderRadius: '12px',
        padding: '1.5rem',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s ease',
      }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: 'var(--ifm-color-primary)',
          color: '#fff',
          fontWeight: 700,
          marginBottom: '0.75rem',
        }}>
        {id === 'csharp' ? 'C#' : id === 'java' ? 'Jv' : 'Py'}
      </div>
      <Heading as="h3" style={{marginBottom: '0.25rem'}}>
        {name}
      </Heading>
      <p style={{opacity: 0.75, marginBottom: ready ? 0 : '0.5rem'}}>{tagline}</p>
      {!ready && (
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            background: 'var(--ifm-color-emphasis-300)',
          }}>
          準備中
        </span>
      )}
    </Link>
  );
}

export default function Home() {
  return (
    <Layout
      title="Progratur"
      description="文法・ランタイム・標準ライブラリ — 具体的なコード例とともに学ぶプログラミング言語リファレンス">
      <main style={{maxWidth: '960px', margin: '0 auto', padding: '4rem 2rem'}}>
        <Heading as="h1" style={{fontSize: '2.5rem'}}>
          Progratur
        </Heading>
        <p style={{fontSize: '1.1rem', opacity: 0.8, marginBottom: '2.5rem'}}>
          文法・ランタイム・標準ライブラリ — 具体的なコード例とともに学ぶプログラミング言語リファレンス
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}>
          {languages.map((lang) => (
            <LanguageCard key={lang.id} {...lang} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
