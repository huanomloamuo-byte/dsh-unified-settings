# dsh-unified-settings

把几个常用的 DeepSeek Harness 插件的配置收进**一页**：在「插件 → 已安装 → 统一配置台」里直接改，不用挨个翻设置页、更不用手改 JSON。

## 能做什么

| 卡片 | 能改什么 | 怎么接的 |
|---|---|---|
| **dsh-agent-soul** | 怎么称呼你、关系、心情 / 记忆 / 日记开关、全局人格注入开关、日记模型 | 自带宿主接口 `/api/unified-settings/soul`，读写 `$DSH_HOME/agents/persona.json`（白名单键，其余原样保留） |
| **dsh-plugin-global-persona** | 全局人格正文 | 走 DSH 的 `configForms`，与插件自己的页面同一份配置 |
| **dsh-speak-up** | 间隔、搭话冷却、安静时段、试运行 | 直接调它自己的 `/dsh-speak-up/state` 与 `/dsh-speak-up/save` |
| **dsh-douyin-studio** | 自动回私信 / 评论 / @、主动找主人、自动发布、每天分享与刷视频轮数、默认发布方式与可见性 | 直接调它的 `/api/douyin-studio/settings`（`patch` 单字段保存） |
| dsh-meme / dsh-emoji | 只给入口位置 | 它们没有可复用的配置接口 |

设计上刻意做得很薄：**不复制别的插件的配置 schema，也不直接改它们的配置文件**——除了 agent-soul 那份 JSON（它本身就是人可读、按 mtime 重读的），其余全部走对方自己的 HTTP 接口，让它们自己做校验。

## 安装

需要 DSH 0.2.x。

```bash
# 从本地目录（推荐，改完即生效）
dsh plugin --profile desktop add link:/path/to/dsh-unified-settings

# 或者先下载 ZIP 解压，再在 DSH 里「插件 → 添加插件」选目录
```

装完刷新页面，在 **插件 → 已安装 → dsh-unified-settings** 打开。

> 装之前请确认依赖的插件已经装好：`dsh-agent-soul`、`dsh-plugin-global-persona`、`dsh-speak-up`、`dsh-douyin-studio`。缺哪个，那张卡会显示读取失败，不影响其它卡。

## 配置项

没有自己的配置。页面里的值都写在被管理的插件那边。

## 隐私

- 没有网络请求、没有遥测。
- 只读写本机 `$DSH_HOME` 下的文件与同源接口。
- 不读取、不上传任何会话内容。

## 开发

```
index.js    宿主半：/api/unified-settings/soul 一个前缀路由
client.js   浏览器半：plugins.bundle.config 槽里的一页
```

改完 `client.js` 刷新页面即可；改 `index.js` 需要在插件管理里关掉再启用一次（或重启 DSH）。

## License

MIT
