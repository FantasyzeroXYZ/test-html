# 播放测试
* 目前尚处测试阶段
## 项目文件结构
```
foreign-language-media-player/
├── index.html                  # 主HTML文件
├── css/
│   └── style.css              # 样式文件
├── js/
│   ├── main.js                # 主程序入口
│   ├── modules/
│   │   ├── player.js          # 媒体播放器模块
│   │   ├── subtitle.js        # 字幕处理模块
│   │   ├── dictionary.js      # 词典查询模块
│   │   ├── anki.js           # Anki连接模块
│   │   ├── japanese.js       # 日语分词模块
│   │   └── ui.js             # 用户界面模块
│   └── utils/
│       ├── file-handler.js    # 文件处理工具
│       ├── time-utils.js      # 时间格式化工具
│       └── config.js          # 配置管理工具
└── README.md                  # 项目说明文档

```
* css拆分
  * 移动端
  * PC端
  * 其他按类型？
* JavaScript
  * 按功能类型
* 
## 来源
* 播放器
  * [plyr](https://github.com/sampotts/plyr)
* 词典API出处
  * https://freedictionaryapi.com/
  * [freeDictionaryAPI](https://github.com/meetDeveloper/freeDictionaryAPI)
