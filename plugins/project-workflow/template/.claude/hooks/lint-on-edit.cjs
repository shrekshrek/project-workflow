#!/usr/bin/env node
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
// PostToolUse hook: lint on edit
//
// 这是**方法论骨架**:展示 hook 怎么挂、怎么从 stdin 读 file_path / apply_patch,
// 怎么按文件类型分流 lint。
// 具体 lint 命令是栈相关,默认全部注释掉,启用前打开你需要的那条。
//
// 一份**完整能跑的多栈实现**通常会处理:host 端前端 eslint + docker exec 后端 ruff
// + 容器没起来 silent skip + WIP 分支跳过 + 大文件跳过 等。
// 本骨架只示意分流,生产用法请按项目实际工具填充各 case 分支。
//
// 启用前的 todo:
// 1. 取消注释 case 分支里你栈对应的 lint 命令(取消 execFileSync 行,IDE warnings 自然消失)
// 2. chmod +x 让本脚本可执行(若 settings.json 用 `node <path>` 调,这步可跳)
// 3. 验证:改一个文件,看是否自动跑 lint
//
// **关于顶部 `// @ts-nocheck` 和 ESLint disable**:template 默认 lint 命令全注释,导致
// `execFileSync` / `localBin` IDE 报 unused;启用任意 case 后两条注释可一并删。
//
// 详细设计见 workflow.md §1.7 + §4.2(失效情形)

const { execFileSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

let projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

// 优先用项目本地 venv / node_modules 里的工具,fallback 到 PATH
// 解决"用户没激活 venv 就开 AI 工具时 hook 用错版本"问题
function localBin(name) {
  const root = projectRoot;
  const candidates = [
    path.join(root, '.venv', 'bin', name),         // Python venv
    path.join(root, 'venv', 'bin', name),          // Python venv 替代名
    path.join(root, 'node_modules', '.bin', name), // Node 工具
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return name; // fallback: PATH 查找
}

function filesFromInput(input) {
  const direct = input.tool_input?.file_path;
  if (direct) return [direct];

  // Codex apply_patch reports the patch body in tool_input.command.
  const command = input.tool_input?.command;
  if (typeof command !== 'string') return [];

  const files = [];
  for (const line of command.split('\n')) {
    const match = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/);
    if (match) files.push(match[1].trim());
  }
  return files;
}

function parseInput(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    console.error('[project-workflow] lint-on-edit: malformed hook JSON; skipping');
    return null;
  }
}

let data = '';
process.stdin.on('data', c => (data += c));
process.stdin.on('end', () => {
  const input = parseInput(data);
  if (!input) process.exit(0);
  projectRoot = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const files = filesFromInput(input);

  // 取不到 file_path / apply_patch 文件列表就跳过(某些工具调用不带)
  if (files.length === 0) process.exit(0);

  for (const rawFile of files) {
    const file = path.isAbsolute(rawFile) ? rawFile : path.join(projectRoot, rawFile);

    // === 智能跳过(写在脚本里,不改 settings.json)===
    // 模式 A:按文件大小跳过(大重构不阻塞)
    if (fs.existsSync(file)) {
      const lines = fs.readFileSync(file, 'utf8').split('\n').length;
      if (lines > 1000) continue;
    }

    // 模式 B:按 git 分支跳过(WIP 分支放宽)
    try {
      const branch = execSync('git branch --show-current', {
        cwd: path.dirname(file),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (branch.startsWith('wip-')) continue;
    } catch {} // 不是 git 仓库就跳过这一步

    // 模式 C:按环境变量临时关闭(shell 里 export CLAUDE_SKIP_LINT=1)
    if (process.env.CLAUDE_SKIP_LINT) process.exit(0);

    // === 按文件类型 lint ===
    // 失败时 stderr 通过 stdio: 'inherit' 自动写出,AI 可见
    // 如果想"阻塞 Claude/Codex 让它必须修",改 process.exit(2)
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
  }
  process.exit(0);
});
