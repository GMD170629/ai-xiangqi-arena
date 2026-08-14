# M2 Implementation

M2 makes the first real AI-vs-AI match loop playable while preserving the platform/game boundary.

## Delivered

- Provider-independent `AiProvider` contract.
- `OpenAiCompatibleProvider` using `/chat/completions` and `/models` under a user-supplied Base URL.
- Localhost / LAN / cloud Provider configuration with optional API Key.
- Built-in AI personalities, independent from game modules and models.
- Seat-scoped `CommanderInbox`; human messages are queued for the selected AI and acknowledged only after a successful turn.
- Versioned AI Turn Protocol `0.2` prompt composition.
- Strict/fenced JSON response parsing.
- Timeout, parse-error, unparseable-action and illegal-action retry loop (max 3 attempts by default).
- `AutoMatchController` that is game-agnostic and drives `MatchRuntime.dispatch()` only after an AI response has been decoded and validated.
- Playable M2 client: configure Blue/Red AI, choose personality, test connection, command either side, start/pause/reset, and observe AI public explanations.
- No direct human piece controls were introduced.

## Security / privacy boundary

- API keys are held in client memory only in M2; they are not committed or written into match logs.
- Provider requests go directly from the client to the configured endpoint.
- OS keychain persistence and a Tauri-native HTTP transport can be added later without changing the Provider contract.

## M2 acceptance condition

A complete Dou Shou Qi match can be advanced exclusively by two configured AI providers. Human input can alter the AI context through Commander messages, but cannot directly create or dispatch a game Action.

## Next

M3 should focus on product-quality match UX: durable local settings, safe secret storage, persistent match/replay records, richer game-specific motion/audio, and stronger provider compatibility diagnostics.
