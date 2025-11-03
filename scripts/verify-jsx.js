const fs = require('fs')
const path = require('path')

console.log('🔍 验证 JSX 项目配置...')

// 检查关键文件
const requiredFiles = [
  'index.html',
  'src/main.jsx',
  'src/App.jsx',
  'vite.config.js',
  'package.json'
]

let allFilesExist = true

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
    
    // 检查 index.html 中的引用
    if (file === 'index.html') {
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes('src="/src/main.jsx"')) {
        console.log('   ✅ 正确引用 main.jsx')
      } else {
        console.log('   ❌ 没有正确引用 main.jsx')
        allFilesExist = false
      }
    }
  } else {
    console.log(`❌ ${file} - 不存在`)
    allFilesExist = false
  }
})

// 检查不应该存在的 TypeScript 文件
const tsFiles = [
  'tsconfig.json',
  'tsconfig.node.json',
  'src/main.tsx'
]

tsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`⚠️  ${file} - 应该删除（项目已改为 JSX）`)
  }
})

if (allFilesExist) {
  console.log('🎉 JSX 项目配置正确！')
} else {
  console.log('❌ 项目配置有问题，请修复上述问题')
  process.exit(1)
}