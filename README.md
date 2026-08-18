# 保命 TI・人生兜底人格测试

一套移动端优先的趣味人格体验：

1. 2 分钟完成 20 道人格题；
2. 解锁普通、稀有彩蛋、限定隐藏或百搭兜底人格；
3. 查看三维人格解读与短期/长期开局 Buff；
4. 带着人格 Buff 进入 6 事件人生兜底模拟器；
5. 收藏人格图鉴、生成双人适配结果并分享文案。

测试与模拟器均为娱乐及风险观念科普内容，不展示具体金融产品、价格或投保入口。

## 视觉风格

**Z-Dreamscape**（Z 世代渐变梦境）—— 浅紫粉到电蓝的多层径向渐变 + 玻璃拟态 + 动效流光，响应系统 `prefers-color-scheme` 自动切换暗色模式。

- 渐变色板：电紫 `#c026d3` × 电蓝 `#3b82f6` × 荧光绿 `#84cc16` × 暖橙 `#f59e0b`
- 字体：Sora（标题/正文）+ Space Grotesk（数字/Buff）+ Noto Sans SC（中文）
- 圆角：卡片 28-36px，按钮 999px 胶囊
- 动效：`gradient-shift` 渐变流动 / `shine` 流光 / `float` 悬浮 / `pop-bounce` 弹入

## 本地运行

```bash
cd nciti-github
npm start
```

浏览器打开：<http://localhost:8080>

> 需通过本地服务器打开，ES module + 跨域字体需要 HTTP 协议，**不能**双击 `index.html`。

## 部署

```bash
npm run build   # 把静态文件复制到 build/
```

输出到 `build/` 目录，可被任何静态托管服务直接 serve（Render / Netlify / Vercel / 帽子云 / Sealos / Cloudflare Pages 等）。`.dockerignore` 已排除 `node_modules/ .git/ build/ tests/` 等无关内容，buildkit 上下文干净。

帽子云 / Render 等需要 `build` 目录的容器平台：保持默认配置（`build command: npm run build`，`publish dir: build`）即可。

> `npm run build` **只拷贝** `data/content.json`,不会重新生成它 —— 站长在线编辑的内容就存于 `data/content.json`(`js/data.js` 里的题库只是出厂默认与回退)。重新生成需手动执行 `npm run export:content -- --force`。

## 开发预览结果卡（跳过答题）

- 核心：<http://localhost:8080/?preview=COVERED>
- 彩蛋：<http://localhost:8080/?preview=ASTRAL>
- 隐藏：<http://localhost:8080/?preview=MAXED>
- 兜底：<http://localhost:8080/?preview=HHHH>

## 计分规则

判定按以下顺序执行，命中即终止：

1. 限定隐藏：`VOID` / `MAXED`；
2. 百搭兜底：所有可计分核心均不超过 1；
3. 非 Q12 稀有彩蛋；
4. 两分封顶核心 `TECHIE` / `COHO` 的唯一明确偏向；
5. Q12 玄学彩蛋；
6. 最高分核心，平局依次比较流派总分和答卷稳定伪随机值。

相同答案始终产生相同结果。Q12 必选彩蛋与 HHHH、TECHIE、COHO 的可达性冲突已在判定层消解。

## 测试

```bash
npm test
```

## 目录结构

```
.
├── index.html                    # 入口：含字体 / theme-color / 缓存版本
├── admin.html                    # 题库管理页（无首页入口，URL 直接访问）
├── css/
│   ├── style.css                 # Z-Dreamscape 设计系统（浅色 + 暗色）
│   └── admin.css                 # 管理页独立样式
├── images/
│   └── avatars-cutout-v3/        # 32 款透明背景头像（页面使用）
├── data/
│   └── content.json              # 线上题库（站长在线编辑的数据源，可被管理页写回）
├── scripts/
│   └── export-content.mjs        # 从 data.js 重新生成 content.json（默认拒绝覆盖，--force 才覆盖）
├── js/
│   ├── data.js                   # 出厂默认题库、人格与流派基础数据
│   ├── content.js                # 运行时题库加载器（拉取 content.json + 校验 + 失败回退）
│   ├── experience-data.js        # 解读、Buff、章节、匹配和模拟事件
│   ├── scoring.js                # 计分引擎（从 content.js 读运行时题库）
│   ├── simulator.js              # 轻量人生模拟器
│   ├── storage.js                # 本地图鉴与匿名本地统计
│   ├── avatars.js                # 头像挂载
│   ├── ui.js                     # 页面渲染
│   ├── admin.js                  # 管理页逻辑（GitHub Contents API 读写 content.json）
│   └── main.js                   # 流程入口
├── tests/
│   ├── scoring.test.js           # 计分引擎单测
│   └── content.test.js           # 线上题库校验单测
├── package.json
└── README.md
```

图鉴与统计仅保存在浏览器 `localStorage`，不收集手机号、身份证或其他身份信息。

## 题库在线编辑

访问 `https://<你的域名>/admin.html` 打开管理页（无首页入口，仅站长通过 URL 访问；页面本身无登录框之外的鉴权，**不要公开该地址**）。

**首次使用：创建 GitHub Token**

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token；
2. 授权仓库选择 `m4rklee/nciti`（仅这一个仓库），权限勾选 **Contents: Read and write**，过期时间按需（建议选 90 天或 no expiration）；
3. 在管理页粘贴该 token 并「保存并连接」。Token 只保存在**本机浏览器 localStorage**（键 `nciti.gh.pat`），不上传服务器；一旦怀疑泄露，到 GitHub 撤销即可，页面「退出」会清除本地记录。

**编辑流程**

- 打开管理页 → 粘贴 token 连接 → 加载线上题库（20 题 × 4 选项）；
- 修改章节 / 题干 / 选项文案 / 选项 tag（tag 决定该选项指向哪个人格，影响计分）；
- 「保存到 GitHub」→ 提交到仓库 `data/content.json` → 帽子云检测到 push 自动重建 → **1-3 分钟后全站生效**；
- 彩蛋位选项（✨ 徽标）改动 tag 会使对应彩蛋判定失效，保存前会二次确认（不阻断）；
- 「恢复默认题库」用 `js/data.js` 的出厂题库覆盖线上；「重新加载」丢弃未保存修改。

**注意事项**

- 管理页强制 20 题 × 4 选项（key A-D），结构与计分引擎、彩蛋判定强耦合，不要通过改仓库 JSON 增删题目；
- 线上题库损坏或加载失败时，网站自动回退到出厂默认题库，不会白屏（控制台有 warn）；
- 保存后生效依赖帽子云的**自动部署**：请确认该项目在帽子云为自动部署模式；若为手动推送模式，每次编辑保存后需到帽子云控制台手动「推送至此环境」；
- 手动提交兜底：GitHub API 不可用（如网络问题）时，管理页错误视图的「复制手动提交内容」会把最新题库 + git 提交命令复制到剪贴板，站长在本地手动 commit + push 即可。

## 自定义视觉

所有颜色、圆角、阴影、动效都集中在 `css/style.css` 顶部的 `:root` 块；暗色模式由 `@media (prefers-color-scheme: dark)` 块覆盖。改 token 即可整体换皮，无需触碰组件规则。

## License

MIT
