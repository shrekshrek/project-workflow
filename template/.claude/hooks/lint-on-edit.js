#!/usr/bin/env node
// PostToolUse hook: lint on edit
//
// 这是**方法论骨架**:展示 hook 怎么挂、怎么从 stdin 读 file_path、怎么按文件类型分流 lint。
// 具体 lint 命令是栈相关,默认全部注释掉,启用前打开你需要的那条。
//
// 想要一份**完整能跑的多栈实现**(host 端前端 eslint + docker exec 后端 ruff
// + 容器没起来 silent skip + WIP 分支跳过 + 大文件跳过 等),
// 直接照搬 scaffold-v2 的版本:
//   https://github.com/<repo>/scaffold-v2/blob/main/.claude/hooks/lint-on-edit.js
//
// 启用前的 todo:
// 1. 取消注释 case 分支里你栈对应的 lint 命令(或照搬 scaffold-v2 的)
// 2. chmod +x 让本脚本可执行(若 settings.json 用 `node <path>` 调,这步可跳)
// 3. 验证:改一个文件,看是否自动跑 lint
//
// 详细设计见 workflow.md §1.7 + §4.2(失效情形)

const { execFileSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// 优先用项目本地 venv / node_modules 里的工具,fallback 到 PATH
// 解决"用户没激活 venv 就开 AI 工具时 hook 用错版本"问题
function localBin(name) {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const candidates = [
    path.join(root, '.venv', 'bin', name),         // Python venv
    path.join(root, 'venv', 'bin', name),          // Python venv 替代名
    path.join(root, 'node_modules', '.bin', name), // Node 工具
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return name; // fallback: PATH 查找
}

let data = '';
process.stdin.on('data', c => (data += c));
process.stdin.on('end', () => {
  const input = JSON.parse(data || '{}');
  const file = input.tool_input?.file_path;

  // 取不到 file_path 就跳过(某些工具调用不带)
  if (!file) process.exit(0);

  // === 智能跳过(写在脚本里,不改 settings.json)===
  // 模式 A:按文件大小跳过(大重构不阻塞)
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n').length;
    if (lines > 1000) process.exit(0);
  }

  // 模式 B:按 git 分支跳过(WIP 分支放宽)
  try {
    const branch = execSync('git branch --show-current', {
      cwd: path.dirname(file),
      encoding: 'utf8',
    }).trim();
    if (branch.startsWith('wip-')) process.exit(0);
  } catch {} // 不是 git 仓库就跳过这一步

  // 模式 C:按环境变量临时关闭(shell 里 export CLAUDE_SKIP_LINT=1)
  if (process.env.CLAUDE_SKIP_LINT) process.exit(0);

  // === 按文件类型 lint ===
  // 失败时 stderr 通过 stdio: 'inherit' 自动写出,AI 可见
  // 如果想"阻塞 Claude 让它必须修",改 process.exit(2)
  try {
    if (/\.(vue|ts|tsx|js|jsx)$/.test(file)) {
      // === 前端:取消注释你用的工具(localBin 优先用项目本地 eslint)===
      // execFileSync(localBin('eslint'), ['--fix', file], { stdio: 'inherit' });
    } else if (/\.py$/.test(file)) {
      // === Python:取消注释(localBin 优先用 .venv/bin/ruff)===
      // execFileSync(localBin('ruff'), ['check', '--fix', file], { stdio: 'inherit' });
      // execFileSync(localBin('ruff'), ['format', file], { stdio: 'inherit' });
    } else if (/\.go$/.test(file)) {
      // === Go:取消注释(gofmt / go 通常在 PATH,localBin 也可)===
      // execFileSync(localBin('gofmt'), ['-w', file], { stdio: 'inherit' });
      // execFileSync(localBin('go'), ['vet', `${path.dirname(file)}/...`], { stdio: 'inherit' });
    } else if (/\.rs$/.test(file)) {
      // === Rust:取消注释 ===
      // execFileSync(localBin('cargo'), ['fmt', '--', file], { stdio: 'inherit' });
    }
  } catch {
    // lint 失败,错误已经在 stderr;非阻塞继续
  }
  process.exit(0);
});
