#!/bin/bash

# 部署准备脚本
echo "🚀 开始部署准备..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node -v
npm -v

# 安装依赖
echo "📦 安装依赖..."
npm ci

# 运行代码检查
echo "🔍 运行代码检查..."
npm run lint

# 构建应用
echo "🏗️ 构建应用..."
npm run build

# 检查构建结果
echo "✅ 检查构建结果..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "🎉 构建成功！"
    echo "📁 构建文件:"
    ls -la dist/
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🎊 部署准备完成！"