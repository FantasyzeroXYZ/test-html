```
vite-project/
├── src/
│   ├── App.tsx       # 主组件
│   ├── main.tsx      # 应用入口
│   ├── App.css       # 主样式
│   ├── index.css     # 全局样式
│   └── vite-env.d.ts # 类型声明
├── public/           # 静态资源
├── index.html        # HTML 模板
└── package.json      # 项目配置
```
# 项目结构
src/
├── components/          # React 组件
│   ├── Header.jsx
│   ├── AnkiSection.jsx
│   ├── PlayerSection.jsx
│   ├── SubtitleSection.jsx
│   ├── DictionaryPanel.jsx
│   ├── SubtitleListPanel.jsx
│   └── MediaControls.jsx
├── hooks/              # 自定义 Hooks
│   ├── useAnki.js
│   ├── useMediaPlayer.js
│   ├── useSubtitle.js
│   └── useDictionary.js
├── styles/             # 样式文件
│   └── App.css
├── App.jsx             # 主应用组件
└── main.jsx            # 应用入口


├── .github/workflows/     # GitHub Actions 配置
├── public/               # 静态资源
├── src/                  # 源代码
├── scripts/              # 部署脚本
└── dist/                 # 构建输出（自动生成）


* https://cdn.jsdelivr.net/gh/curiousdannii/parchment@gh-pages/dist/