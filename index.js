/**
 * dsh-unified-settings 的宿主半：只做一件事 —— 读写 dsh-agent-soul 的配置文件
 * `$DSH_HOME/agents/persona.json`，让统一配置台能直接改它，而不用手改文件。
 *
 * 只允许写白名单里的键，其余原样保留；文件按 mtime 被 agent-soul 重新读取，
 * 所以保存后下一轮就生效，不需要重启插件。
 *
 * 其余的（speak-up、douyin-studio）各自已经有同源 HTTP 接口，浏览器半直接调它们的，
 * 不需要在这里中转。
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

export const inject = ['webServer', 'connection']

const 家目录 = () => process.env.DSH_HOME || join(homedir(), '.dsh')
const 配置文件 = () => join(家目录(), 'agents', 'persona.json')

/** 允许从面板改的键。新增键先加到这里，避免把插件内部字段写坏。 */
const 白名单 = new Set([
  'ownerName',
  'ownerGender',
  'relationship',
  'moodEnabled',
  'memoryEnabled',
  'notesEnabled',
  'purposeEnabled',
  'diaryEnabled',
  'diaryAgentWrite',
  'includeGlobal',
  'projectPersonaEnabled',
  'memoryRefineProvider',
  'memoryRefineModel',
  'moodJudgeProvider',
  'moodJudgeModel',
  'diarySummarizeProvider',
  'diarySummarizeModel',
])

function 读配置() {
  try {
    const raw = readFileSync(配置文件(), 'utf8').replace(/^\uFEFF/, '')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function 写配置(next) {
  const target = 配置文件()
  mkdirSync(dirname(target), { recursive: true })
  const tmp = target + '.tmp'
  writeFileSync(tmp, JSON.stringify(next, null, 2) + '\n', 'utf8')
  renameSync(tmp, target)
}

function 发(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(body))
}

async function 读体(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

export function apply(ctx) {
  if (!ctx.webServer || typeof ctx.webServer.register !== 'function') return

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/api/unified-settings',
    handler: async (req, res) => {
      try {
        const rejected = ctx.connection && typeof ctx.connection.requestRejection === 'function'
          ? ctx.connection.requestRejection(req)
          : 0
        if (rejected) return 发(res, rejected, { ok: false, error: '请求没过 DSH 的访问检查（' + rejected + '）' })

        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const p = url.pathname.replace(/^\/api\/unified-settings/, '') || '/'
        const isJson = /^application\/json/i.test(String(req.headers['content-type'] || ''))

        if (req.method === 'GET' && p === '/soul') {
          return 发(res, 200, { ok: true, config: 读配置() })
        }
        if (req.method === 'POST' && p === '/soul') {
          if (!isJson) return 发(res, 415, { ok: false, error: '需要 application/json' })
          const body = await 读体(req)
          const patch = body && typeof body.patch === 'object' && body.patch ? body.patch : {}
          const current = 读配置()
          const next = { ...current }
          const applied = []
          for (const [key, value] of Object.entries(patch)) {
            if (!白名单.has(key)) continue
            const okType = typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number'
            if (!okType) continue
            next[key] = value
            applied.push(key)
          }
          if (applied.length === 0) return 发(res, 200, { ok: true, config: current, applied })
          try {
            写配置(next)
          } catch (error) {
            return 发(res, 500, { ok: false, error: String((error && error.message) || error) })
          }
          return 发(res, 200, { ok: true, config: next, applied, file: 配置文件() })
        }
        return 发(res, 404, { ok: false, error: '没有这条接口' })
      } catch (error) {
        return 发(res, 500, { ok: false, error: String((error && error.message) || error) })
      }
    },
  }))
}
