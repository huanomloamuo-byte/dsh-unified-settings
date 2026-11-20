/**
 * dsh-unified-settings 的浏览器半：在「插件 → 已安装 → 统一配置台」里渲染一张汇总页。
 *
 * 三块是**直接可改**的：
 *   · 全局人格 —— 走 configForms 的 global-persona 条目
 *   · dsh-agent-soul —— 走本插件的宿主接口 /api/unified-settings/soul（读写 persona.json）
 *   · dsh-speak-up / dsh-douyin-studio —— 直接调它们自己的同源 HTTP 接口
 * 另外两张（表情包 / 表情）只给入口，它们没有可复用的配置接口。
 */

window.__ModuleLoader__.load({
  id: 'dsh-unified-settings',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-unified-settings'

    const SUGGESTED_PERSONA = [
      '你是一个可靠、务实、有分寸的 AI 助手。',
      '',
      '性格：话不多，但说到点上；不讨好、不打官腔，也不端着。',
      '',
      '沟通风格：',
      '- 中文作答，先给结论或可直接用的结果，再补必要的理由与步骤。',
      '- 简洁自然，不写空话、套话和过度铺垫。',
      '- 不确定就直说不确定，绝不编造事实、来源、文件内容或执行结果。',
      '- 能直接做的事直接做，不为小事反复确认；真正有歧义或有风险时才问。',
      '- 代码、命令、路径、数字和引用保持精确。',
      '',
      '边界：',
      '- 不擅自做不可逆的事（删除、对外发布、发消息），要先说清楚再动手。',
    ].join('\n')

    const zh = {
      title: '统一配置台',
      description: '六个插件的配置收在这一页。带表单的直接改、点保存即生效；没有表单的给出入口位置。',
      summary: '6 个插件',
      loading: '读取中…',
      loadFailed: '读取失败',
      save: '保存',
      saving: '保存中…',
      saved: '已保存',
      saveFailed: '保存失败',
      discard: '还原',
      readonly: '当前会话只读。',
      on: '开',
      off: '关',
      whereLabel: '入口',
      noteLabel: '说明',

      personaTitle: '全局人格（dsh-plugin-global-persona）',
      personaDescription: '这段正文注入每个会话；保存后下一轮生效。',
      personaEmpty: '人格为空，当前不注入任何内容。',
      personaHint: '纯文本，保存时自动加「## 全局人格」标题。',
      noScope: '读不到全局人格配置（插件可能没启用），刷新页面再试。',
      fillSuggested: '填入建议人格',
      chars: '{count} 字',

      soulTitle: 'dsh-agent-soul',
      soulDescription: '记忆 / 心情 / 日记 / 惦记的事。改的是它自己的配置，保存后立刻生效。',
      soulOwner: '怎么称呼你',
      soulRelation: '关系',
      soulMood: '心情判定',
      soulMemory: '记忆卡',
      soulDiary: '每日日记',
      soulGlobal: '全局人格注入（已交给全局人格插件，建议关）',
      soulDiaryModel: '日记模型',
      soulNote: '记忆和日记都在它的「设置 → 灵魂」里有完整页；这里只放最常用几项。',

      speakTitle: 'dsh-speak-up',
      speakDescription: '按间隔掷骰子决定要不要主动开口。',
      speakInterval: '间隔（分钟）',
      speakDry: '试运行（只说给自己看，不真发）',
      speakQuietFrom: '安静时段开始（点）',
      speakQuietTo: '安静时段结束（点）',
      speakCooldown: '两次搭话冷却（分钟）',
      speakNote: '目标会话在它的「设置 → 主动搭话」里勾。',

      douyinTitle: 'dsh-douyin-studio',
      douyinDescription: '单个抖音号的工作台。这些开关都只在这里改，改完立即生效。',
      douyinAutoDm: '自动回私信',
      douyinAutoComment: '自动回评论',
      douyinAutoAt: '自动回 @我',
      douyinAutoSpeak: '主动找主人说话',
      douyinAutoPublish: '自动发作品',
      douyinSharePerDay: '每天私信分享几条',
      douyinScanRounds: '每天自动刷几轮',
      douyinPublishMode: '默认发布方式',
      douyinPublishWho: '默认可见性',
      douyinNote: '更细的在「设置 → 抖音」里；写操作仍要二次确认。',

      memeNote: '斗图、收藏、自定义图库。',
      emojiNote: '给回复自动加表情。',
      whereMeme: '设置 → 表情包',
      whereEmoji: '设置 → 回复表情（不在就找「插件 → 已安装」）',
      whereSoul: '设置 → 灵魂',
    }

    const en = {
      title: 'Unified settings',
      description: 'All six plugins in one page. Forms save directly; the rest shows where its settings live.',
      summary: '6 plugins',
      loading: 'Loading…',
      loadFailed: 'Load failed',
      save: 'Save',
      saving: 'Saving…',
      saved: 'Saved',
      saveFailed: 'Save failed',
      discard: 'Revert',
      readonly: 'Read-only in this session.',
      on: 'On',
      off: 'Off',
      whereLabel: 'Where',
      noteLabel: 'Note',
      personaTitle: 'Global persona (dsh-plugin-global-persona)',
      personaDescription: 'Injected into every conversation; applies next turn.',
      personaEmpty: 'Empty persona injects nothing.',
      personaHint: 'Plain text; the heading is added automatically.',
      noScope: 'Global persona config is unreadable in this session.',
      fillSuggested: 'Fill suggested persona',
      chars: '{count} chars',
      soulTitle: 'dsh-agent-soul',
      soulDescription: 'Memory / mood / diary. Saves to its own config, effective immediately.',
      soulOwner: 'What to call you',
      soulRelation: 'Relationship',
      soulMood: 'Mood',
      soulMemory: 'Memory',
      soulDiary: 'Daily diary',
      soulGlobal: 'Global persona injection (owned by Global persona plugin)',
      soulDiaryModel: 'Diary model',
      soulNote: 'Full settings live in its own panel.',
      speakTitle: 'dsh-speak-up',
      speakDescription: 'Rolls a die on an interval to start a topic.',
      speakInterval: 'Interval (minutes)',
      speakDry: 'Dry run',
      speakQuietFrom: 'Quiet from (hour)',
      speakQuietTo: 'Quiet to (hour)',
      speakCooldown: 'Cooldown (minutes)',
      speakNote: 'Target sessions are picked in its own panel.',
      douyinTitle: 'dsh-douyin-studio',
      douyinDescription: 'Douyin workspace; every switch applies immediately.',
      douyinAutoDm: 'Auto reply DMs',
      douyinAutoComment: 'Auto reply comments',
      douyinAutoAt: 'Auto reply mentions',
      douyinAutoSpeak: 'Proactively message owner',
      douyinAutoPublish: 'Auto publish',
      douyinSharePerDay: 'Shares per day',
      douyinScanRounds: 'Feed rounds per day',
      douyinPublishMode: 'Publish mode',
      douyinPublishWho: 'Visibility',
      douyinNote: 'More in its own panel; writes still ask twice.',
      memeNote: 'Memes, favourites, custom packs.',
      emojiNote: 'Adds emoji to replies.',
      whereMeme: 'Settings → Memes',
      whereEmoji: 'Settings → Emoji',
      whereSoul: 'Settings → Soul',
    }

    const card = {
      display: 'grid',
      gap: 10,
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 12,
      padding: '14px 16px',
      background: 'var(--dsw-alias-bg-layer-1)',
      color: 'var(--dsw-alias-label-primary)',
    }
    const page = { display: 'grid', gap: 12, maxWidth: 760 }
    const title = { margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }
    const description = { margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary)' }
    const muted = { margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--dsw-alias-label-tertiary)' }
    const fieldRow = { display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, alignItems: 'center' }
    const fieldLabel = { fontSize: 13, color: 'var(--dsw-alias-label-secondary)' }
    const input = {
      width: '100%',
      boxSizing: 'border-box',
      padding: '7px 10px',
      borderRadius: 8,
      border: '1px solid var(--dsw-alias-border-l2)',
      background: 'var(--dsw-alias-bg-base)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: 13,
    }
    const textarea = { ...input, minHeight: 200, resize: 'vertical', lineHeight: 1.7 }
    const actions = { display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }
    const okText = { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-success-primary)' }
    const badText = { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-error-primary)' }
    const warn = { margin: 0, fontSize: 12, color: 'var(--dsw-alias-state-warn-primary)' }

    function buttonStyle(primary, off) {
      return {
        appearance: 'none',
        border: primary ? '1px solid var(--dsw-alias-brand-primary)' : '1px solid var(--dsw-alias-border-l2)',
        borderRadius: 8,
        padding: '7px 16px',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.5 : 1,
        background: primary ? 'var(--dsw-alias-brand-primary)' : 'transparent',
        color: primary ? 'var(--dsw-alias-bg-base)' : 'var(--dsw-alias-label-primary)',
      }
    }

    function Field(props) {
      const { label, children, htmlFor } = props
      return h('label', { style: fieldRow, htmlFor },
        h('span', { style: fieldLabel }, label),
        children)
    }

    function Toggle(props) {
      return h('input', {
        type: 'checkbox',
        role: 'switch',
        checked: Boolean(props.value),
        disabled: props.disabled,
        onChange: (event) => props.onChange(event.target.checked),
        style: { width: 16, height: 16, justifySelf: 'start' },
      })
    }

    function NumberField(props) {
      return h('input', {
        type: 'number',
        value: props.value === undefined || props.value === null ? '' : String(props.value),
        disabled: props.disabled,
        min: props.min,
        max: props.max,
        onChange: (event) => {
          const raw = event.target.value
          props.onChange(raw === '' ? '' : Number(raw))
        },
        style: input,
      })
    }

    function TextField(props) {
      return h('input', {
        type: 'text',
        value: props.value === undefined || props.value === null ? '' : String(props.value),
        disabled: props.disabled,
        onChange: (event) => props.onChange(event.target.value),
        style: input,
      })
    }

    function SelectField(props) {
      return h('select', {
        value: props.value === undefined || props.value === null ? '' : String(props.value),
        disabled: props.disabled,
        onChange: (event) => props.onChange(event.target.value),
        style: input,
      }, ...props.options.map((option) => h('option', { key: option.value, value: option.value }, option.label)))
    }

    async function readJson(url, init) {
      const response = await fetch(url, { credentials: 'same-origin', ...init })
      const text = await response.text()
      let data = null
      try { data = JSON.parse(text) } catch { data = null }
      if (!response.ok) {
        const why = (data && (data.error || data.说)) || ('HTTP ' + response.status)
        throw new Error(why)
      }
      return data
    }

    /** 通用卡片外壳：标题、描述、加载/保存状态、保存按钮。 */
    function ConfigCard(props) {
      const { t, titleText, descriptionText, state, onSave, onReload, children, note, saving, message } = props
      return h('section', { style: card, 'aria-label': titleText },
        h('div', null,
          h('h3', { style: title }, titleText),
          h('p', { style: description }, descriptionText)),
        state === 'loading' ? h('p', { style: muted }, t('loading')) : null,
        state === 'error' ? h('p', { style: badText }, t('loadFailed')) : null,
        children,
        message && message.kind === 'ok' ? h('p', { role: 'status', style: okText }, message.text) : null,
        message && message.kind === 'error' ? h('p', { role: 'status', style: badText }, message.text) : null,
        note ? h('p', { style: muted }, note) : null,
        h('div', { style: actions },
          h('button', {
            type: 'button',
            onClick: onSave,
            disabled: saving || state !== 'ready',
            style: buttonStyle(true, saving || state !== 'ready'),
          }, saving ? t('saving') : t('save')),
          h('button', {
            type: 'button',
            onClick: onReload,
            disabled: saving,
            style: buttonStyle(false, saving),
          }, t('discard'))))
    }

    /* ───────────── 全局人格 ───────────── */

    function PersonaCard(props) {
      const { t, scope } = props
      const [snapshot, setSnapshot] = React.useState(() => (
        scope ? scope.getSnapshot() : { status: 'unavailable', value: undefined, writable: false }
      ))
      const [draft, setDraft] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [saving, setSaving] = React.useState(false)

      React.useEffect(() => {
        if (!scope) return undefined
        setSnapshot(scope.getSnapshot())
        return scope.subscribe(() => setSnapshot(scope.getSnapshot()))
      }, [scope])

      if (!scope) {
        return h('section', { style: card },
          h('h3', { style: title }, t('personaTitle')),
          h('p', { style: warn }, t('noScope')))
      }

      const ready = snapshot.status === 'ready'
      const accepted = ready && typeof snapshot.value?.persona === 'string' ? snapshot.value.persona : ''
      const value = draft === null ? accepted : draft
      const dirty = draft !== null && draft !== accepted
      const writable = ready && snapshot.writable === true
      const disabled = !writable || saving

      async function save() {
        if (!scope || disabled || !dirty) return
        setSaving(true)
        setNotice(null)
        try {
          const acceptedOps = await scope.mutate([{ op: 'set', path: ['persona'], value }])
          if (acceptedOps) {
            setDraft(null)
            setNotice({ kind: 'ok', text: t('saved') })
          } else {
            setNotice({ kind: 'error', text: t('saveFailed') })
          }
        } catch (error) {
          setNotice({ kind: 'error', text: t('saveFailed') })
        } finally {
          setSaving(false)
        }
      }

      if (!ready) {
        return h('section', { style: card },
          h('h3', { style: title }, t('personaTitle')),
          h('p', { style: muted }, t('loading')))
      }

      return h('section', { style: card, 'aria-label': t('personaTitle') },
        h('div', null,
          h('h3', { style: title }, t('personaTitle')),
          h('p', { style: description }, t('personaDescription'))),
        h('textarea', {
          value,
          rows: 14,
          spellCheck: false,
          disabled,
          onChange: (event) => { setNotice(null); setDraft(event.target.value) },
          style: textarea,
        }),
        h('p', { style: muted }, t('personaHint') + ' · ' + t('chars').replace('{count}', String(value.length))),
        value.trim() === '' ? h('p', { style: warn }, t('personaEmpty')) : null,
        !writable ? h('p', { style: warn }, t('readonly')) : null,
        notice ? h('p', { role: 'status', style: notice.kind === 'ok' ? okText : badText }, notice.text) : null,
        h('div', { style: actions },
          h('button', {
            type: 'button',
            onClick: save,
            disabled: disabled || !dirty,
            style: buttonStyle(true, disabled || !dirty),
          }, saving ? t('saving') : t('save')),
          h('button', {
            type: 'button',
            onClick: () => { setDraft(null); setNotice(null) },
            disabled: disabled || !dirty,
            style: buttonStyle(false, disabled || !dirty),
          }, t('discard')),
          h('button', {
            type: 'button',
            onClick: () => { setNotice(null); setDraft(SUGGESTED_PERSONA) },
            disabled,
            style: buttonStyle(false, disabled),
          }, t('fillSuggested'))))
    }

    /* ───────────── dsh-agent-soul ───────────── */

    function SoulCard(props) {
      const { t } = props
      const [state, setState] = React.useState('loading')
      const [config, setConfig] = React.useState({})
      const [draft, setDraft] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [message, setMessage] = React.useState(null)

      const load = React.useCallback(async () => {
        setState('loading')
        setMessage(null)
        try {
          const data = await readJson('/api/unified-settings/soul')
          setConfig((data && data.config) || {})
          setDraft({})
          setState('ready')
        } catch (error) {
          setMessage({ kind: 'error', text: String(error.message || error) })
          setState('error')
        }
      }, [])

      React.useEffect(() => { load() }, [load])

      const view = { ...config, ...draft }
      const dirty = Object.keys(draft).length > 0

      function edit(key, value) {
        setMessage(null)
        setDraft((prev) => ({ ...prev, [key]: value }))
      }

      async function save() {
        if (!dirty) return
        setSaving(true)
        setMessage(null)
        try {
          const data = await readJson('/api/unified-settings/soul', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ patch: draft }),
          })
          setConfig((data && data.config) || {})
          setDraft({})
          setMessage({ kind: 'ok', text: t('saved') })
        } catch (error) {
          setMessage({ kind: 'error', text: String(error.message || error) })
        } finally {
          setSaving(false)
        }
      }

      return h(ConfigCard, {
        t,
        titleText: t('soulTitle'),
        descriptionText: t('soulDescription'),
        state,
        saving,
        message,
        note: t('soulNote'),
        onSave: save,
        onReload: load,
      },
      h(Field, { label: t('soulOwner') },
        h(TextField, { value: view.ownerName, disabled: saving, onChange: (v) => edit('ownerName', v) })),
      h(Field, { label: t('soulRelation') },
        h(TextField, { value: view.relationship, disabled: saving, onChange: (v) => edit('relationship', v) })),
      h(Field, { label: t('soulMood') },
        h(Toggle, { value: view.moodEnabled !== false, disabled: saving, onChange: (v) => edit('moodEnabled', v) })),
      h(Field, { label: t('soulMemory') },
        h(Toggle, { value: view.memoryEnabled !== false, disabled: saving, onChange: (v) => edit('memoryEnabled', v) })),
      h(Field, { label: t('soulDiary') },
        h(Toggle, { value: view.diaryEnabled !== false, disabled: saving, onChange: (v) => edit('diaryEnabled', v) })),
      h(Field, { label: t('soulGlobal') },
        h(Toggle, { value: view.includeGlobal === true, disabled: saving, onChange: (v) => edit('includeGlobal', v) })),
      h(Field, { label: t('soulDiaryModel') },
        h(TextField, {
          value: [view.diarySummarizeProvider, view.diarySummarizeModel].filter(Boolean).join('/'),
          disabled: saving,
          onChange: (v) => {
            const cut = v.indexOf('/')
            if (cut === -1) {
              edit('diarySummarizeProvider', v)
              edit('diarySummarizeModel', '')
            } else {
              edit('diarySummarizeProvider', v.slice(0, cut))
              edit('diarySummarizeModel', v.slice(cut + 1))
            }
          },
        })))
    }

    /* ───────────── dsh-speak-up ───────────── */

    function SpeakCard(props) {
      const { t } = props
      const [state, setState] = React.useState('loading')
      const [config, setConfig] = React.useState({})
      const [draft, setDraft] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [message, setMessage] = React.useState(null)

      const load = React.useCallback(async () => {
        setState('loading')
        setMessage(null)
        try {
          const data = await readJson('/dsh-speak-up/state')
          const cfg = (data && (data.配置 || data.config)) || {}
          setConfig(cfg)
          setDraft({})
          setState('ready')
        } catch (error) {
          setMessage({ kind: 'error', text: String(error.message || error) })
          setState('error')
        }
      }, [])

      React.useEffect(() => { load() }, [load])

      const view = { ...config, ...draft }
      const dirty = Object.keys(draft).length > 0

      function edit(key, value) {
        setMessage(null)
        setDraft((prev) => ({ ...prev, [key]: value }))
      }

      async function save() {
        if (!dirty) return
        setSaving(true)
        setMessage(null)
        try {
          const data = await readJson('/dsh-speak-up/save', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(draft),
          })
          const cfg = (data && (data.配置 || data.config)) || {}
          setConfig(cfg)
          setDraft({})
          setMessage({ kind: 'ok', text: t('saved') })
        } catch (error) {
          setMessage({ kind: 'error', text: String(error.message || error) })
        } finally {
          setSaving(false)
        }
      }

      return h(ConfigCard, {
        t,
        titleText: t('speakTitle'),
        descriptionText: t('speakDescription'),
        state,
        saving,
        message,
        note: t('speakNote'),
        onSave: save,
        onReload: load,
      },
      h(Field, { label: t('speakInterval') },
        h(NumberField, { value: view.间隔分钟, min: 1, disabled: saving, onChange: (v) => edit('间隔分钟', v) })),
      h(Field, { label: t('speakCooldown') },
        h(NumberField, { value: view.搭话冷却分钟, min: 0, disabled: saving, onChange: (v) => edit('搭话冷却分钟', v) })),
      h(Field, { label: t('speakQuietFrom') },
        h(NumberField, { value: view.安静起, min: 0, max: 23, disabled: saving, onChange: (v) => edit('安静起', v) })),
      h(Field, { label: t('speakQuietTo') },
        h(NumberField, { value: view.安静止, min: 0, max: 23, disabled: saving, onChange: (v) => edit('安静止', v) })),
      h(Field, { label: t('speakDry') },
        h(Toggle, { value: view.试运行 === true, disabled: saving, onChange: (v) => edit('试运行', v) })))
    }

    /* ───────────── dsh-douyin-studio ───────────── */

    function DouyinCard(props) {
      const { t } = props
      const [state, setState] = React.useState('loading')
      const [config, setConfig] = React.useState({})
      const [draft, setDraft] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [message, setMessage] = React.useState(null)

      const load = React.useCallback(async () => {
        setState('loading')
        setMessage(null)
        try {
          /* ⚠ 必须用 /settings，不是 /config：后者回的是插件自己的 cordis 配置
           * （cdpPort / perDay / limitsJson 那一套），面板设置是另一份文件。 */
          const data = await readJson('/api/douyin-studio/settings')
          const cfg = (data && data.settings) || {}
          setConfig(cfg)
          setDraft({})
          setState('ready')
        } catch (error) {
          setMessage({ kind: 'error', text: String(error.message || error) })
          setState('error')
        }
      }, [])

      React.useEffect(() => { load() }, [load])

      const view = { ...config, ...draft }
      const dirty = Object.keys(draft).length > 0

      function edit(key, value) {
        setMessage(null)
        setDraft((prev) => ({ ...prev, [key]: value }))
      }

      async function save() {
        if (!dirty) return
        setSaving(true)
        setMessage(null)
        try {
          const data = await readJson('/api/douyin-studio/settings', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ patch: draft }),
          })
          if (data && data.ok === false) throw new Error(data.error || t('saveFailed'))
          const saved = (data && data.settings) || null
          setDraft({})
          if (saved) setConfig(saved)
          setMessage({ kind: 'ok', text: t('saved') })
          if (!saved) await load()
        } catch (error) {
          setMessage({ kind: 'error', text: String(error.message || error) })
        } finally {
          setSaving(false)
        }
      }

      return h(ConfigCard, {
        t,
        titleText: t('douyinTitle'),
        descriptionText: t('douyinDescription'),
        state,
        saving,
        message,
        note: t('douyinNote'),
        onSave: save,
        onReload: load,
      },
      h(Field, { label: t('douyinAutoDm') },
        h(Toggle, { value: view.autoDm === true, disabled: saving, onChange: (v) => edit('autoDm', v) })),
      h(Field, { label: t('douyinAutoComment') },
        h(Toggle, { value: view.autoComment === true, disabled: saving, onChange: (v) => edit('autoComment', v) })),
      h(Field, { label: t('douyinAutoAt') },
        h(Toggle, { value: view.autoAt === true, disabled: saving, onChange: (v) => edit('autoAt', v) })),
      h(Field, { label: t('douyinAutoSpeak') },
        h(Toggle, { value: view.autoSpeakup === true, disabled: saving, onChange: (v) => edit('autoSpeakup', v) })),
      h(Field, { label: t('douyinAutoPublish') },
        h(Toggle, { value: view.autoPublish === true, disabled: saving, onChange: (v) => edit('autoPublish', v) })),
      h(Field, { label: t('douyinSharePerDay') },
        h(NumberField, { value: view.sharePerDay, min: 0, disabled: saving, onChange: (v) => edit('sharePerDay', v) })),
      h(Field, { label: t('douyinScanRounds') },
        h(NumberField, { value: view.scanRounds, min: 0, disabled: saving, onChange: (v) => edit('scanRounds', v) })),
      h(Field, { label: t('douyinPublishMode') },
        h(SelectField, {
          value: view.publishMode,
          disabled: saving,
          options: [{ value: 'draft', label: 'draft（只存草稿）' }, { value: 'now', label: 'now（直接发）' }],
          onChange: (v) => edit('publishMode', v),
        })),
      h(Field, { label: t('douyinPublishWho') },
        h(SelectField, {
          value: view.publishWho,
          disabled: saving,
          options: [
            { value: 'private', label: 'private（仅自己可见）' },
            { value: 'friend', label: 'friend（好友可见）' },
            { value: 'public', label: 'public（公开）' },
          ],
          onChange: (v) => edit('publishWho', v),
        })))
    }

    /* ───────────── 只有入口的两张卡 ───────────── */

    function HubCard(props) {
      const { t, name, note, where } = props
      return h('section', { style: card, 'aria-label': name },
        h('h3', { style: title }, name),
        h('p', { style: description }, t(note)),
        h('div', { style: fieldRow },
          h('span', { style: fieldLabel }, t('whereLabel')),
          h('span', { style: { ...muted, wordBreak: 'break-word' } }, t(where))))
    }

    function UnifiedPanel(props) {
      const t = typeof props.t === 'function' ? props.t : (k) => k
      if (props.view === 'summary') {
        return h('span', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 12 } }, t('summary'))
      }
      return h('div', { style: page },
        h('section', { style: card },
          h('h2', { style: { ...title, fontSize: 16 } }, t('title')),
          h('p', { style: description }, t('description'))),
        h(SoulCard, { t }),
        h(PersonaCard, { t, scope: props.personaScope }),
        h(SpeakCard, { t }),
        h(DouyinCard, { t }),
        h(HubCard, { t, name: 'dsh-meme', note: 'memeNote', where: 'whereMeme' }),
        h(HubCard, { t, name: 'dsh-emoji', note: 'emojiNote', where: 'whereEmoji' }))
    }

    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        ctx.effect(() => {
          const disposers = [
            ctx.locale.register(NS, 'zh', zh),
            ctx.locale.register(NS, 'en', en),
          ]
          return () => { for (const dispose of disposers) dispose() }
        })
        let personaScope
        try {
          personaScope = ctx.configForms.get('global-persona')
        } catch (error) {
          personaScope = undefined
        }
        ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({
          name: 'plugins.bundle.config',
          key: 'dsh-unified-settings',
          locale: NS,
          inject: () => ({ personaScope }),
        }, UnifiedPanel))
      },
    }
  },
})
