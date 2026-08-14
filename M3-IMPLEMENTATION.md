# M3 Implementation

M3 turns the M2 engineering panel into the first product-shaped desktop flow.

## Delivered

- Four product states: landing, AI library, match setup and live arena.
- Persistent Provider Library with add/edit/remove.
- OpenAI-Compatible model discovery through `/models`.
- Native Tauri HTTP transport for desktop AI traffic.
- Broad HTTP/HTTPS plugin scope is intentional because Bring Your Own AI requires arbitrary user-configured localhost/LAN/cloud endpoints; the WebView CSP remains restricted and does not load remote scripts or Provider content.
- Tauri Store for non-secret settings.
- Stronghold for encrypted API Key storage.
- Vault password is never persisted; the user unlocks the vault after launch when a saved key is needed.
- Web-only development mode keeps secrets in memory only.
- Persistent custom personalities.
- Persisted last match setup.
- Match setup chooses Blue/Red Provider, model-backed profile, personality and Commander side.
- Live AI-vs-AI arena with pause/resume, retry after provider errors, Commander messaging, AI response timeline, latency display, resignation and settlement.
- Generic `MatchRuntime.finish()` for non-rule outcomes such as resignation; no Dou Shou Qi-specific resignation logic enters Core.
- Restrictive Tauri CSP enabled.

## Security boundary

Provider metadata and secrets intentionally use separate storage paths:

```text
Provider metadata -> Tauri Store
API Key           -> Stronghold
AI HTTP            -> Tauri Rust HTTP Client
WebView            -> restricted CSP
```

Do not collapse these layers for convenience.

## Current product caveats

- The first launch requires the user to choose a Stronghold vault password before saving an API Key. A wrong password cannot unlock an existing vault.
- HTTP plugin URL scope permits arbitrary HTTP/HTTPS because user-configured Provider endpoints are a core requirement. Future hardening may move endpoint allowlisting into a narrower Rust command/state layer.
- Full installer/build verification still requires a machine with Rust/Tauri system dependencies.
- Visual game feel remains intentionally modest until M4.

## Next: M4

M4 focuses on the fun layer: move/capture animation, river/jump/trap/den effects, AI presence, event-driven personality quips, sound, reduced-motion behavior and a stronger settlement experience.
