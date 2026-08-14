<script setup lang="ts">
import { computed } from 'vue'
import { BLUE_DEN, BLUE_TRAPS, RED_DEN, RED_TRAPS, isRiver, pieceAt, same, square } from '../domain/board'
import type { DouShouQiState, Position } from '../domain/types'
import { PIECE_GLYPH } from './piece-glyphs'
import './theme.css'
import './animations/motion.css'

const props = defineProps<{ state: DouShouQiState }>()

const cells = computed(() => {
  const result: Position[] = []
  for (let row = 8; row >= 0; row -= 1) {
    for (let col = 0; col < 7; col += 1) result.push({ col, row })
  }
  return result
})

function terrain(position: Position): string {
  if (isRiver(position)) return 'river'
  if (same(position, BLUE_DEN) || same(position, RED_DEN)) return 'den'
  if ([...BLUE_TRAPS, ...RED_TRAPS].some((trap) => same(trap, position))) return 'trap'
  return 'land'
}
</script>

<template>
  <div class="dsq-board" aria-label="斗兽棋棋盘">
    <div v-for="cell in cells" :key="square(cell)" class="dsq-cell" :class="`terrain-${terrain(cell)}`">
      <span class="coordinate">{{ square(cell) }}</span>
      <div v-if="pieceAt(props.state, cell)" class="dsq-piece" :class="`side-${pieceAt(props.state, cell)!.side}`">
        <span class="piece-glyph">{{ PIECE_GLYPH[pieceAt(props.state, cell)!.animal] }}</span>
        <span class="piece-label">{{ pieceAt(props.state, cell)!.animal }}</span>
      </div>
    </div>
  </div>
</template>
