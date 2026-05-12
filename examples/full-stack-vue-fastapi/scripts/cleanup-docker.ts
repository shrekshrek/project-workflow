/**
 * Docker 交互式清理 —— 解决"端口被占用 / 孤儿容器 / 磁盘占满"等常见状况。
 *
 * 用法:`pnpm cleanup`
 *
 * 选项:
 *   1) 列出所有项目的容器和数据卷(只读,辅助诊断)
 *   2) 停止并删除当前项目的容器(保留数据库数据)
 *   3) 停止并删除当前项目的容器和数据卷(⚠️ 数据库数据全丢)
 *   4) 清理所有未使用的 Docker 资源(全局,危险)
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Confirm, Select } from 'enquirer'

const root = process.cwd()
const envPath = path.resolve(root, '.env')

let projectName = path.basename(root)
if (fs.existsSync(envPath)) {
  const m = fs.readFileSync(envPath, 'utf-8').match(/^COMPOSE_PROJECT_NAME=(.*)$/m)
  if (m?.[1]?.trim()) projectName = m[1].trim()
}

console.log('🧹 Docker 清理工具')
console.log('================================')
console.log(`当前项目: ${projectName}`)
console.log('')

const menu = new Select({
  name: 'option',
  message: '选择清理操作',
  choices: [
    { name: 'list', message: '1) 列出所有 Docker 容器和数据卷(只读)' },
    { name: 'down', message: '2) 停止并删除当前项目的容器(保留数据)' },
    { name: 'downVolumes', message: '3) 停止并删除当前项目的容器和数据卷(⚠️ 删数据)' },
    { name: 'prune', message: '4) 清理所有未使用的 Docker 资源(全局,危险)' },
    { name: 'exit', message: '5) 退出' },
  ],
})

const run = (cmd: string) => execSync(cmd, { stdio: 'inherit' })

void (async () => {
  const choice = await menu.run()

  switch (choice) {
    case 'list':
      console.log('\n📦 容器列表:')
      run('docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
      console.log('\n💾 数据卷列表:')
      run('docker volume ls')
      break

    case 'down':
      console.log(`\n🛑 停止并删除项目 '${projectName}' 的容器(保留数据卷)...`)
      run('docker compose down --remove-orphans')
      console.log('✅ 完成,数据卷已保留。')
      break

    case 'downVolumes': {
      console.log(`\n⚠️  这会删除项目 '${projectName}' 的所有数据(包括数据库)`)
      const ok = await new Confirm({ name: 'ok', message: '确定继续?' }).run()
      if (!ok) {
        console.log('已取消')
        break
      }
      run('docker compose down -v --remove-orphans')
      console.log('✅ 完成,容器和数据卷已清空。')
      break
    }

    case 'prune': {
      console.log('\n⚠️  这是全局操作,会清掉:')
      console.log('  - 所有已停止的容器')
      console.log('  - 所有未使用的网络')
      console.log('  - 所有悬空(dangling)镜像')
      console.log('  - 所有未使用的构建缓存')
      console.log('  - 所有未使用的数据卷')
      const ok = await new Confirm({ name: 'ok', message: '确定继续?' }).run()
      if (!ok) {
        console.log('已取消')
        break
      }
      run('docker system prune -a --volumes -f')
      console.log('✅ 清理完成。')
      break
    }

    default:
      console.log('退出')
  }
})()
