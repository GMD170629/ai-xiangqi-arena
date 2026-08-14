<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from 'vue'
import { createM2Session } from './bootstrap/m2'
import { builtinPersonalities, resolvePersonality } from './core/personality/profiles'
import type { ProviderConfig } from './core/provider/types'
import type { DouShouQiSide } from './games/dou-shou-qi/domain/types'

let session = createM2Session()
const snapshot = shallowRef(session.match.snapshot())
const boardComponent = session.ui.boardComponent
const running = ref(false)
const thinkingSeat = ref<DouShouQiSide | null>(null)
const commanderSeat = ref<DouShouQiSide>('blue')
const commanderText = ref('')
const errorMessage = ref('')
const connectionStatus = reactive<Record<DouShouQiSide, string>>({ blue: '', red: '' })
const logs = ref<Array<{ seat: DouShouQiSide; action: string; message: string; commandResponse?: string; latencyMs: number }>>([])

const configs = reactive<Record<DouShouQiSide, ProviderConfig>>({
  blue: { id: 'blue-provider', name: 'Blue AI', baseUrl: 'http://127.0.0.1:1234/v1', model: '', apiKey: '', timeoutMs: 60000 },
  red: { id: 'red-provider', name: 'Red AI', baseUrl: 'http://127.0.0.1:11434/v1', model: '', apiKey: '', timeoutMs: 60000 }
})
const personalityIds = reactive<Record<DouShouQiSide, string>>({ blue: 'veteran-partner', red: 'aggressive-challenger' })
const legalActionCount = computed(() => session.match.legalActions().length)

function configureAgents() {
  for (const seat of ['blue', 'red'] as const) {
    if (!configs[seat].baseUrl.trim() || !configs[seat].model.trim()) throw new Error(`${seat.toUpperCase()}_PROVIDER_NOT_CONFIGURED`)
    session.controller.configureSeat(seat, { provider: { ...configs[seat] }, personality: resolvePersonality(personalityIds[seat]) })
  }
}

async function testProvider(seat: DouShouQiSide) {
  connectionStatus[seat] = 'testing…'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const result = await session.provider.testConnection(configs[seat], controller.signal)
    connectionStatus[seat] = result.ok ? 'connected' : `failed: ${result.message}`
  } finally {
    clearTimeout(timeout)
  }
}

function sendCommanderMessage() {
  if (!commanderText.value.trim()) return
  session.controller.commander.send(commanderSeat.value, commanderText.value)
  commanderText.value = ''
}

function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)) }

async function startMatch() {
  if (running.value || snapshot.value.status === 'finished') return
  errorMessage.value = ''
  try { configureAgents() } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : String(error)
    return
  }
  running.value = true
  while (running.value && snapshot.value.status === 'active') {
    try {
      const seat = snapshot.value.currentSeat
      thinkingSeat.value = seat
      const result = await session.controller.playNextTurn()
      logs.value.unshift({
        seat,
        action: session.module.actionCodec.encode(result.action),
        message: result.response.message,
        commandResponse: result.response.commandResponse,
        latencyMs: result.latencyMs
      })
      snapshot.value = result.snapshot
      thinkingSeat.value = null
      if (snapshot.value.status === 'active') await sleep(500)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
      running.value = false
      thinkingSeat.value = null
    }
  }
  running.value = false
}

function pauseMatch() { running.value = false }

function resetMatch() {
  running.value = false
  thinkingSeat.value = null
  session = createM2Session()
  snapshot.value = session.match.snapshot()
  logs.value = []
  errorMessage.value = ''
}
</script>

<template>
  <main class="app-shell">
    <section class="board-area">
      <div class="board-frame" :class="{ thinking: thinkingSeat }">
        <component :is="boardComponent" :state="snapshot.state" />
      </div>
      <div class="match-meta">
        <span>当前行动：<strong>{{ snapshot.currentSeat }}</strong></span>
        <span>合法动作：<strong>{{ legalActionCount }}</strong></span>
        <span v-if="thinkingSeat" class="thinking-pill">{{ thinkingSeat }} AI 正在思考…</span>
        <span v-if="snapshot.outcome">{{ snapshot.outcome.type }} · {{ snapshot.outcome.reason }}</span>
      </div>
    </section>

    <aside class="panel">
      <p class="eyebrow">M2 · AI MATCH</p>
      <h1>AI Board Arena</h1>
      <p class="lead">AI 才是棋手。你只能影响它，不能替它走棋。</p>

      <section class="providers">
        <div v-for="seat in (['blue','red'] as const)" :key="seat" class="provider-card">
          <div class="provider-title"><strong>{{ seat.toUpperCase() }} AI</strong><span>{{ connectionStatus[seat] }}</span></div>
          <input v-model="configs[seat].baseUrl" placeholder="Base URL，例如 http://127.0.0.1:11434/v1" />
          <input v-model="configs[seat].model" placeholder="Model，例如 qwen3:14b" />
          <input v-model="configs[seat].apiKey" type="password" placeholder="API Key（本地模型可留空）" />
          <select v-model="personalityIds[seat]">
            <option v-for="personality in builtinPersonalities" :key="personality.id" :value="personality.id">{{ personality.name }}</option>
          </select>
          <button class="ghost" :disabled="running" @click="testProvider(seat)">测试连接</button>
        </div>
      </section>

      <section class="commander-card">
        <div class="commander-head">
          <strong>Commander</strong>
          <select v-model="commanderSeat" :disabled="running && false"><option value="blue">指挥 Blue</option><option value="red">指挥 Red</option></select>
        </div>
        <textarea v-model="commanderText" rows="3" placeholder="例如：别急着冲兽穴，我觉得右侧的鼠可以制造点麻烦。" @keydown.ctrl.enter.prevent="sendCommanderMessage" />
        <button class="ghost" @click="sendCommanderMessage">发送给己方 AI</button>
        <small>消息只进入该 AI 的下一次决策上下文，不会直接转换成棋步。</small>
      </section>

      <div class="actions">
        <button class="primary" :disabled="running || snapshot.status === 'finished'" @click="startMatch">开始 / 继续 AI 对局</button>
        <button class="ghost" :disabled="!running" @click="pauseMatch">暂停</button>
        <button class="ghost" @click="resetMatch">重新开始</button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <section class="ai-log">
        <article v-for="(item, index) in logs.slice(0, 8)" :key="`${index}-${item.action}`">
          <div><strong>{{ item.seat }}</strong><code>{{ item.action }}</code><span>{{ item.latencyMs }}ms</span></div>
          <p>{{ item.message }}</p>
          <blockquote v-if="item.commandResponse">{{ item.commandResponse }}</blockquote>
        </article>
        <p v-if="!logs.length" class="empty">开始后，这里会显示 AI 的公开决策说明和对 Commander 的回应。</p>
      </section>
    </aside>
  </main>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: grid; grid-template-columns: minmax(430px, 1.08fr) minmax(380px, .92fr); gap: 34px; align-items: start; max-width: 1280px; margin: 0 auto; padding: 30px; }
.board-area { position: sticky; top: 24px; display: grid; place-items: center; gap: 14px; }
.board-frame { width: 100%; display: grid; place-items: center; transition: transform .2s ease, filter .2s ease; }
.board-frame.thinking { filter: saturate(1.04); }
.panel { max-width: 520px; width: 100%; padding-bottom: 40px; }
.eyebrow { font-size: 12px; letter-spacing: .18em; font-weight: 800; opacity: .5; }
h1 { margin: 8px 0 10px; font-size: clamp(38px, 5vw, 62px); line-height: .96; }
.lead { font-size: 17px; line-height: 1.65; opacity: .72; }
.providers { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.provider-card, .commander-card, .ai-log { background: rgba(255,255,255,.68); border: 1px solid rgba(72,54,34,.12); border-radius: 18px; padding: 14px; backdrop-filter: blur(12px); }
.provider-title, .commander-head, .match-meta, .ai-log article > div { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.provider-title span { font-size: 11px; opacity: .6; }
input, select, textarea { width: 100%; box-sizing: border-box; border: 1px solid rgba(56,42,28,.16); border-radius: 10px; padding: 10px 11px; background: rgba(255,255,255,.72); margin-top: 8px; font: inherit; }
textarea { resize: vertical; }
.commander-card { margin-top: 10px; }
.commander-head select { width: auto; margin: 0; }
.commander-card small { display: block; margin-top: 8px; opacity: .55; line-height: 1.45; }
button { border: 0; border-radius: 11px; padding: 10px 13px; font: inherit; font-weight: 700; cursor: pointer; }
button:disabled { opacity: .42; cursor: default; }
.primary { background: #27231f; color: white; }
.ghost { background: rgba(39,35,31,.08); margin-top: 8px; }
.actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.match-meta { width: min(100%, 620px); font-size: 13px; opacity: .72; flex-wrap: wrap; }
.thinking-pill { animation: pulse 1.1s ease-in-out infinite; }
.ai-log { margin-top: 12px; display: grid; gap: 8px; }
.ai-log article { border-bottom: 1px solid rgba(50,40,30,.08); padding-bottom: 9px; }
.ai-log article:last-child { border-bottom: 0; }
.ai-log article div span, .ai-log code { font-size: 11px; opacity: .55; }
.ai-log p { margin: 6px 0; line-height: 1.45; }
.ai-log blockquote { margin: 6px 0 0; padding-left: 10px; border-left: 2px solid rgba(50,40,30,.2); opacity: .72; }
.empty { opacity: .5; font-size: 13px; }
.error { color: #a02b24; font-size: 13px; }
@keyframes pulse { 50% { opacity: .4; } }
@media (max-width: 920px) { .app-shell { grid-template-columns: 1fr; padding: 18px; } .board-area { position: static; } .panel { max-width: none; } }
@media (max-width: 560px) { .providers { grid-template-columns: 1fr; } }
</style>
