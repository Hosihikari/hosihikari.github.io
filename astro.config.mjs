// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import lucode from 'lucode-starlight';

export default defineConfig({
  site: 'https://hosihikariframework.github.io',
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
        src: './public/logo.svg',
      },
      favicon: '/favicon.svg',
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
            'Hosihikari Framework · 星光框架 · [LGPL-3.0-or-later](https://github.com/HosihikariFramework/hosihikariframework.github.io/blob/main/LICENSE.md) · Built with [Starlight](https://starlight.astro.build/)',
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
          ],
        },
      ],
      credits: true,
    }),
  ],
});
