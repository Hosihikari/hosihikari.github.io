// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import lucode from 'lucode-starlight';

const siteUrl = 'https://hf.srcz.one';
const ogImage = new URL('/og-image.png', siteUrl).href;

export default defineConfig({
  site: siteUrl,
  integrations: [
    starlight({
      title: {
        en: 'Hosihikari Framework',
        'zh-CN': '星光框架',
      },
      description: 'A plugin container for Minecraft Bedrock Dedicated Server.',
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
        { tag: 'meta', attrs: { name: 'theme-color', content: '#780088' } },
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
      plugins: [
        lucode({
          footerText:
            'Hosihikari Framework · 星光框架 · [Content CC BY-SA 4.0](https://github.com/HosihikariFramework/hosihikariframework.github.io/blob/main/LICENSE.md) · [Code MIT-0](https://github.com/HosihikariFramework/hosihikariframework.github.io/blob/main/LICENSE-CODE.md) · Built with [Starlight](https://starlight.astro.build/)',
        }),
      ],
      customCss: [
        '@fontsource-variable/noto-sans-sc/wght.css',
        './src/styles/custom.css',
      ],
      sidebar: [
        {
          label: 'Getting started',
          translations: { 'zh-CN': '开始使用' },
          items: [
            {
              label: 'Quick start',
              translations: { 'zh-CN': '快速开始' },
              slug: 'quick-start',
            },
            {
              label: 'Plugin packages',
              translations: { 'zh-CN': '插件包与清单' },
              slug: 'plugin-package',
            },
            {
              label: 'Templates',
              translations: { 'zh-CN': '模板' },
              slug: 'templates',
            },
            {
              label: 'Examples',
              translations: { 'zh-CN': '示例插件' },
              slug: 'examples',
            },
          ],
        },
        {
          label: 'Authoring',
          translations: { 'zh-CN': '写插件' },
          items: [
            {
              label: 'C# plugins',
              translations: { 'zh-CN': 'C# 插件' },
              slug: 'authoring-csharp',
            },
            {
              label: 'F# plugins',
              translations: { 'zh-CN': 'F# 插件' },
              link: 'https://github.com/HosihikariFramework/FSharpProvider',
            },
          ],
        },
        {
          label: 'Exception',
          translations: { 'zh-CN': '例外' },
          items: [
            {
              label: 'Out-of-process bridge',
              translations: { 'zh-CN': '进程外桥' },
              slug: 'authoring-rpc',
            },
          ],
        },
        {
          label: 'Help',
          translations: { 'zh-CN': '排错' },
          items: [
            {
              label: 'Troubleshooting',
              translations: { 'zh-CN': '常见问题' },
              slug: 'troubleshooting',
            },
            {
              label: 'Releases',
              translations: { 'zh-CN': '发布记录' },
              slug: 'releases',
            },
          ],
        },
      ],
      credits: true,
    }),
  ],
});
