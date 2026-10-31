// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const siteUrl = 'https://hoshi.srcz.one';
const ogImage = new URL('/og-image.png', siteUrl).href;

const frameworkRoutes = [
  'server',
  'server/carriers',
  'server/install/levilamina',
  'server/install/endstone',
  'server/install/selfhosted',
  'server/install/selfhosted-windows',
  'server/updating',
  'server/recovery',
  'server/backup',
  'develop',
  'develop/first-plugin',
  'develop/plugin-package',
  'develop/templates',
  'develop/examples',
  'develop/authoring-csharp',
  'develop/authoring-fsharp',
  'develop/authoring-rpc',
  'develop/testing',
  'develop/troubleshooting',
  'embed',
  'embed/getting-started',
  'embed/carrier-services',
  'embed/lifecycle',
  'embed/events-and-callbacks',
  'releases',
];

const redirects = Object.fromEntries(
  frameworkRoutes.flatMap((route) => [
    [`/${route}/`, `/framework/${route}/`],
    [`/zh/${route}/`, `/zh/framework/${route}/`],
  ]),
);

export default defineConfig({
  site: siteUrl,
  redirects,
  // 弯引号落到 CJK 字体上是全角宽度，英文正文里会裂开。
  markdown: { smartypants: false },
  integrations: [
    starlight({
      title: {
        en: 'Hosihikari',
        'zh-CN': '星光',
      },
      description: 'The Hosihikari collection: the plugin framework, the API projection, and the Seiko package manager.',
      // 404 由 docs 集合里的 404.md 渲染；关掉内置路由，避免 /404 双路由冲突。
      disable404Route: true,
      logo: {
        src: './public/logo-256.png',
      },
      favicon: '/favicon.ico',
      head: [
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#a62a8a' } },
        // 搜索按钮的 aria-label 只写 "Search"，可见文字还带快捷键；补成一致的可访问名称。
        {
          tag: 'script',
          attrs: { 'is:inline': true },
          content: `
            (() => {
              const fix = () => {
                const search = document.querySelector('button[data-open-modal]');
                if (!search) return;
                const label = search.querySelector(':scope > span');
                const kbd = search.querySelector(':scope > kbd');
                if (label && kbd && label.nextElementSibling === kbd) label.after(document.createTextNode(' '));
                if (kbd) {
                  const keys = [...kbd.children];
                  for (let i = 1; i < keys.length; i++) kbd.insertBefore(document.createTextNode(' '), keys[i]);
                }
                const name = [search.getAttribute('aria-label') || '', ...[...search.querySelectorAll('kbd kbd')].map(k => k.textContent.trim())].filter(Boolean).join(' ');
                if (name) search.setAttribute('aria-label', name);
              };
              if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fix, { once: true });
              else fix();
            })();
          `,
        },
        { tag: 'meta', attrs: { property: 'og:image', content: ogImage } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Hosihikari 星光' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: ogImage } },
        { tag: 'meta', attrs: { name: 'twitter:image:alt', content: 'Hosihikari 星光' } },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        zh: { label: '简体中文', lang: 'zh-CN' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Hosihikari',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/Hosihikari/hosihikari.github.io/edit/main/',
      },
      lastUpdated: true,
      components: {
        Head: './src/components/Head.astro',
        Header: './src/components/Header.astro',
        Footer: './src/components/Footer.astro',
      },
      customCss: [
        '@fontsource-variable/noto-sans-sc/wght.css',
        '@fontsource-variable/noto-serif-sc/wght.css',
        '@fontsource-variable/cascadia-code/wght.css',
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Framework',
          translations: { 'zh-CN': '星光框架' },
          items: [
            { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'framework' },
            {
              label: 'Server',
              translations: { 'zh-CN': '服务器' },
              items: [
                { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'framework/server' },
                { label: 'Carriers', translations: { 'zh-CN': '选择载体' }, slug: 'framework/server/carriers' },
                { label: 'LeviLamina', translations: { 'zh-CN': 'LeviLamina' }, slug: 'framework/server/install/levilamina' },
                { label: 'Endstone', translations: { 'zh-CN': 'Endstone' }, slug: 'framework/server/install/endstone' },
                { label: 'Self-hosted (Linux)', translations: { 'zh-CN': '自持态（Linux）' }, slug: 'framework/server/install/selfhosted' },
                { label: 'Self-hosted (Windows)', translations: { 'zh-CN': '自持态（Windows）' }, slug: 'framework/server/install/selfhosted-windows' },
                { label: 'Updating', translations: { 'zh-CN': '升级与回滚' }, slug: 'framework/server/updating' },
                { label: 'Recovery', translations: { 'zh-CN': '故障恢复' }, slug: 'framework/server/recovery' },
                { label: 'Backup', translations: { 'zh-CN': '备份与还原' }, slug: 'framework/server/backup' },
              ],
            },
            {
              label: 'Develop',
              translations: { 'zh-CN': '写插件' },
              items: [
                { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'framework/develop' },
                { label: 'Your first plugin', translations: { 'zh-CN': '第一个插件' }, slug: 'framework/develop/first-plugin' },
                { label: 'Plugin packages', translations: { 'zh-CN': '插件包与清单' }, slug: 'framework/develop/plugin-package' },
                { label: 'Templates', translations: { 'zh-CN': '模板' }, slug: 'framework/develop/templates' },
                { label: 'Examples', translations: { 'zh-CN': '示例插件' }, slug: 'framework/develop/examples' },
                { label: 'C# plugins', translations: { 'zh-CN': 'C# 插件' }, slug: 'framework/develop/authoring-csharp' },
                { label: 'F# plugins', translations: { 'zh-CN': 'F# 插件' }, slug: 'framework/develop/authoring-fsharp' },
                { label: 'Out-of-process plugins', translations: { 'zh-CN': '进程外插件' }, slug: 'framework/develop/authoring-rpc' },
                { label: 'Testing plugins', translations: { 'zh-CN': '测试插件' }, slug: 'framework/develop/testing' },
                { label: 'Troubleshooting', translations: { 'zh-CN': '常见问题' }, slug: 'framework/develop/troubleshooting' },
              ],
            },
            {
              label: 'Embed',
              translations: { 'zh-CN': '内嵌' },
              items: [
                { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'framework/embed' },
                { label: 'Getting started', translations: { 'zh-CN': '开始内嵌' }, slug: 'framework/embed/getting-started' },
                { label: 'Carrier services', translations: { 'zh-CN': '载体服务' }, slug: 'framework/embed/carrier-services' },
                { label: 'Lifecycle', translations: { 'zh-CN': '生命周期' }, slug: 'framework/embed/lifecycle' },
                { label: 'Events and callbacks', translations: { 'zh-CN': '事件与回调' }, slug: 'framework/embed/events-and-callbacks' },
              ],
            },
            {
              label: 'Releases',
              translations: { 'zh-CN': '发布记录' },
              items: [{ label: 'Releases', translations: { 'zh-CN': '发布记录' }, slug: 'framework/releases' }],
            },
          ],
        },
        {
          label: 'Projection',
          translations: { 'zh-CN': '星光投影' },
          items: [{ label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'projection' }],
        },
        {
          label: 'Seiko',
          translations: { 'zh-CN': 'Seiko' },
          items: [
            { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'seiko' },
            {
              label: 'Start',
              translations: { 'zh-CN': '开始' },
              items: [
                { label: 'Install', translations: { 'zh-CN': '安装' }, slug: 'seiko/install' },
                { label: 'Getting started', translations: { 'zh-CN': '快速开始' }, slug: 'seiko/getting-started' },
                { label: 'Commands', translations: { 'zh-CN': '命令参考' }, slug: 'seiko/commands' },
              ],
            },
            {
              label: 'Concepts',
              translations: { 'zh-CN': '概念' },
              items: [
                { label: 'Declaration and lock', translations: { 'zh-CN': '声明与锁' }, slug: 'seiko/declaration' },
                { label: 'Sources and indexes', translations: { 'zh-CN': '源与索引' }, slug: 'seiko/sources' },
                { label: 'Store and deployment', translations: { 'zh-CN': '存储与部署' }, slug: 'seiko/store' },
              ],
            },
            { label: 'MCP server', translations: { 'zh-CN': 'MCP server' }, slug: 'seiko/mcp' },
            { label: 'Publishing a sei', translations: { 'zh-CN': '发布 sei' }, slug: 'seiko/publishing' },
            { label: 'Troubleshooting', translations: { 'zh-CN': '常见问题' }, slug: 'seiko/troubleshooting' },
          ],
        },
      ],
    }),
  ],
});
