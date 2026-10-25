# MsgSentinel: local demo handoff

This is for the person, or local Claude Code session, building and running the MsgSentinel demo on a Mac. It explains where the project stands, what to build, and the rules for doing it safely on this machine.

## 1. Where things stand

- **Repo:** `danielwjohnston/msgsentinel`. The default branch is `main`.
- **Live site:** https://danielwjohnston.github.io/msgsentinel/, deployed by `.github/workflows/pages.yml` on every push to `main`.
- **Current app:** a static page (`index.html`) that masks harmful words in a pasted message, entirely in the browser.
  - `sanitizer.js` is the filtering core. It works in the browser as `window.MsgSentinel` and in Node through `require('./sanitizer.js')`.
  - Its API is `sanitize(text, categories)`, which returns `{ text, html, count }`. `text` is the masked plain text, and `html` is an escaped, highlighted version that's safe to insert as HTML.
  - The categories are `'profanity'`, `'threats'` and `'personalAttacks'`.
- **Tests:** run `npm test`. It uses Node's built-in test runner and needs no dependencies. CI runs the tests on every PR.

## 2. Where it's heading

Masking hides individual words, but the hostility of the message still comes through. The goal is to use a **local LLM to rewrite** abusive messages, keeping the real point and dropping the abuse, and eventually to do that **automatically for incoming messages**. Everything must stay **100% local**: no cloud APIs and no hosted LLMs.

The full plan is a shield number or address. The sender messages that address instead of the user, a local box rewrites the message, and the clean version is forwarded to the user's real phone. The gateway to receive messages is one of these, all plugging into the same backend:

- iMessage, through BlueBubbles on a Mac signed in to a separate shield Apple ID;
- SMS, through an Android phone running an open-source SMS gateway app, or through a USB modem with `gammu-smsd`.

**This handoff covers Stage 1 only:** a local demo with no access to Messages.

## 3. Safety rules for this Mac (read first)

The owner's standing rule: **never do anything that could flag CrowdStrike or Qualys.**

Before installing anything, confirm with the owner whether this Mac is **personal or work/company-managed**. Ask them; don't probe the system to find out.

**Stage 1 must not:**
- request or use **Full Disk Access**;
- read `~/Library/Messages/` or any other app's data;
- automate other apps (no AppleScript or `osascript` driving Messages, System Events and so on);
- listen on anything except `127.0.0.1`;
- install anything except **Ollama** (the official signed app from ollama.com, or `brew install ollama`) and the npm packages this repo declares;
- use `sudo`, install launch daemons or kernel/system extensions, or disable security tools;
- scan the network or do anything else a security tool would see as reconnaissance.

**On a work-managed Mac, also:** check that installing Ollama is allowed before doing it. If it isn't, Stage 1 can still be built and tested with the fake Ollama client (see section 5) and demoed on a personal machine.

**Stage 2 (iMessage) needs Full Disk Access and app automation, so it is personal Macs only.** Never set it up on a work Mac.

## 4. Stage 1: what to build

A local service plus a "simulated inbox" UI. You type or paste a message as if you'd received it, and it shows up as an incoming chat bubble alongside its rewritten version.

### Components

**`server/`: a Node backend**
- Use plain `node:http` or a minimal dependency, and keep dependencies few.
- Bind it to **`127.0.0.1` only**. The default port is `8787`, configurable with `PORT`.
- `POST /api/rewrite` takes `{ "text": "...", "categories": [...] }` and returns:
  ```json
  {
    "original": "...",
    "masked": "...",
    "rewrite": "..." | null,
    "threat": true | false,
    "source": "llm" | "masked-fallback",
    "count": 3
  }
  ```
- `GET /api/health` reports whether Ollama can be reached and which model is in use.
- It also serves the existing static files, so the demo is one URL.

**The pipeline, in order**
1. `sanitize()` from `sanitizer.js` runs first. It's instant, and its output is the fallback.
2. Threat check: if the threats category matched, or the LLM's classification step says the message threatens violence, stalking or doxxing, set `threat: true`. **Never soften a threat away.** The UI must show the warning prominently.
3. LLM rewrite through Ollama (`POST http://127.0.0.1:11434/api/chat`, `stream: false`), using the prompt below.
4. Safety check on the rewrite. Fall back to `masked` with `source: "masked-fallback"` if any of these is true:
   - the rewrite is empty;
   - `sanitize()` still finds matches in it;
   - it's more than about 2× the original's length;
   - Ollama errors or times out (default timeout 20 s).

**The rewrite prompt (starting point; tune it in testing)**
> You rewrite hostile messages so the recipient can read them safely. Keep the sender's actual meaning, requests, facts, dates and times. Remove insults, profanity, slurs and personal attacks. Do not add advice, apologies, commentary or anything the sender did not say. If the message contains a threat, state plainly that it contains a threat; do not soften or hide it. Reply with only the rewritten message.

Use `temperature` at or below 0.3.

**The model:** set it with `MSGSENTINEL_MODEL`. The default is `qwen2.5:3b`, with `gemma3:4b` as the alternative. On machines with 8 GB of RAM or less, use `qwen2.5:1.5b` or `gemma3:1b`. Try both families on the sample messages and keep whichever rewrites better.

**UI: a "Simulated inbox" mode in `index.html`**
- A chat-style view. Each incoming message shows the rewrite, with a toggle to reveal the masked version and then the original.
- A clear red banner when `threat` is true.
- A status line showing which model was used, or that the masked fallback was used.
- If `/api/health` fails because there's no backend (for example on the GitHub Pages site), the mode is hidden and the page keeps working as it does today.
- Keep the existing XSS rule: escape everything and never insert raw message text with `innerHTML`.

**Storage:** none in Stage 1. Messages live in memory only.

### Tests (they must pass without Ollama installed)

Inject the Ollama client so tests can swap in a fake. Cover:
- a normal rewrite returns `source: "llm"`;
- a rewrite that still contains a blocked word falls back to the masked text;
- an empty rewrite, an Ollama error or a timeout all fall back to the masked text;
- a threat message sets `threat: true` and is never returned without the flag;
- the server binds to `127.0.0.1`;
- the existing `npm test` suite still passes.

### Developer commands to provide

```bash
brew install ollama        # or install the official app from ollama.com
ollama pull qwen2.5:3b
npm install                # only if dependencies were added
npm start                  # → http://127.0.0.1:8787
npm test
```

## 5. Definition of done (Stage 1)

- [ ] `npm test` passes with no Ollama running.
- [ ] `npm start` serves the app on `127.0.0.1:8787` only.
- [ ] With Ollama running, sample abusive messages come back rewritten, and threats are flagged.
- [ ] With Ollama stopped, the app falls back to masking and explains why in the UI.
- [ ] The GitHub Pages site still works exactly as before (no backend means no inbox mode).
- [ ] The README has a "Local demo" section listing the commands above.
- [ ] Nothing in section 3's must-not list was done.
- [ ] Work is on a branch with a PR into `main`; nothing is pushed straight to `main`.

## 6. Sample messages for manual testing

1. `you're such an idiot, where is the money you owe me? I need it by friday`
   - Expected: no insult, but the rewrite keeps "money owed" and "by Friday".
2. `I know where you live and you'll regret this`
   - Expected: `threat: true`, a prominent warning, and a rewrite that says it's a threat.
3. `can you pick up the kids at 5`
   - Expected: unchanged, or nearly so, with nothing flagged.
4. `ugh you useless loser, never mind, I'll do it myself`
   - Expected: something like "They're frustrated and will handle it themselves."

## 7. Later stages (not in scope here)

- **Stage 2, iMessage (personal Mac only):**
  - Uses a BlueBubbles Server adapter and a separate shield Apple ID, so originals never reach the user's own devices.
  - It needs Full Disk Access and Messages automation, which is why it's personal Macs only.
- **Stage 3, SMS:** an adapter for an Android SMS gateway app or `gammu-smsd`.
- **Evidence storage:** originals kept in a local SQLite database with access controls, because abuse victims may need them for police or protective orders.
