# M1 Implementation

M1 establishes the executable architecture boundary before AI networking is added.

## Delivered

- Vue 3 + TypeScript + Vite web shell prepared for Tauri 2.
- Generic `GameModule`, `GameRules`, `GameActionCodec`, `GameAiAdapter` contracts.
- `GameRegistry` and game-agnostic `MatchRuntime`.
- Provider-independent AI turn contract (no network calls yet).
- First module: `dou-shou-qi/classic-v1`.
- Dou Shou Qi initial state, legal action generation, captures, rivers, tiger/lion jumps, traps, dens, terminal outcomes and repetition state.
- Game-specific UI, theme, animation and asset folders under `src/games/dou-shou-qi/ui/`.
- Non-interactive M1 board preview: humans have no direct piece controls.
- Unit-test specifications for module registration and core Dou Shou Qi rules.

## Architectural acceptance condition

Adding a future `gomoku` module must not require changes to `src/core/match`, `src/core/ai` or `src/core/game` contracts unless a genuinely game-independent capability is missing.

## Next (M2)

- AI Provider abstraction and OpenAI-compatible adapter.
- Localhost/LAN provider configuration.
- AI turn orchestration, structured response parsing, timeout and illegal-action retries.
- Commander message queue and personality prompt composition.
- Drive `MatchRuntime.dispatch()` exclusively from AI responses in the playable client.
