/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  javaSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Java 文法',
      collapsed: false,
      items: [
        'syntax/if-for-switch',
        'syntax/class-interface',
        'syntax/exceptions',
        'syntax/stream-lambda',
        'syntax/records',
      ],
    },
    {
      type: 'category',
      label: 'JVM ランタイム',
      collapsed: false,
      items: ['runtime/jvm-and-gc'],
    },
    {
      type: 'category',
      label: '標準ライブラリ',
      collapsed: false,
      items: [
        'stdlib/basic-types',
        'stdlib/collections',
        'stdlib/stream-api',
        'stdlib/file-io',
        'stdlib/json',
        'stdlib/http',
        'stdlib/threading',
        'stdlib/datetime',
        'stdlib/cryptography',
      ],
    },
  ],
};

export default sidebars;
