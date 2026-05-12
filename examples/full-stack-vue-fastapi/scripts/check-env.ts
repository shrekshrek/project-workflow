/**
 * 启动前的 .env 校验 —— dev / bootstrap 都先跑这个,失败就 exit 1。
 *
 * 设计参考 nuxt 脚手架,适配 scaffold-v2:
 *   - 必填:.env 存在
 *   - 强警告(不阻塞):COMPOSE_PROJECT_NAME 没设(影响多项目隔离)
 *   - 强警告(不阻塞):JWT_SECRET 还是 dev 默认值
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const envPath = path.resolve(root, '.env')
const examplePath = path.resolve(root, '.env.example')

if (!fs.existsSync(envPath)) {
  console.error('❌ .env 文件不存在')
  console.error('')
  console.error('请先复制 .env.example 到 .env:')
  console.error('  cp .env.example .env')
  if (fs.existsSync(examplePath)) {
    console.error('')
    console.error('(.env.example 已存在,直接 cp 即可)')
  }
  process.exit(1)
}

const env = fs.readFileSync(envPath, 'utf-8')
const get = (key: string) => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim()

const projectName = get('COMPOSE_PROJECT_NAME')
const jwtSecret = get('JWT_SECRET')

const warnings: string[] = []

if (!projectName) {
  warnings.push(
    'COMPOSE_PROJECT_NAME 未设(用目录名 scaffold-v2 当默认)。多项目并行开发时建议显式设独有的名,避免容器 / 卷 / 网络冲突。',
  )
}

if (!jwtSecret || jwtSecret.includes('dev_only_change_in_prod')) {
  warnings.push(
    'JWT_SECRET 还是 dev 默认值,生产部署前必须改成 32+ 位随机字符串(`openssl rand -hex 32`)。',
  )
}

if (warnings.length > 0) {
  console.warn('⚠️  .env 校验通过,但有警告:')
  for (const w of warnings) console.warn(`  - ${w}`)
  console.warn('')
}

console.log(`✅ .env 检查通过 (项目: ${projectName || 'scaffold-v2 (默认)'})`)
