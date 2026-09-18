/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  pythonSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Python 文法',
      collapsed: false,
      items: [
        'syntax/if-for-while',
        'syntax/class-dataclass',
        'syntax/exceptions',
        'syntax/comprehension',
        'syntax/decorator-generator',
        'syntax/async-await',
        'syntax/typing',
      ],
    },
    {
      type: 'category',
      label: 'ランタイム',
      collapsed: false,
      items: ['runtime/gil-and-memory'],
    },
    {
      type: 'category',
      label: '標準ライブラリ',
      collapsed: false,
      items: [
        'stdlib/basic-types',
        'stdlib/collections',
        'stdlib/itertools-functools',
        'stdlib/file-io',
        'stdlib/json',
        'stdlib/http',
        'stdlib/threading-asyncio',
        'stdlib/datetime',
        'stdlib/cryptography',
      ],
    },
  ],
};

export default sidebars;
