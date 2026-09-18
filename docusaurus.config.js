// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Progratur',
  tagline: '文法・ランタイム・標準ライブラリ — 具体的なコード例とともに学ぶプログラミング言語リファレンス',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://ryouma139.github.io',
  baseUrl: '/progratur/',

  organizationName: 'Ryouma139',
  projectName: 'progratur',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          id: 'csharp',
          path: 'docs',
          routeBasePath: 'csharp',
          sidebarPath: './sidebars.js',
          editUrl: undefined,
        },
        blog: {
          path: 'blog',
          routeBasePath: 'blog',
          blogTitle: 'Progratur Blog',
          blogDescription: '言語仕様や標準ライブラリ・APIについて、複数言語を比較しながら掘り下げる読み物',
          postsPerPage: 10,
          blogSidebarTitle: '最近の記事',
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          authorsMapPath: 'authors.yml',
          editUrl: undefined,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'java',
        path: 'java-docs',
        routeBasePath: 'java',
        sidebarPath: './sidebarsJava.js',
        editUrl: undefined,
      }),
    ],
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'python',
        path: 'python-docs',
        routeBasePath: 'python',
        sidebarPath: './sidebarsPython.js',
        editUrl: undefined,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Progratur',
        logo: {
          alt: 'Progratur Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            docsPluginId: 'csharp',
            sidebarId: 'csharpSidebar',
            position: 'left',
            label: 'C#',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'java',
            sidebarId: 'javaSidebar',
            position: 'left',
            label: 'Java',
          },
          {
            type: 'docSidebar',
            docsPluginId: 'python',
            sidebarId: 'pythonSidebar',
            position: 'left',
            label: 'Python',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left',
          },
          {
            to: '/playground',
            label: 'コードエディター',
            position: 'left',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'リファレンス',
            items: [
              {label: 'C# & .NET', to: '/csharp/intro'},
              {label: 'Java', to: '/java/intro'},
              {label: 'Python', to: '/python/intro'},
            ],
          },
          {
            title: 'その他',
            items: [
              {label: 'Blog', to: '/blog'},
              {label: 'Blog Archive', to: '/blog/archive'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Progratur.`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['csharp', 'java', 'python', 'bash', 'json'],
      },
    }),
};

export default config;
