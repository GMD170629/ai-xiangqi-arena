<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { createM1Preview } from './bootstrap/games'

const preview = createM1Preview()
const snapshot = shallowRef(preview.match.snapshot())
const boardComponent = preview.ui.boardComponent
const legalActionCount = computed(() => preview.match.legalActions().length)
</script>

<template>
  <main class="app-shell">
    <section class="board-area">
      <component :is="boardComponent" :state="snapshot.state" />
    </section>
    <aside class="panel">
      <p class="eyebrow">M1 · PLATFORM CORE</p>
      <h1>AI Board Arena</h1>
      <p class="lead">棋类只是模块。真正的玩家是 AI，人类只通过语言影响 AI。</p>
      <div class="status-card">
        <span>当前 Game Module</span>
        <strong>{{ preview.module.manifest.name }}</strong>
        <code>{{ preview.module.manifest.id }} / {{ preview.module.manifest.rulesVersion }}</code>
      </div>
      <div class="stats">
        <div><span>当前行动方</span><strong>{{ snapshot.currentSeat }}</strong></div>
        <div><span>合法动作</span><strong>{{ legalActionCount }}</strong></div>
        <div><span>状态</span><strong>{{ snapshot.status }}</strong></div>
      </div>
      <div class="commander-placeholder">
        <span>Commander</span>
        <p>AI Provider 尚未接入。M2 会在这里加入“和己方 AI 说话”，但不会提供任何直接移动棋子的操作。</p>
      </div>
    </aside>
  </main>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: grid; grid-template-columns: minmax(420px, 1.15fr) minmax(320px, .85fr); gap: 42px; align-items: center; max-width: 1180px; margin: 0 auto; padding: 36px; }
.board-area { display: grid; place-items: center; }
.panel { max-width: 460px; }
.eyebrow { font-size: 12px; letter-spacing: .18em; font-weight: 800; opacity: .5; }
h1 { margin: 8px 0 12px; font-size: clamp(38px, 5vw, 68px); line-height: .96; }
.lead { font-size: 18px; line-height: 1.7; opacity: .72; }
.status-card, .commander-placeholder { background: rgba(255,255,255,.62); border: 1px solid rgba(72,54,34,.12); border-radius: 18px; padding: 18px; margin-top: 22px; backdrop-filter: blur(12px); }
.status-card { display: grid; gap: 6px; }
.status-card span, .stats span, .commander-placeholder span { font-size: 12px; opacity: .55; }
.status-card strong { font-size: 22px; }
.status-card code { font-size: 12px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
.stats div { background: rgba(34,34,34,.06); border-radius: 14px; padding: 13px; display: grid; gap: 4px; }
.stats strong { font-size: 18px; }
.commander-placeholder p { margin: 7px 0 0; line-height: 1.55; opacity: .7; }
@media (max-width: 840px) { .app-shell { grid-template-columns: 1fr; padding: 20px; } .panel { max-width: none; } }
</style>
