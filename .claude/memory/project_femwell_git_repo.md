---
name: FemWell git repo
description: Public git repo for the FemWell base44 codebase. Use for code grep, component inspection, answering "what does live actually do" questions.
type: reference
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
**Repo:** https://github.com/HalliburtonOji/femwell.git  
**Owner:** Halliburton (the user)  
**Purpose:** the actual base44 source for the FemWell app (id `69a9891a6ccccc1822bbb4bc`, live at femwells.com).

**How to use:**
- Clone into a temp dir for greppable codebase walks: `git clone https://github.com/HalliburtonOji/femwell.git /tmp/femwell-repo` (or under /sessions/relaxed-loving-brahmagupta/femwell-repo/ if persistence is helpful).
- Always pull latest before reading — base44 builds push to this repo so it tracks live.
- Grep this repo to answer questions like "which save table does the heart write to?" or "what filter does the Read tab use?" instead of guessing from schemas.
- Mr Lead Manager's mandatory pre-spec walk now includes a grep of the affected component in this repo.

**Reminder for any sub-agent:** read the actual code, not memory.
