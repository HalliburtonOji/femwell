# FemWell · the companion who lives in the garden

**Status:** Ideas concept, 5 November 2026. No character, new memory, voice default or social behaviour has shipped from this note. Halli asked to adapt the recent “Brainstorm RealLife app concept” exchange, especially its funny customisable buddy, visible reactions, interactive objects and shared history. This is a FemWell proposal, not a RealLife pivot.

## Recommendation

**Let the existing Jess become a visible, playable garden resident.** The approved accumulating garden remains the record of her life; Jess is the actor who moves through it and visits the rooms of the app. Keep the existing named bloom companion and its form, personality, tend, share and chapter history. Do not create a second AI agent or make a full-screen game the price of opening an article. A user avatar or separate pet can be an optional later concept after one character proves useful.

The first test should be one 60–90 second *“come with me”* scene, not an app-wide animation rollout. On Today, an upcoming meeting offers **“Practise with Jess”** beside the real Planner item. Jess puts down the book she was holding, turns toward the user, offers two practice styles, plays interviewer for one short exchange, and stops immediately when interrupted. The user chooses one line to keep; after an acknowledged write it appears at that meeting's Planner source. A pressed flower or other object appears in the garden as a direct link back to the saved moment. If there is no meeting, the scene is offered only as an explicit practice choice. No invented appointment or inferred anxiety.

## One relationship across existing rooms

| Existing owner | Jess's compact role | Real destination or return |
|---|---|---|
| Today | One relevant invitation, never another feed or mandatory greeting | Exact Planner, Read or Garden object |
| Lifestyle Read / Books | Holds a bookmark or reacts to an exact saved passage; optional one-line comment | Existing reader, Save, Continue, book shelf |
| Listen / Sky | Quiet presence during playback or a single authored sky story | Existing player/transcript and Sky source |
| Good life | A two-minute shared action such as getting out the door or handling one small admin step | Existing room action and Planner when user asks |
| Jess | Same named persona and voice preference, with text-only and silent options | Existing chat/history/settings/memory and action envelope |
| Garden | Home for the character and visible objects earned from actual actions | Existing accumulating plants, chapters, rename/reshape/share |
| Community | Optional hand-off to an actual room only on user request | Existing anonymous consent and exact Community return; no automatic post or DM |

Interaction grammar: **notice → react → offer → do → show receipt → remember only if chosen**. The character can turn, pause, fumble an object, smile and recover; she need not speak at every step. “Not now” closes the moment with no guilt. An optional saved memory can be inspected, edited and forgotten in the existing Jess memory UI. Never pretend the character observed off-app events or private DMs.

## Implementation shape and cost gate

First prototype: a small 2D rig or authored sprite with a few purposeful states (idle, attend, speak, interrupted, pleased, quiet) and botanical prop interactions. Draw it into a **single contained Ideas scene**, then a compact, non-blocking version only if Halli likes it. Reuse `jess_name`, `jess_character`, `jess_proactivity`, `jess_privacy`, `JessMemory`, the existing action executor, `CompanionState`, garden chapters and actual Planner/Read IDs. Map ownership and resolve the two existing names before any profile/schema migration. No new Base44 function name. Do not call an LLM for every blink, page view or motion; client events drive animation. Interactive Jess calls occur only on explicit conversation. Reuse authored audio assets when approved; no per-view TTS. Measure cold/return JS bytes, animation frame cost, requests and paid units, with low-motion, silent and text-only paths. MDN notes that animation properties and media size can affect performance, and `prefers-reduced-motion` should reduce nonessential motion: [animation performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion). The [Generative Agents research](https://research.google/pubs/generative-agents-interactive-simulacra-of-human-behavior/) suggests observation, memory and planning contribute to believable agents; for FemWell, keep the remembered observations explicit and user-controlled. [NVIDIA ACE](https://developer.nvidia.com/ace-for-games) demonstrates speech/animation/game-character components, but its game stack is not assumed to fit this Base44 web app.

## Review gate

Next artifact: one tappable **Ideas** scene with the actual meeting item, character response to interruption, a proposed save, an acknowledged read-back and a garden object that reopens the same source. Show 360/390/430 pixels and real taps, low-motion and silent modes, loading/error/exit states, resource measurements and P0/P1/P2 critique. Keep main unchanged until Halli explicitly promotes the design. The material decisions for Halli are visual form, whether Jess and the named garden bloom share one name or remain distinct, and whether this kind of optional scene feels right in FemWell. No need for per-animation or per-line approval.
