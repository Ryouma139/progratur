/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  csharpSidebar: [
    'intro',
    {
      type: 'category',
      label: 'C# 文法',
      collapsed: false,
      items: [
        'syntax/if-for-switch',
        'syntax/class-interface',
        'syntax/async-await',
        'syntax/linq',
        'syntax/delegate-lambda',
      ],
    },
    {
      type: 'category',
      label: '.NET ランタイム',
      collapsed: false,
      items: ['runtime/clr-and-gc'],
    },
    {
      type: 'category',
      label: '標準ライブラリ',
      collapsed: false,
      items: [
        'stdlib/basic-types',
        'stdlib/collections',
        'stdlib/linq-methods',
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
