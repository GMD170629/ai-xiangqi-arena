<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { createM3Session, personalityRepository, providerRepository, vault } from './bootstrap/m3'
import type { ProviderProfile } from './core/provider/provider-repository'
import type { PersonalityProfile } from './core/personality/profiles'
import { readSetting, writeSetting } from './core/persistence/settings-store'
import { isTauriRuntime } from './core/platform/runtime'
import type { DouShouQiSide } from './games/dou-shou-qi/domain/types'

type Screen = 'home' | 'providers' | 'setup' | 'match'
interface MatchSetup { blueProviderId: string; redProviderId: string; bluePersonalityId: string; redPersonalityId: string; commanderSeat: DouShouQiSide }
interface TimelineItem { seat: DouShouQiSide; action: string; message: string; commandResponse?: string; latencyMs: number }

const screen = ref<Screen>('home')
const providers = ref<ProviderProfile[]>([])
const personalities = ref<PersonalityProfile[]>([])
const vaultPassword = ref('')
const vaultMessage = ref('')
const errorMessage = ref('')
const discoveredModels = ref<string[]>([])
const providerMessage = ref('')
const providerForm = reactive({ id: '', name: '', baseUrl: 'http://127.0.0.1:11434/v1', model: '', apiKey: '', timeoutMs: 60000 })
const customPersonality = reactive({ name: '', description: '', prompt: '' })
const setup = reactive<MatchSetup>({ blueProviderId: '', redProviderId: '', bluePersonalityId: 'veteran-partner', redPersonalityId: 'aggressive-challenger', commanderSeat: 'blue' })

let session = createM3Session()
const snapshot = shallowRef(session.match.snapshot())
const boardComponent = session.ui.boardComponent
const running = ref(false)
const thinkingSeat = ref<DouShouQiSide | null>(null)
const commanderText = ref('')
const timeline = ref<TimelineItem[]>([])

const isDesktop = isTauriRuntime()
const selectedCommanderName = computed(() => setup.commanderSeat === 'blue' ? 'Blue' : 'Red')
const canCreateMatch = computed(() => Boolean(setup.blueProviderId && setup.redProviderId && setup.bluePersonalityId && setup.redPersonalityId))
const outcomeTitle = computed(() => {
  const outcome = snapshot.value.outcome
  if (!outcome) return ''
  return outcome.type === 'draw' ? '平局' : `${outcome.winner.toUpperCase()} 获胜`
})

async function refreshData() {
  providers.value = await providerRepository.list()
  personalities.value = await personalityRepository.all()
  if (!setup.blueProviderId && providers.value[0]) setup.blueProviderId = providers.value[0].id
  if (!setup.redProviderId && providers.value[1]) setup.redProviderId = providers.value[1].id
  else if (!setup.redProviderId && providers.value[0]) setup.redProviderId = providers.value[0].id
}

onMounted(async () => {
  const saved = await readSetting<MatchSetup | null>('last-match-setup', null)
  if (saved) Object.assign(setup, saved)
  await refreshData()
})

async function unlockVault() {
  errorMessage.value = ''
  try {
    await vault.unlock(vaultPassword.value)
    vaultPassword.value = ''
    vaultMessage.value = '密钥库已解锁'
  } catch (error) { vaultMessage.value = error instanceof Error ? error.message : String(error) }
}

function newProvider() {
  Object.assign(providerForm, { id: `provider_${Date.now()}`, name: '', baseUrl: 'http://127.0.0.1:11434/v1', model: '', apiKey: '', timeoutMs: 60000 })
  discoveredModels.value = []
  providerMessage.value = ''
}

function editProvider(profile: ProviderProfile) {
  Object.assign(providerForm, { id: profile.id, name: profile.name, baseUrl: profile.baseUrl, model: profile.model, apiKey: '', timeoutMs: profile.timeoutMs ?? 60000 })
  discoveredModels.value = []
  providerMessage.value = profile.hasApiKey ? '已有安全保存的 API Key；留空将保持不变。' : ''
}

async function saveProvider() {
  if (!providerForm.name.trim() || !providerForm.baseUrl.trim()) { providerMessage.value = '请填写名称和 Base URL'; return }
  if (providerForm.apiKey && isDesktop && !vault.unlocked) { providerMessage.value = '保存 API Key 前请先解锁密钥库'; return }
  const previous = providers.value.find((item) => item.id === providerForm.id)
  await providerRepository.save({
    id: providerForm.id || `provider_${Date.now()}`,
    name: providerForm.name.trim(),
    baseUrl: providerForm.baseUrl.trim().replace(/\/+$/, ''),
    model: providerForm.model.trim(),
    timeoutMs: providerForm.timeoutMs,
    hasApiKey: previous?.hasApiKey
  }, providerForm.apiKey ? providerForm.apiKey : undefined)
  providerForm.apiKey = ''
  providerMessage.value = '已保存'
  await refreshData()
}

async function discoverModels() {
  providerMessage.value = '正在读取模型…'
  try {
    const models = await session.provider.listModels?.({
      id: providerForm.id || 'preview', name: providerForm.name || 'preview', baseUrl: providerForm.baseUrl,
      model: providerForm.model, apiKey: providerForm.apiKey || undefined, timeoutMs: providerForm.timeoutMs
    })
    discoveredModels.value = models ?? []
    providerMessage.value = discoveredModels.value.length ? `发现 ${discoveredModels.value.length} 个模型` : '连接成功，但没有返回模型列表'
  } catch (error) { providerMessage.value = error instanceof Error ? error.message : String(error) }
}

async function removeProvider(id: string) {
  await providerRepository.remove(id)
  await refreshData()
}

async function saveCustomPersonality() {
  if (!customPersonality.name.trim() || !customPersonality.prompt.trim()) return
  await personalityRepository.save({
    id: `custom_${Date.now()}`,
    name: customPersonality.name.trim(),
    description: customPersonality.description.trim() || '自定义 AI 人格',
    prompt: customPersonality.prompt.trim()
  })
  Object.assign(customPersonality, { name: '', description: '', prompt: '' })
  await refreshData()
}

function personality(id: string): PersonalityProfile {
  const found = personalities.value.find((item) => item.id === id)
  if (!found) throw new Error(`PERSONALITY_NOT_FOUND:${id}`)
  return found
}

async function createMatch() {
  errorMessage.value = ''
  if (!canCreateMatch.value) { errorMessage.value = '请先为双方选择 AI'; return }
  const selected = providers.value.filter((item) => [setup.blueProviderId, setup.redProviderId].includes(item.id))
  if (isDesktop && selected.some((item) => item.hasApiKey) && !vault.unlocked) {
    errorMessage.value = '选中的 Provider 使用了安全保存的 API Key，请先到 AI 管理解锁密钥库。'
    return
  }
  try {
    const blue = await providerRepository.materialize(setup.blueProviderId)
    const red = await providerRepository.materialize(setup.redProviderId)
    if (!blue.model || !red.model) throw new Error('双方 Provider 都必须选择模型')
    session = createM3Session()
    session.controller.configureSeat('blue', { provider: blue, personality: personality(setup.bluePersonalityId) })
    session.controller.configureSeat('red', { provider: red, personality: personality(setup.redPersonalityId) })
    snapshot.value = session.match.snapshot()
    timeline.value = []
    await writeSetting('last-match-setup', { ...setup })
    screen.value = 'match'
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : String(error) }
}

function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)) }

async function runMatch() {
  if (running.value || snapshot.value.status === 'finished') return
  running.value = true
  errorMessage.value = ''
  while (running.value && snapshot.value.status === 'active') {
    const seat = snapshot.value.currentSeat
    thinkingSeat.value = seat
    try {
      const result = await session.controller.playNextTurn()
      timeline.value.unshift({ seat, action: session.module.actionCodec.encode(result.action), message: result.response.message, commandResponse: result.response.commandResponse, latencyMs: result.latencyMs })
      snapshot.value = result.snapshot
      thinkingSeat.value = null
      if (snapshot.value.status === 'active') await sleep(450)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
      running.value = false
      thinkingSeat.value = null
    }
  }
  running.value = false
}

function pauseMatch() { running.value = false }

function sendCommanderMessage() {
  const text = commanderText.value.trim()
  if (!text || snapshot.value.status === 'finished') return
  session.controller.commander.send(setup.commanderSeat, text)
  commanderText.value = ''
}

function resign() {
  if (snapshot.value.status === 'finished') return
  running.value = false
  const winner: DouShouQiSide = setup.commanderSeat === 'blue' ? 'red' : 'blue'
  snapshot.value = session.match.finish({ type: 'win', winner, reason: `${setup.commanderSeat} resigned` })
}

function leaveMatch() {
  running.value = false
  thinkingSeat.value = null
  screen.value = 'setup'
}
</script>

<template>
  <main class="app">
    <header class="topbar">
      <button class="brand" @click="screen = 'home'">AI Board Arena</button>
      <nav><button @click="screen = 'setup'">新对局</button><button @click="screen = 'providers'">AI 管理</button></nav>
    </header>

    <section v-if="screen === 'home'" class="landing page">
      <p class="eyebrow">M3 · DESKTOP PRODUCT</p>
      <h1>你不能替 AI 走棋。<br>你只能影响它。</h1>
      <p>斗兽棋只是第一张棋盘。真正的游戏，是两个 AI 的自主对弈，以及人类如何改变其中一个 AI 的判断。</p>
      <div class="hero-actions"><button class="primary" @click="screen = 'setup'">创建对局</button><button class="secondary" @click="screen = 'providers'">管理我的 AI</button></div>
      <div class="feature-row"><span>AI vs AI</span><span>Commander</span><span>Personality</span><span>Bring Your Own AI</span></div>
    </section>

    <section v-else-if="screen === 'providers'" class="page providers-page">
      <div class="page-head"><div><p class="eyebrow">AI LIBRARY</p><h2>管理你的 AI</h2><p>Provider 普通配置持久保存；API Key 在桌面端使用 Stronghold 加密保存。</p></div><button class="primary" @click="newProvider">添加 AI</button></div>
      <div v-if="isDesktop" class="vault-card"><div><strong>Secret Vault</strong><span>{{ vault.unlocked ? '已解锁' : '已锁定' }}</span></div><input v-model="vaultPassword" type="password" placeholder="输入本机密钥库密码（每次启动需解锁）"><button class="secondary" @click="unlockVault">解锁</button><small>{{ vaultMessage }}</small></div>
      <div class="provider-layout">
        <div class="provider-list"><article v-for="item in providers" :key="item.id"><div><strong>{{ item.name }}</strong><small>{{ item.baseUrl }}</small><code>{{ item.model || '未选择模型' }}</code></div><div class="row"><button class="secondary" @click="editProvider(item)">编辑</button><button class="danger" @click="removeProvider(item.id)">删除</button></div></article><p v-if="!providers.length" class="empty">还没有 AI。可以添加 Ollama、LM Studio 或任意 OpenAI-Compatible 服务。</p></div>
        <form class="editor" @submit.prevent="saveProvider"><h3>{{ providerForm.id ? 'Provider 设置' : '添加 Provider' }}</h3><label>名称<input v-model="providerForm.name" placeholder="例如：我的 Qwen"></label><label>Base URL<input v-model="providerForm.baseUrl" placeholder="http://127.0.0.1:11434/v1"></label><label>Model<input v-model="providerForm.model" list="model-list" placeholder="选择或输入模型"></label><datalist id="model-list"><option v-for="model in discoveredModels" :key="model" :value="model" /></datalist><div class="row"><button type="button" class="secondary" @click="discoverModels">发现模型</button><span>{{ providerMessage }}</span></div><label>API Key<input v-model="providerForm.apiKey" type="password" placeholder="本地 AI 通常可留空"></label><label>超时（ms）<input v-model.number="providerForm.timeoutMs" type="number" min="5000"></label><button class="primary" type="submit">保存 Provider</button></form>
      </div>
    </section>

    <section v-else-if="screen === 'setup'" class="page setup-page">
      <div class="page-head"><div><p class="eyebrow">NEW MATCH</p><h2>创建斗兽棋对局</h2><p>双方 AI 可以使用不同 Provider、模型和人格。你只选择要指挥哪一方。</p></div></div>
      <div class="duel-setup">
        <article v-for="seat in (['blue','red'] as const)" :key="seat" class="seat-card"><span class="seat-label">{{ seat.toUpperCase() }}</span><label>AI<select v-model="setup[seat === 'blue' ? 'blueProviderId' : 'redProviderId']"><option value="">选择 Provider</option><option v-for="item in providers" :key="item.id" :value="item.id">{{ item.name }} · {{ item.model || '未选模型' }}</option></select></label><label>人格<select v-model="setup[seat === 'blue' ? 'bluePersonalityId' : 'redPersonalityId']"><option v-for="item in personalities" :key="item.id" :value="item.id">{{ item.name }}</option></select></label></article>
      </div>
      <div class="commander-choice"><strong>你要影响谁？</strong><label><input v-model="setup.commanderSeat" type="radio" value="blue"> Blue AI</label><label><input v-model="setup.commanderSeat" type="radio" value="red"> Red AI</label><small>你无法操作棋子，只能向这一方发送自然语言建议。</small></div>
      <details class="personality-maker"><summary>创建自定义人格</summary><input v-model="customPersonality.name" placeholder="人格名称"><input v-model="customPersonality.description" placeholder="一句话描述"><textarea v-model="customPersonality.prompt" rows="4" placeholder="描述它如何交流、如何看待风险、如何回应 Commander。"></textarea><button class="secondary" @click="saveCustomPersonality">保存人格</button></details>
      <p v-if="!providers.length" class="error">请先到“AI 管理”添加至少一个 Provider。</p><p v-if="errorMessage" class="error">{{ errorMessage }}</p><button class="primary big" :disabled="!canCreateMatch" @click="createMatch">进入比赛场</button>
    </section>

    <section v-else class="arena page">
      <div class="arena-main"><div class="arena-head"><button class="secondary" @click="leaveMatch">← 返回</button><div><strong>斗兽棋 · classic-v1</strong><span>Commander: {{ selectedCommanderName }}</span></div><span v-if="thinkingSeat" class="thinking">{{ thinkingSeat.toUpperCase() }} 正在思考…</span></div><div class="board-wrap" :class="{ 'is-thinking': thinkingSeat }"><component :is="boardComponent" :state="snapshot.state" /></div><div class="match-controls"><button class="primary" :disabled="running || snapshot.status === 'finished'" @click="runMatch">{{ timeline.length ? '继续' : '开始' }}</button><button class="secondary" :disabled="!running" @click="pauseMatch">暂停</button><button class="danger" :disabled="snapshot.status === 'finished'" @click="resign">认输</button></div></div>
      <aside class="side-panel"><div v-if="snapshot.status === 'finished'" class="result-card"><p>比赛结束</p><h2>{{ outcomeTitle }}</h2><span>{{ snapshot.outcome?.reason }}</span><button class="primary" @click="leaveMatch">再来一局</button></div><div class="commander-box"><strong>对 {{ selectedCommanderName }} AI 说</strong><textarea v-model="commanderText" rows="3" placeholder="例如：我觉得右路有机会，但别太冒险。" @keydown.ctrl.enter.prevent="sendCommanderMessage"></textarea><button class="primary" :disabled="snapshot.status === 'finished'" @click="sendCommanderMessage">发送指令</button><small>Ctrl + Enter 发送。它可以听，也可以不听。</small></div><p v-if="errorMessage" class="error-box">{{ errorMessage }}<br><button class="secondary" @click="runMatch">重试当前回合</button></p><div class="timeline"><h3>对局时间线</h3><article v-for="(item,index) in timeline" :key="`${index}-${item.action}`"><header><strong>{{ item.seat.toUpperCase() }}</strong><code>{{ item.action }}</code><span>{{ item.latencyMs }}ms</span></header><p>{{ item.message }}</p><blockquote v-if="item.commandResponse">{{ item.commandResponse }}</blockquote></article><p v-if="!timeline.length" class="empty">比赛开始后，AI 的公开说明与 Commander 回应会出现在这里。</p></div></aside>
    </section>
  </main>
</template>

<style scoped>
:global(*){box-sizing:border-box}:global(body){margin:0;background:#f3efe7;color:#27231f;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.app{min-height:100vh}.topbar{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:1px solid rgba(50,40,30,.09);background:rgba(243,239,231,.88);backdrop-filter:blur(16px);position:sticky;top:0;z-index:10}.brand{font-size:16px;font-weight:850;background:none;border:0}.topbar nav{display:flex;gap:4px}.topbar nav button{background:none;border:0;padding:9px 12px}.page{max-width:1240px;margin:auto;padding:44px 28px}.landing{padding-top:10vh}.eyebrow{font-size:11px;letter-spacing:.2em;font-weight:800;opacity:.5}.landing h1{font-size:clamp(46px,7vw,88px);line-height:.98;letter-spacing:-.04em;margin:14px 0 22px;max-width:980px}.landing>p:not(.eyebrow){font-size:20px;line-height:1.7;max-width:760px;opacity:.68}.hero-actions,.row,.match-controls{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.hero-actions{margin-top:30px}.feature-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:60px}.feature-row span{padding:10px 14px;background:rgba(255,255,255,.55);border-radius:999px}.primary,.secondary,.danger{border:0;border-radius:11px;padding:10px 15px;font:inherit;font-weight:750;cursor:pointer}.primary{background:#27231f;color:#fff}.secondary{background:rgba(39,35,31,.08)}.danger{background:#f2dddd;color:#8b2e2a}.big{font-size:17px;padding:14px 24px}.primary:disabled,.secondary:disabled,.danger:disabled{opacity:.38;cursor:default}.page-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:24px}.page-head h2{font-size:42px;margin:6px 0}.page-head p{margin:0;opacity:.6}.vault-card,.editor,.provider-list article,.seat-card,.commander-choice,.personality-maker,.commander-box,.timeline,.result-card{background:rgba(255,255,255,.62);border:1px solid rgba(50,40,30,.1);border-radius:18px;padding:17px}.vault-card{display:grid;grid-template-columns:1fr minmax(240px,420px) auto;gap:10px;align-items:center;margin-bottom:14px}.vault-card>div{display:grid}.vault-card span,.vault-card small{font-size:12px;opacity:.58}.provider-layout{display:grid;grid-template-columns:1fr 1fr;gap:14px}.provider-list{display:grid;gap:9px;align-content:start}.provider-list article{display:flex;justify-content:space-between;gap:12px}.provider-list article>div:first-child{display:grid;gap:4px}.provider-list small,.provider-list code{opacity:.6}.editor label,.seat-card label{display:grid;gap:5px;margin:10px 0;font-size:13px;font-weight:650}input,select,textarea{width:100%;border:1px solid rgba(50,40,30,.14);border-radius:10px;padding:10px 11px;background:rgba(255,255,255,.76);font:inherit}textarea{resize:vertical}.duel-setup{display:grid;grid-template-columns:1fr 1fr;gap:14px}.seat-label{font-size:12px;font-weight:850;letter-spacing:.16em;opacity:.5}.commander-choice{margin-top:14px;display:flex;gap:16px;align-items:center;flex-wrap:wrap}.commander-choice label{display:flex;align-items:center;gap:6px}.commander-choice input{width:auto}.commander-choice small{width:100%;opacity:.58}.personality-maker{margin:14px 0}.personality-maker>*:not(summary){margin-top:8px}.arena{display:grid;grid-template-columns:minmax(560px,1.2fr) minmax(360px,.8fr);gap:24px;max-width:1380px}.arena-main{position:sticky;top:84px;align-self:start}.arena-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.arena-head>div{display:grid;text-align:center}.arena-head span{font-size:12px;opacity:.55}.thinking{animation:pulse 1s infinite}.board-wrap{display:grid;place-items:center;transition:filter .2s}.board-wrap.is-thinking{filter:saturate(1.06)}.match-controls{justify-content:center;margin-top:14px}.side-panel{display:grid;gap:12px;align-content:start}.commander-box{display:grid;gap:9px}.commander-box small{opacity:.52}.timeline{display:grid;gap:8px;max-height:58vh;overflow:auto}.timeline h3{margin:0 0 4px}.timeline article{border-top:1px solid rgba(50,40,30,.08);padding-top:10px}.timeline header{display:flex;gap:8px;align-items:center}.timeline header span{margin-left:auto;font-size:11px;opacity:.48}.timeline p{line-height:1.5;margin:7px 0}.timeline blockquote{margin:7px 0;padding-left:10px;border-left:2px solid rgba(50,40,30,.2);opacity:.7}.result-card{text-align:center}.result-card h2{font-size:34px;margin:5px}.result-card span{display:block;opacity:.6;margin-bottom:12px}.error,.error-box{color:#922f2a}.error-box{background:#f5e1de;border-radius:12px;padding:12px}.empty{opacity:.48;line-height:1.6}@keyframes pulse{50%{opacity:.38}}@media(max-width:960px){.provider-layout,.arena,.duel-setup{grid-template-columns:1fr}.arena-main{position:static}.vault-card{grid-template-columns:1fr}.page{padding:28px 18px}.topbar{padding:0 18px}}
</style>
