// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const siteUrl = 'https://hf.srcz.one';
const ogImage = new URL('/og-image.png', siteUrl).href;

export default defineConfig({
  site: siteUrl,
  // 弯引号落到 CJK 字体上是全角宽度，英文正文里会裂开。
  markdown: { smartypants: false },
  integrations: [
    starlight({
      title: {
        en: 'Hosihikari Framework',
        'zh-CN': '星光框架',
      },
      description: 'Loads and manages .NET plugins inside Bedrock Dedicated Server.',
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
        { tag: 'meta', attrs: { property: 'og:image', content: ogImage } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Hosihikari Framework 星光框架' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: ogImage } },
        { tag: 'meta', attrs: { name: 'twitter:image:alt', content: 'Hosihikari Framework 星光框架' } },
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
          href: 'https://github.com/HosihikariFramework',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/HosihikariFramework/hosihikariframework.github.io/edit/main/',
      },
      lastUpdated: true,
      components: {
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
          label: 'Server',
          translations: { 'zh-CN': '服务器' },
          items: [
            { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'server' },
            { label: 'Carriers', translations: { 'zh-CN': '选择载体' }, slug: 'server/carriers' },
            { label: 'LeviLamina', translations: { 'zh-CN': 'LeviLamina' }, slug: 'server/install/levilamina' },
            { label: 'Endstone', translations: { 'zh-CN': 'Endstone' }, slug: 'server/install/endstone' },
            { label: 'Self-hosted', translations: { 'zh-CN': '自持态' }, slug: 'server/install/selfhosted' },
            { label: 'Updating', translations: { 'zh-CN': '升级与回滚' }, slug: 'server/updating' },
            { label: 'Recovery', translations: { 'zh-CN': '故障恢复' }, slug: 'server/recovery' },
            { label: 'Backup', translations: { 'zh-CN': '备份与还原' }, slug: 'server/backup' },
          ],
        },
        {
          label: 'Develop',
          translations: { 'zh-CN': '写插件' },
          items: [
            { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'develop' },
            { label: 'Your first plugin', translations: { 'zh-CN': '第一个插件' }, slug: 'develop/first-plugin' },
            { label: 'Plugin packages', translations: { 'zh-CN': '插件包与清单' }, slug: 'develop/plugin-package' },
            { label: 'Templates', translations: { 'zh-CN': '模板' }, slug: 'develop/templates' },
            { label: 'Examples', translations: { 'zh-CN': '示例插件' }, slug: 'develop/examples' },
            { label: 'C# plugins', translations: { 'zh-CN': 'C# 插件' }, slug: 'develop/authoring-csharp' },
            { label: 'F# plugins', translations: { 'zh-CN': 'F# 插件' }, slug: 'develop/authoring-fsharp' },
            { label: 'Out-of-process plugins', translations: { 'zh-CN': '进程外插件' }, slug: 'develop/authoring-rpc' },
            { label: 'Testing plugins', translations: { 'zh-CN': '测试插件' }, slug: 'develop/testing' },
            { label: 'Troubleshooting', translations: { 'zh-CN': '常见问题' }, slug: 'develop/troubleshooting' },
          ],
        },
        {
          label: 'Embed',
          translations: { 'zh-CN': '内嵌' },
          items: [
            { label: 'Overview', translations: { 'zh-CN': '概述' }, slug: 'embed' },
            { label: 'Getting started', translations: { 'zh-CN': '开始内嵌' }, slug: 'embed/getting-started' },
            { label: 'Carrier services', translations: { 'zh-CN': '载体服务' }, slug: 'embed/carrier-services' },
            { label: 'Lifecycle', translations: { 'zh-CN': '生命周期' }, slug: 'embed/lifecycle' },
            { label: 'Events and callbacks', translations: { 'zh-CN': '事件与回调' }, slug: 'embed/events-and-callbacks' },
          ],
        },
        {
          label: 'Releases',
          translations: { 'zh-CN': '发布记录' },
          items: [{ label: 'Releases', translations: { 'zh-CN': '发布记录' }, slug: 'releases' }],
        },
      ],
    }),
  ],
});
