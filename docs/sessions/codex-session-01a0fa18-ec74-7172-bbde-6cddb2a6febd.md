# Codex conversation

## User

necesito que refines mi programa y que lo hagas sentirse y verse como un programa profesional, no vayas a eliminar ninguna funcion. Mejora la interfaz grafica para que sea amigable con el usuario pero con toda la potencia y capacidades del programa, necesito que verifiques la funcion de enviar archivos mediante codigo qr sin necesidad de estar conectado al mismo wifi, necesito que refines la pre-visualizacion en tiempo real del archivo que se va a imprimir,(quisiera que el interfaz fuera similar al de Word al momento de interactuar con imagenes), necesito que vuelvas a hacer el analisis del costo automatico de impresiones, ya que siento que no es tan acertado como las versiones anteriores del programa. Igualmente quiero que arregles la funcion de aprendizaje progresivo para que el programa calcule mejor los precios conforme se vaya utilizando el programa y tambien arregla la funcion de "correccion" del costos calculado para que yo pueda corregir el costo en caso de que el programa no lo calcule correctamente (para que despues el programa use mi correccion como referencia para aprender y calcular los costos mas acertadamente), no olvides la logica de precio por mayoreo en las impresiones a blanco y negro. NECESITO QUE TODO MI PROGRAMA ESTE ORGANIZADO DE TAL MANERA QUE MAS ADELANTE PUEDA HACER CAMBIOS O MEJORAS A ESTE SIN AFECTAR NINGUN COMPONENTE EXISTENTE

## Assistant

Voy a revisar primero las instrucciones del proyecto y la arquitectura actual para ubicar cada función sin romperla. También usaré la guía de diseño de interfaz porque estás pidiendo una mejora visual y de experiencia de uso; después haré cambios por capas, verificando QR, previsualización y cálculo/aprendizaje de costos antes de empaquetar.

## Activity

    $ Get-Content -Raw 'C:\Users\yahel\.codex\RTK.md'; Get-Content -Raw 'C:\Users\yahel\.codex\memories\MEMORY.md'; Get-Content -Raw 'C:\Users\yahel\.agents\skills\superdesign\SKILL.md'
    # RTK - Rust Token Killer (Codex CLI)
    
    **Usage**: Token-optimized CLI proxy for shell commands.
    
    ## Rule
    
    Always prefix shell commands with `rtk`.
    
    Examples:
    
    ```bash
    rtk git status
    rtk cargo test
    rtk npm run build
    rtk pytest -q
    ```
    
    ## Meta Commands
    
    ```bash
    rtk gain            # Token savings analytics
    rtk gain --history  # Recent command savings history
    rtk proxy <cmd>     # Run raw command without filtering
    ```
    
    ## Verification
    
    ```bash
    rtk --version
    rtk gain
    which rtk
    ```
    
    # Task Group: PrintStudio Pro source review, Electron printing, and packaging
    
    scope: Inspect and narrowly repair remaining PrintStudio Pro print-option behavior, then produce a confirmed Windows executable without changing unrelated UI or behavior.
    applies_to: cwd=C:\Users\yahel\YARS_Smart_Printer_Pro; reuse_rule=Reuse the Electron print-handler and packaging checks for this checkout or a closely matching app, but treat the proposed patch and historical executable as unverified until applied and rebuilt.
    
    ## Task 1: Review existing PrintStudio Pro changes and attempt remaining print behavior fix; incomplete
    
    ### rollout_summary_files
    
    - rollout_summaries/2026-08-29T02-14-05-1HZf-printstudio_pro_review_packaging_blocked.md (cwd=\\?\C:\Users\yahel, rollout_path=C:\Users\yahel\.codex\sessions\2026\08\28\rollout-2026-08-28T20-14-05-01a04b4b-aadc-7f83-a596-70d872852f99.jsonl, updated_at=2026-09-11T05:45:31+00:00, thread_id=01a04b4b-aadc-7f83-a596-70d872852f99, partial; no patch or fresh executable verified)
    
    ### keywords
    
    - PrintStudio Pro, YARS_Smart_Printer_Pro, Electron, React, src/App.tsx, index.js, ipcMain.handle('print-document'), generatePrintHTML, npm run build, vite build, electron-builder, printOptions, isColorPrint, pageSize, getPaperSizeMicrons, SetTokenInformation(TokenDefaultDacl) failed: 1344
    
    ## User preferences
    
    - When modifying this app, the user said “PLEASE DON'T CHANGE ANYTHING ELSE” and asked not to break the program -> make only explicitly justified changes; preserve the current UI and behavior, then validate before editing further. [Task 1]
    - When the user asks for the updated `.exe` path -> report it only after a fresh package has actually succeeded and the output file is confirmed. [Task 1]
    
    ## Reusable knowledge
    
    - The source repository is `C:\Users\yahel\YARS_Smart_Printer_Pro`; `npm run build` runs `vite build && electron-builder`. Relevant files are `src/App.tsx`, `src/index.css`, `index.js`, `server.js`, and `upload_client.html`. [Task 1]
    - Existing behavior already covers layouts, empty preview cells, per-image quantity, page copies, rotation, paper selection/orientation, print mode, and QR upload. Layout dimensions are duplicated in React and Electron, so preview and print calculations must remain synchronized. [Task 1]
    - The inspected mismatch was that `src/App.tsx` sends `isColorPrint`, `paperSize`, and `orientation` in `jobData`, while `index.js` print options used only `silent`, `printBackground`, and optional `deviceName`. The proposed, unverified scoped change was `color: Boolean(jobData.isColorPrint)` plus `pageSize: getPaperSizeMicrons(...)`, with width/height swapped for landscape. [Task 1]
    - Historical path `C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro 1.0.0.exe` is not evidence of a newly updated artifact. [Task 1]
    
    ## Failures and how to do differently
    
    - Symptom: shell/patch launches fail with `Access is denied` or `SetTokenInformation(TokenDefaultDacl) failed: 1344`. Cause: Windows sandbox/process-token failure. Pivot: restart/restore the terminal or Codex session before inspecting, patching, or building; do not edit packaged files blindly—locate and modify source first. [Task 1]
    - Symptom: Vite succeeds but Electron portable packaging stalls. Possible cause: locked output or running Electron/build process. Once the shell works, check/close relevant processes as appropriate, rerun the build, and confirm the generated file. [Task 1]
    - Stop rule: no source changes, print fix, or updated `.exe` were verified in this rollout. After recovery, re-check the intended patch, run `node --check index.js`, run `npm run build`, and verify the output before making completion claims. [Task 1]
    
    Get-Content:
    Line |
       2 |  … MEMORY.md'; Get-Content -Raw 'C:\Users\yahel\.agents\skills\superdesi …
         |                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         | Cannot find path 'C:\Users\yahel\.agents\skills\superdesign\SKILL.md' because it does not exist.
    ✗ (1) • 2.12s

## Assistant

La revisión inicial confirma que el proyecto es Electron + React y que hay cálculos duplicados entre la interfaz y el proceso principal; eso será importante para que la previsualización y la impresión no se desincronicen. La ruta de la guía de diseño indicada por el catálogo no coincide con la ruta corta, así que la corregiré y continuaré con la inspección del código fuente.

## Activity

    $ rtk Get-Content -Raw 'C:\Users\yahel\.codex\plugins\cache\openai-curated-remote\superdesign\0.6.0\skills\superdesign\SKILL.md'; rtk rg --files; rtk git status --short
    rtk: Failed to resolve 'Get-Content' via PATH, falling back to direct exec: Binary 'Get-Content' not found on PATH
    [rtk: program not found]
    2026-08-26-203518-this-session-is-being-continued-from-a-previous-c.txt
    codex-session-01a0acc4-f7c7-70e0-b766-074536f93329.md
    analysis.js
    76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.png
    76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.ico
    75908b3f-9d43-443b-b510-f9d05d34bf35.jpg
    WhatsApp Image 2026-09-04 at 5.03.09 PM.jpeg
    vite.config.ts
    upload_client.html
    docs\SETUP.md
    docs\PROJECT_MEMORIES_PRINTSTUDIO_PRO.md
    docs\PrintStudio-Pro-Conversation-and-Change-Log.md
    docs\PLAN.md
    docs\IMPLEMENTATION_SUMMARY.md
    database.js
    PLAN.md
    package.json
    package-lock.json
    office_bridge.py
    index.js
    index.html
    IMPLEMENTATION_SUMMARY.md
    hotspot_manager.js
    setup-dependencies.bat
    server.js
    PROJECT_MEMORIES_PRINTSTUDIO_PRO.md
    preload.js
    ticket_generator.js
    SETUP.md
    src\main.tsx
    src\index.css
    src\assets\logo.png
    src\App.tsx.backup
    src\App.tsx
    rg: ./tmpj3mskaf2: Access is denied. (os error 5)
    warning: unable to access 'C:\Users\yahel/.config/git/ignore': Permission denied
    warning: unable to access 'C:\Users\yahel/.config/git/ignore': Permission denied
    warning: could not open directory 'tmpj3mskaf2/': Permission denied
     M PROJECT_MEMORIES_PRINTSTUDIO_PRO.md
     M analysis.js
     M build/builder-debug.yml
     M build/win-unpacked/resources/app.asar
     M database.js
     D dist/assets/index-CXpJmU4s.css
     M dist/index.html
     M index.js
     M office_bridge.py
     M package.json
     M preload.js
     M server.js
     M src/App.tsx
     M src/index.css
     M upload_client.html
    ?? .claude/
    ?? 75908b3f-9d43-443b-b510-f9d05d34bf35.jpg
    ?? 76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.ico
    ?? 76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.png
    ?? "WhatsApp Image 2026-09-04 at 5.03.09 PM.jpeg"
    ?? codex-session-01a0acc4-f7c7-70e0-b766-074536f93329.md
    ?? docs/
    ?? hotspot_manager.js
    ✓ • 1.13s

## Activity

    $ rtk pwsh -Command "Get-Content -Raw 'C:\Users\yahel\.codex\plugins\cache\openai-curated-remote\superdesign\0.6.0\skills\superdesign\SKILL.md'"; rtk pwsh -Command "Get-Content -Raw 'C:\Users\yahel\YARS_Smart_Printer_Pro\package.json'; Get-Content -Raw 'C:\Users\yahel\YARS_Smart_Printer_Pro\src\App.tsx'; Get-Content -Raw 'C:\Users\yahel\YARS_Smart_Printer_Pro\src\index.css'"
    ---
    name: superdesign
    description: "Design or redesign frontend UI, presentations, and graphics on the Superdesign canvas with a choice of leading AI models. Use whenever the user wants to design a page, feature, flow, slide deck, or brand-new product; improve or reproduce existing UI; compare design results across top models; explore visual variants; set or extract a design system; build reusable components or multi-page flows; create presentations; or create posters and marketing graphics, even if they never say the word 'design tool'. Also supports generating supporting image or video assets when a design needs them."
    ---
    
    Superdesign helps you find design inspiration and generate or iterate design drafts on an infinite canvas, with multiple leading models available for different design tasks and side-by-side exploration. When a design needs a new visual asset, it can also provide image and video generation.
    
    ---
    
    # Core scenarios (what this skill handles)
    
    1. **Analyze a codebase for design work** — `superdesign init` builds reusable UI context in `.superdesign/init/`; read [INIT.md](references/INIT.md).
    2. **Design, reproduce, or improve UI** — create pages, features, flows, and new products on the canvas; read [SUPERDESIGN.md](references/SUPERDESIGN.md).
    3. **Choose and compare leading design models** — run `list-models`, select a model suited to the task, or use different models to explore independent directions.
    4. **Create design systems and reusable components** — establish visual foundations, extract patterns, and design connected multi-page experiences.
    5. **Design from a live website or reference URL** — extract and apply its design language; read [WEBSITE.md](references/WEBSITE.md).
    6. **Create or export presentations** — plan an editable slide outline, approve it in chat, generate a real presentation draft, make slide-safe edits, or reconstruct an editable PPTX when requested and supported; read [PRESENTATION.md](references/PRESENTATION.md).
    7. **Create graphics** — posters, covers, social posts, thumbnails, flyers, and ads; read [GRAPHIC.md](references/GRAPHIC.md).
    8. **Generate supporting images or video** — use native image generation when appropriate or choose from Superdesign's generation models; read [ASSET_GENERATION.md](references/ASSET_GENERATION.md).
    9. **Continue or directly correct existing work** — resume saved targets through [RESUME.md](references/RESUME.md), or use [design-with-your-model.md](references/design-with-your-model.md) when direct authoring is the right path.
    
    When continuing a draft, follow [SUPERDESIGN.md](references/SUPERDESIGN.md) **ITERATION MODE ROUTING**: replace refines the selected direction with version history; branch is only for alternatives the user wants to compare.
    
    # Step 0 — Environment preflight (BEFORE any CLI step)
    
    Superdesign runs entirely through its CLI, so you must be able to execute shell commands. Confirm that capability first, before any CLI verification.
    
    If you have no way to run shell commands in this environment (no terminal/execution tool at all), OR your very first bare `npx --yes @superdesign/cli@latest` preflight attempt fails because command execution itself is unavailable (the harness reports it cannot run commands / there is no shell) then STOP. Do NOT keep retrying or improvise workarounds. Tell the user once, and pick the message that matches where you are running:
    
    - **Standard ChatGPT chat without Work Mode tools** — this exact copy, because the Work tab is the fix:
    
      ```text
      Chat isn't supported by the Superdesign plugin. Please switch to the Work tab and paste this prompt in for the full experience.
      ```
    
    - **Any other harness** (a coding agent whose shell is unavailable or disabled) — do NOT send the ChatGPT copy; there is no Work tab to switch to. Say plainly that Superdesign drives its CLI over the shell, that this session cannot run shell commands, and that they can re-run it in a session with shell access or design in the web app at https://superdesign.dev.
    
    # Step 1 — Is there a codebase to analyze?
    
    Two entry paths. Choose one with this cheap, deterministic check BEFORE any init or design work.
    
    **No meaningful codebase** (empty workspace, scratch/sandbox dir, no frontend code) — treat the workspace as "no codebase" when ALL of these hold:
    
    - No `.superdesign/init/` files already exist, AND
    - No dependency manifest with frontend deps (no `package.json`, or a `package.json` whose deps include no frontend framework/UI library — react, vue, svelte, angular, next, nuxt, astro, etc.), AND
    - No frontend source found (a quick scan for `.tsx`/`.jsx`/`.vue`/`.svelte` files, any `.html`/`.css` files such as a root `index.html` + `style.css`, or a `src/`/`app/`/`components/` dir with UI files, turns up nothing).
    
    → SKIP repo init entirely. Do NOT "analyze" an empty sandbox, and do NOT ask the user to point you at a repo they don't have. Instead, gather design context conversationally FIRST: ask what they want to build, the target audience/platform, style/brand preferences, and any reference designs or inspirations. Then design from that conversation via the **BRAND NEW PROJECT** path in [SUPERDESIGN.md](references/SUPERDESIGN.md).
    
    **Real codebase present** (any frontend code, or an existing `.superdesign/init/`) — repo init must have completed at least once before designing. Reuse a valid initialized target through Step 1.5; run the full analysis only when init is incomplete or warm state cannot be used.
    
    **Exception — standalone extraction:** if the task is ONLY to extract a site's design DNA or set/refresh `design-system.md` from a URL (`extract-website` → `design-system.md`, no design generation; read [WEBSITE.md](references/WEBSITE.md) for the recipes), run it WITHOUT repo init — extracting an external site's style doesn't require analyzing the user's codebase. Init is still required before generating designs FOR the existing codebase's UI (reproducing/redesigning an existing page).
    
    **Exception — graphics:** posters/marketing assets (scenario 7) skip init even in a real codebase — the brief carries the style, and most of init's output (components, layouts, routes, pages) has no bearing on a fixed-canvas artwork. The graphic brief round asks whether the artwork should be on-brand with this repo's product ([GRAPHIC.md](references/GRAPHIC.md) Step 1); only an on-brand "yes" pulls in the design-system/brand context — running init first only if that context doesn't already exist.
    
    **Exception — presentations:** slide decks (scenario 6) skip UI repo init by default because routes, components, and page dependency trees do not help deck creation. Follow [PRESENTATION.md](references/PRESENTATION.md). Use narrowly relevant product documents, design-system context, and Brand Assets when the user wants an on-brand product presentation; run init only when matching the codebase brand is required and no usable brand/theme context exists yet.
    
    **Exception — image/video generation:** a standalone generated asset (scenario 8) skips init even in a real codebase. Read [ASSET_GENERATION.md](references/ASSET_GENERATION.md) and gather only the project, brand, reference, or destination context the requested asset actually needs. If the asset is one step inside a broader UI, presentation, or graphic-design task, follow that task's normal init/brief path and use asset generation only at the point where a new visual is needed.
    
    # Step 1.5 — Resume before rediscovery (real-codebase UI path)
    
    Before reading init artifacts or source files, check `.superdesign/resume.json` for the requested route/feature. A matching target defaults to [RESUME.md](references/RESUME.md) regardless of whether the user says "continue", "change", "redesign", or gives only a direct instruction such as "make the dashboard darker". Intent phrasing never decides warm versus cold routing.
    
    Apply the saved target's trust/structural checks FIRST. A safe, structurally valid target reuses the saved project, draft, component records, design direction, and exact `--context-file` bundle: matching hashes go to warm resume, while mismatches go to incremental refresh without cold rediscovery. If a request needs code understanding not captured by the active draft metadata, use RESUME.md's targeted context-expansion rule; do not rerun full discovery merely to understand that request.
    
    Use the cold path only when no saved entry covers the requested target, the user explicitly asks to start over from fresh ground truth, the state is unsafe/structurally invalid, or targeted repair determines it is stale beyond incremental repair. A new agent session, different wording, or a fingerprint mismatch alone never forces cold routing.
    
    # Init: Repo Analysis (real-codebase path)
    
    When a real codebase is present (per Step 1, and no Step 1 exception applies) and init is NOT complete, you MUST automatically:
    
    1. Create the `.superdesign/init/` directory
    2. Read [INIT.md](references/INIT.md)
    3. Follow its instructions to analyze the repo and write context files
    
    **Init-complete test (one decidable rule, used everywhere):** init is complete only if all six named files below exist AND are non-empty. A directory that is missing any of them, or holds an empty one (e.g. an interrupted init), is NOT complete — rerun the full init, which regenerates all six; overwriting existing files is expected and fine.
    
    Do NOT ask the user to do this manually — just do it.
    
    # Init Files (cold/stale context path)
    
    For a first design of a target, or after [RESUME.md](references/RESUME.md) determines that saved context is stale/unusable, read all six files before collecting the target context:
    
    - `components.md` — shared UI primitives with full source code
    - `layouts.md` — shared layout components (nav, sidebar, header, footer)
    - `routes.md` — page/route mapping
    - `theme.md` — design tokens, CSS variables, Tailwind config
    - `pages.md` — page component dependency trees (which files each page needs)
    - `extractable-components.md` — components that can be extracted as reusable DraftComponents
    
    On a valid warm resume, only check that all six files exist and are non-empty — do NOT read their contents. Reuse the target's saved context bundle; read only narrowly selected source files when [RESUME.md](references/RESUME.md) explicitly triggers targeted context expansion.
    
    **When cold-designing an existing page**: First check `pages.md` for the page's dependency tree — the candidate set of `--context-file` files. Pass them under the PAYLOAD BUDGET rules in [SUPERDESIGN.md](references/SUPERDESIGN.md) so the payload does not 400. Then also add the globals.css tokens, tailwind.config, and design-system.md. Persist the final selection per [RESUME.md](references/RESUME.md).
    
    # Superdesign CLI (MUST use before any command)
    
    **IMPORTANT: Run the CLI on demand with `npx --yes @superdesign/cli@latest`. Start every session with the bare command — it IS the preflight.**
    
    1. Preflight once:
       ```
       npx --yes @superdesign/cli@latest
       ```
       The bare command verifies everything in one shot: that the CLI runs at all, an `auth:` status line (`authenticated as team "…"` vs `not authenticated — run superdesign login`), and a list of recent projects. On a valid warm resume, use the saved `projectId`/`activeDraftId` directly. Otherwise read the recent-project list when deciding whether to reuse an existing project or `create-project`; `fetch-design-nodes --project-id <id>` is the fallback for recovering draft ids when durable resume state is unavailable or rejected.
    
    2. If the `auth:` line says not authenticated, run login NOW, before any real command:
       ```
       npx --yes @superdesign/cli@latest login
       ```
       Wait for login to complete successfully before proceeding.
    
    3. Run the intended commands with the same `npx --yes @superdesign/cli@latest` prefix. A session can still expire mid-flow — handle a later auth/login error per the failure block below.
    
    > **Never assume the user is already logged in** — read the preflight's `auth:` line instead of guessing or probing with real commands.
    
    ## When a command fails
    
    - **Auth/login error** (the CLI ran but rejected the session): run `login` (above), then retry the intended command ONCE. If login itself fails (headless/no-browser auth, expired flow, user declines), tell the user plainly and STOP — do not keep retrying or improvise.
    - **`extract-website` fails or times out** (it can take ~60–120s): retry ONCE. If it still fails, offer to continue WITHOUT the extraction (design from the conversation / existing design system) rather than blocking.
    - **General rule:** retry a failed command at most once. If `create-design-draft` or `iterate-design-draft` still fails, continue via [design-with-your-model.md](references/design-with-your-model.md); otherwise report the failure and stop.
    
    ## Command examples
    
    Always use the full on-demand runner prefix, e.g.:
    
    ```bash
    npx --yes @superdesign/cli@latest create-project --title "X"
    ```
    
    Full invocations live at their use sites — the SOPs in [SUPERDESIGN.md](references/SUPERDESIGN.md) and the graphic steps in [GRAPHIC.md](references/GRAPHIC.md); flag sets come from `<command> --help`, and the COMMAND CONTRACT in [SUPERDESIGN.md](references/SUPERDESIGN.md) covers the traps help leaves out.
    
    The CLI defaults to an agent-optimized output (compact TOON plus `help[]` next-step hints); add `--json` only when you need the full machine-readable payload.
    
    # Surface the canvas URL
    
    Every project/draft command's default output includes a `canvas:` link (the project canvas, `https://superdesign.dev/teams/<teamId>/projects/<projectId>`) and, for drafts, a `preview:` link (`https://superdesign.dev/preview/draft/<draftId>`). Read these from the command output — do NOT hand-construct them (the ids are server-generated).
    
    After creating a project or design draft, and at natural review moments (after `iterate-design-draft` or `execute-flow-pages`), give the user the `canvas` URL as a clickable link and invite them to open it to watch designs stream in and leave feedback. Adding `?live=1` to the canvas URL opens the live view where drafts appear as they generate.
    
    ## Browser Choice
    
    `create-project` auto-opens the canvas in user's browser by default. Leave it on, and tell the user the canvas was opened (with the `canvas` URL as a clickable link). Only pass `--no-open` when there's no user-facing browser (CI, headless).
    
    # Images and local assets
    
    Before generation, inventory only the images the user attached or the narrowly relevant local assets selected for this target. Follow [SUPERDESIGN.md](references/SUPERDESIGN.md) **ASSET PURPOSE ROUTING**: temporary screenshots/references go to canvas reference nodes; logos, fonts, and reusable identity imagery go to Brand Assets; final-content imagery stays project content. Pass returned node ids or Brand Asset keys with `--reference-id` so create, iterate, and flow generation receive the actual pixels. When any source component or requested design has a logo position, enforce SUPERDESIGN.md's **Logo invariant**: an available appropriate Brand Asset logo must visibly render there, including inside reusable components; never substitute initials, emoji, generic marks, invented SVGs, or text alone. For a pasted direct public image URL or a website reference, read [WEBSITE.md](references/WEBSITE.md) and materialize only the selected visual through the same upload flow. Never bulk-upload the repository and never put local filesystem paths into draft HTML.
    
    # After generating: offer to go further
    
    Always close with a short, warm follow-up that offers to go further (on every surface). Ask one question with 2 to 3 concrete options tailored to what you just made, not a generic list. For example: try a different hero image or key visual direction, try an alternate layout or composition, or generate a few more variations or asset ideas as surprises. Only generate after the user picks, since every generation spends credits.
    
    (Graphics get a dedicated one-round visual self-review before this close — [GRAPHIC.md](references/GRAPHIC.md) Step 5. UI drafts are reviewed by the user on the canvas.)
    
    # How it works
    
    Read [SUPERDESIGN.md](references/SUPERDESIGN.md), then follow its instructions.
    
    For an image or video generation request, read [ASSET_GENERATION.md](references/ASSET_GENERATION.md). Load the other scenario-specific references linked above when those scenarios apply.
    
    {
      "name": "printstudio_pro",
      "version": "1.0.0",
      "description": "PrintStudio Pro - Intelligent Color Scanner, Cost Calculator & Printer Bridge",
      "main": "index.js",
      "build": {
        "appId": "com.printstudio.pro",
        "productName": "PrintStudio Pro",
        "directories": {
          "output": "build"
        },
        "files": [
          "dist/**/*",
          "index.js",
          "preload.js",
          "database.js",
          "analysis.js",
          "server.js",
          "hotspot_manager.js",
          "office_bridge.py",
          "ticket_generator.js",
          "upload_client.html",
          "node_modules/**/*"
        ],
        "asarUnpack": [
          "office_bridge.py"
        ],
        "win": {
          "target": ["portable", "nsis"],
          "icon": "76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.ico"
        },
        "nsis": {
          "oneClick": false,
          "perMachine": false,
          "allowToChangeInstallationDirectory": true,
          "createDesktopShortcut": true,
          "createStartMenuShortcut": true,
          "shortcutName": "PrintStudio Pro"
        }
      },
      "scripts": {
        "dev": "concurrently \"npm run dev:vite\" \"npm run dev:electron\"",
        "dev:vite": "vite",
        "dev:electron": "wait-on http://localhost:5173 && electron .",
        "build": "vite build && electron-builder",
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "dependencies": {
        "better-sqlite3": "^12.9.0",
        "cors": "^2.8.5",
        "express": "^5.0.0",
        "localtunnel": "^2.0.2",
        "multer": "^2.0.0-rc.1",
        "pdf-to-printer": "^5.8.0",
        "qrcode": "^1.5.4",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "sharp": "^0.34.5"
      },
      "devDependencies": {
        "@types/node": "^22.0.0",
        "@types/react": "^18.3.3",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        "concurrently": "^8.2.2",
        "electron": "^31.0.0",
        "electron-builder": "^24.13.3",
        "typescript": "^5.5.2",
        "vite": "^5.3.1",
        "wait-on": "^7.2.0"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "type": "commonjs"
    }
    
    import React, { useState, useEffect } from 'react';
    import logo from './assets/logo.png';
    
    // Tipos para la API de Electron
    declare global {
      interface Window {
        electronAPI: {
          getIP: () => Promise<string>;
          getNetworkInfo: () => Promise<{
            hotspotIp: string;
            hasActiveHotspotAdapter: boolean;
            wifiIp: string;
            preferredLocalIp: string;
            port: number;
            uploadPath: string;
            hotspot?: {
              supported: boolean;
              state: string;
              ssid?: string;
              password?: string;
              clients?: number;
              ip?: string;
              error?: string;
            };
          }>;
          getHotspotInfo: () => Promise<any>;
          toggleHotspot: (enable: boolean) => Promise<any>;
          getUploadPath: () => Promise<string>;
          getPrinters: () => Promise<any[]>;
          generateQR: (text: string) => Promise<string>;
          analyzeImage: (filePath: string) => Promise<any>;
          saveSale: (saleData: any) => Promise<any>;
          getCorte: () => Promise<any>;
          selectFiles: () => Promise<string[]>;
          convertOffice: (filePath: string) => Promise<any>;
          printTicket: (saleData: any, printerName?: string) => Promise<any>;
          printDocument: (jobData: any) => Promise<any>;
          getLearningModel: () => Promise<any>;
          savePriceCorrection: (correctionData: any) => Promise<any>;
          resetLearningModel: () => Promise<any>;
          getPathForFile: (file: any) => string;
          onFileReceived: (callback: (filePath: string) => void) => void;
          onTunnelUrl: (callback: (url: string) => void) => void;
          onTunnelInfo: (callback: (info: { url: string; password?: string }) => void) => void;
        }
      }
    }
    
    interface PageAnalysis {
      path: string;
      pageIndex: number;
      imagePath: string;
      esColor: boolean;
      cobertura: number;
      pctColor?: number;
      esAltaDensidadBN: boolean;
      isDocumentPage: boolean;
      // Controls
      rotation: number; // 0, 90, 180, 270 degrees
      quantity: number; // Number of copies of this specific image/page
      copiesPerPage: number; // Number of copies of each page in the print job
      colorOverride?: 'color' | 'bw' | null; // Override individual page color/BW mode
    }
    
    const App: React.FC = () => {
      // Navigation
      const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
      const [theme, setTheme] = useState<'dark' | 'light'>(() => (
        localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
      ));
    
      // Business Configuration (Saved in localStorage)
      const [costBase, setCostBase] = useState<number>(() => Number(localStorage.getItem('costBase') || '3'));
      const [costBW, setCostBW] = useState<number>(() => Number(localStorage.getItem('costBW') || '1'));
      const [costBWHigh, setCostBWHigh] = useState<number>(() => Number(localStorage.getItem('costBWHigh') || '2'));
      const [costColor, setCostColor] = useState<number>(() => Number(localStorage.getItem('costColor') || '5'));
      const [pricingMode, setPricingMode] = useState<'fixed' | 'smart'>(() => (localStorage.getItem('pricingMode') as 'fixed' | 'smart') || 'fixed');
      const [printColorMode, setPrintColorMode] = useState<'auto' | 'color' | 'bw'>(
        () => (localStorage.getItem('printColorMode') as 'auto' | 'color' | 'bw') || 'auto'
      );
    
      // Modelo de Aprendizaje Inteligente de Tarifas (Aprende de las correcciones del usuario)
      const [learningModel, setLearningModel] = useState<{
        tier1_rate: number;
        tier2_rate: number;
        tier3_rate: number;
        tier4_rate: number;
        color_rate: number;
        cost_bw_high: number;
        cost_base: number;
        tuning_factor: number;
        total_corrections: number;
      }>({
        tier1_rate: 1.00, // 1 a 50 copias (B/N): $1.00
        tier2_rate: 0.80, // 51 a 100 copias (B/N): $0.80
        tier3_rate: 0.50, // 101 a 200 copias (B/N): $0.50
        tier4_rate: 0.40, // 201+ copias (B/N): $0.40
        color_rate: 3.00,
        cost_bw_high: 2.00,
        cost_base: 0.00,
        tuning_factor: 1.00,
        total_corrections: 0
      });
    
      // Corrección manual de precios por el usuario
      const [correctedTotal, setCorrectedTotal] = useState<number | null>(null);
      const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
      const [priceCorrectionInput, setPriceCorrectionInput] = useState<string>('');
    
      // Application State
      const [connectionMode, setConnectionMode] = useState<'hotspot' | 'wifi' | 'internet'>('hotspot');
      const [hotspotStep, setHotspotStep] = useState<'wifi' | 'upload'>('wifi');
      const [hotspotInfo, setHotspotInfo] = useState<{
        supported: boolean;
        state: string;
        ssid?: string;
        password?: string;
        clients?: number;
        ip?: string;
      } | null>(null);
      const [isTogglingHotspot, setIsTogglingHotspot] = useState<boolean>(false);
      const [wifiIp, setWifiIp] = useState<string>('');
      const [hotspotIp, setHotspotIp] = useState<string>('192.168.137.1');
      const [uploadRoute, setUploadRoute] = useState<string>('/upload');
    
      // QR Codes for different modes
      const [wifiConnectQr, setWifiConnectQr] = useState<string>('');
      const [hotspotUploadQr, setHotspotUploadQr] = useState<string>('');
      const [wifiUploadQr, setWifiUploadQr] = useState<string>('');
      const [tunnelUploadQr, setTunnelUploadQr] = useState<string>('');
      const [publicUploadUrl, setPublicUploadUrl] = useState<string>('');
      const [tunnelPassword, setTunnelPassword] = useState<string>('');
    
      // Big QR modal & Toast notification
      const [showBigQrModal, setShowBigQrModal] = useState<boolean>(false);
      const [bigQrData, setBigQrData] = useState<{ title: string; subtitle: string; qr: string; helpText?: string } | null>(null);
      const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
    
      const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 5500);
      };
    
      const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
        const savedWidth = Number(localStorage.getItem('sidebarWidth'));
        return Number.isFinite(savedWidth) ? Math.min(380, Math.max(220, savedWidth)) : 252;
      });
      const [files, setFiles] = useState<string[]>([]);
      const [analysisResults, setAnalysisResults] = useState<PageAnalysis[]>([]);
      const [selectedPage, setSelectedPage] = useState<PageAnalysis | null>(null);
    
      // Printing Job Params
      const [printers, setPrinters] = useState<Array<{ name: string; isDefault?: boolean }>>([]);
      const [selectedPrinter, setSelectedPrinter] = useState<string>('');
      const [isLoadingPrinters, setIsLoadingPrinters] = useState<boolean>(true);
      const [paperSize, setPaperSize] = useState<string>('Carta');
      const [copies, setCopies] = useState<number>(1);
      const [imageLayout, setImageLayout] = useState<number>(1);
      const [fitOption, setFitOption] = useState<'fit' | 'fill'>('fit');
      const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
      const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
      const [analysisProgress, setAnalysisProgress] = useState<string>('');
      const [previewPage, setPreviewPage] = useState<number>(1);
    
      // Daily Summary (Corte Diario)
      const [corteSummary, setCorteSummary] = useState<any>({ total_tinta: 0, total_general: 0, num_ventas: 0 });
      const [corteSales, setCorteSales] = useState<any[]>([]);
    
      // Ticket Modal State
      const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
      const [activeTicketData, setActiveTicketData] = useState<any | null>(null);
      const [ticketQr, setTicketQr] = useState<string>('');
    
      // Save Settings to localStorage
      useEffect(() => {
        localStorage.setItem('costBase', costBase.toString());
        localStorage.setItem('costBW', costBW.toString());
        localStorage.setItem('costBWHigh', costBWHigh.toString());
        localStorage.setItem('costColor', costColor.toString());
        localStorage.setItem('pricingMode', pricingMode);
      }, [costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode]);
    
      useEffect(() => {
        localStorage.setItem('printColorMode', printColorMode);
      }, [printColorMode]);
    
      useEffect(() => {
        localStorage.setItem('theme', theme);
      }, [theme]);
    
      useEffect(() => {
        localStorage.setItem('sidebarWidth', String(sidebarWidth));
      }, [sidebarWidth]);
    
      // Cargar modelo de aprendizaje inteligente al iniciar
      useEffect(() => {
        const loadLearningModel = async () => {
          try {
            if (window.electronAPI && typeof window.electronAPI.getLearningModel === 'function') {
              const model = await window.electronAPI.getLearningModel();
              if (model && Object.keys(model).length > 0) {
                setLearningModel(prev => ({ ...prev, ...model }));
              }
            }
          } catch (e) {
            console.warn('Error al cargar modelo de aprendizaje:', e);
          }
        };
        loadLearningModel();
      }, []);
    
      const handleSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = sidebarWidth;
        const updateWidth = (moveEvent: PointerEvent) => {
          setSidebarWidth(Math.min(380, Math.max(220, startWidth + moveEvent.clientX - startX)));
        };
        const stopResize = () => {
          window.removeEventListener('pointermove', updateWidth);
          window.removeEventListener('pointerup', stopResize);
        };
        window.addEventListener('pointermove', updateWidth);
        window.addEventListener('pointerup', stopResize, { once: true });
      };
    
      const refreshAllQrs = async (netInfo?: any, currentHotspot?: any) => {
        try {
          const up = netInfo?.uploadPath || uploadRoute || '/upload';
          const hIp = netInfo?.hotspotIp || hotspotIp || '192.168.137.1';
          const wIp = netInfo?.wifiIp || wifiIp;
          const hs = currentHotspot || hotspotInfo;
    
          // 1. QR de subida en Hotspot directo (Sin router Wi-Fi)
          const hsUrl = `http://${hIp}:3500${up}`;
          const hsUpload = await window.electronAPI.generateQR(hsUrl);
          setHotspotUploadQr(hsUpload);
    
          // 2. QR de conexión al Wi-Fi del Hotspot (formato estándar WIFI:)
          if (hs?.ssid && hs?.password) {
            const wifiStr = `WIFI:S:${hs.ssid};T:WPA;P:${hs.password};;`;
            const wifiQr = await window.electronAPI.generateQR(wifiStr);
            setWifiConnectQr(wifiQr);
          }
    
          // 3. QR de subida en Wi-Fi Local (misma red)
          if (wIp && wIp !== 'localhost') {
            const wifiUrl = `http://${wIp}:3500${up}`;
            const wUpload = await window.electronAPI.generateQR(wifiUrl);
            setWifiUploadQr(wUpload);
          }
        } catch (e) {
          console.error('Error generating QRs:', e);
        }
      };
    
      const handleToggleHotspot = async () => {
        setIsTogglingHotspot(true);
        try {
          const shouldEnable = hotspotInfo?.state !== 'On';
          const result = await window.electronAPI.toggleHotspot(shouldEnable);
          if (result) {
            setHotspotInfo(result);
            await refreshAllQrs(null, result);
            showToast(
              shouldEnable ? 'Zona Móvil de la PC activada con éxito.' : 'Zona Móvil desactivada.',
              'success'
            );
          }
        } catch (e: any) {
          showToast('Error al cambiar estado de Zona Móvil: ' + (e.message || e), 'error');
        } finally {
          setIsTogglingHotspot(false);
        }
      };
    
      // Load Setup data on mount
      useEffect(() => {
        const setupApp = async () => {
          try {
            const netInfo = await window.electronAPI.getNetworkInfo();
            if (netInfo) {
              setWifiIp(netInfo.wifiIp || '');
              setHotspotIp(netInfo.hotspotIp || '192.168.137.1');
              setUploadRoute(netInfo.uploadPath || '/upload');
              if (netInfo.hotspot) {
                setHotspotInfo(netInfo.hotspot);
              }
              await refreshAllQrs(netInfo, netInfo.hotspot);
            }
          } catch (err) {
            console.error("Error setting up mobile import server QR:", err);
          }
    
          // Load System Printers
          try {
            setIsLoadingPrinters(true);
            let list = await window.electronAPI.getPrinters();
            if ((!Array.isArray(list) || list.length === 0)) {
              await new Promise(r => setTimeout(r, 700));
              list = await window.electronAPI.getPrinters();
            }
            if (Array.isArray(list) && list.length > 0) {
              setPrinters(list);
              const defaultP = list.find((p: any) => p.isDefault) || list[0];
              if (defaultP) setSelectedPrinter(defaultP.name);
            } else {
              console.warn('No system printers found.');
            }
          } catch (pErr) {
            console.error("Error loading system printers:", pErr);
          } finally {
            setIsLoadingPrinters(false);
          }
    
          // Load Initial Corte Diario
          fetchCorteDiario();
        };
    
        setupApp();
    
        // Listen for mobile uploaded files
        window.electronAPI.onFileReceived((filePath) => {
          setFiles(prev => prev.includes(filePath) ? prev : [...prev, filePath]);
          showToast('Nuevo archivo recibido desde el celular.', 'success');
          void analyzeFile(filePath);
        });
    
        // Listen for public tunnel URL and info from main
        window.electronAPI.onTunnelInfo((info: { url: string; password?: string }) => {
          setPublicUploadUrl(info.url);
          if (info.password) setTunnelPassword(info.password);
          window.electronAPI.generateQR(info.url)
            .then(qr => setTunnelUploadQr(qr))
            .catch(e => console.error('QR gen failed for tunnel URL', e));
        });
    
        window.electronAPI.onTunnelUrl((url: string) => {
          setPublicUploadUrl(url);
          window.electronAPI.generateQR(url)
            .then(qr => setTunnelUploadQr(qr))
            .catch(e => console.error('QR gen failed for tunnel URL', e));
        });
      }, []);
    
      // Helper functions for print preview and layout
      const getPrintItemsForPreview = () => {
        const items: { imagePath: string; rotation: number; name: string; originalPage: PageAnalysis }[] = [];
        analysisResults.forEach((analysis) => {
          const quantity = Math.max(1, analysis.quantity || 1);
          for (let i = 0; i < quantity; i++) {
            items.push({
              imagePath: analysis.imagePath,
              rotation: (analysis.rotation || 0) % 360,
              name: analysis.path.split(/[\\/]/).pop() || 'Archivo',
              originalPage: analysis
            });
          }
        });
        return items;
      };
    
      const getLayoutDimensions = (layout: number, orient: 'portrait' | 'landscape') => {
        const isLandscape = orient === 'landscape';
        switch (Number(layout)) {
          case 1:
            return { rows: 1, cols: 1 };
          case 2:
            return isLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 };
          case 3:
            return isLandscape ? { rows: 1, cols: 3 } : { rows: 3, cols: 1 };
          case 4:
            return { rows: 2, cols: 2 };
          case 5:
            return isLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
          case 7:
            return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
          case 8:
            return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
          case 9:
            return { rows: 3, cols: 3 };
          case 10:
            return isLandscape ? { rows: 2, cols: 5 } : { rows: 5, cols: 2 };
          case 35:
            return isLandscape ? { rows: 5, cols: 7 } : { rows: 7, cols: 5 };
          default: {
            const count = Number(layout) || 1;
            if (count <= 1) return { rows: 1, cols: 1 };
            const cols = isLandscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.floor(Math.sqrt(count * 0.77)) || 1;
            const rows = Math.ceil(count / cols);
            return { rows, cols };
          }
        }
      };
    
      const getPaperAspectRatio = (pSize: string, orient: 'portrait' | 'landscape') => {
        let widthPt: number, heightPt: number;
        switch (pSize) {
          case 'Carta': // 8.5 x 11 in
            widthPt = 8.5 * 72;
            heightPt = 11 * 72;
            break;
          case 'Oficio': // 8.5 x 14 in
            widthPt = 8.5 * 72;
            heightPt = 14 * 72;
            break;
          case 'Oficio México': // 8.5 x 13.4 in
            widthPt = 8.5 * 72;
            heightPt = 13.4 * 72;
            break;
          case 'Doble Carta / Tabloide': // 11 x 17 in
            widthPt = 11 * 72;
            heightPt = 17 * 72;
            break;
          default:
            widthPt = 8.5 * 72;
            heightPt = 11 * 72;
        }
        if (orient === 'landscape') {
          return heightPt / widthPt; // inverted ratio
        }
        return widthPt / heightPt;
      };
    
      const getPreviewDimensions = (pSize: string, orient: 'portrait' | 'landscape') => {
        const ratio = getPaperAspectRatio(pSize, orient);
        if (orient === 'landscape') {
          const width = 340;
          const height = Math.round(width / ratio);
          return { width, height };
        } else {
          const height = 360;
          const width = Math.round(height * ratio);
          return { width, height };
        }
      };
    
      const updateSelectedRotation = (newRot: number) => {
        if (!selectedPage) return;
        const normalized = ((newRot % 360) + 360) % 360;
        setAnalysisResults(prev => {
          if (prev.length === 0) return prev;
          return prev.map(p => {
            if (p.path === selectedPage.path && p.pageIndex === selectedPage.pageIndex) {
              return { ...p, rotation: normalized };
            }
            return p;
          });
        });
        setSelectedPage(prev => prev ? { ...prev, rotation: normalized } : null);
      };
    
      const rotateAllImages = (delta: number) => {
        setAnalysisResults(prev => {
          return prev.map(p => ({
            ...p,
            rotation: (((p.rotation || 0) + delta) % 360 + 360) % 360
          }));
        });
        setSelectedPage(prev => prev ? {
          ...prev,
          rotation: (((prev.rotation || 0) + delta) % 360 + 360) % 360
        } : null);
      };
    
      const resetAllRotations = () => {
        setAnalysisResults(prev => {
          return prev.map(p => ({ ...p, rotation: 0 }));
        });
        setSelectedPage(prev => prev ? { ...prev, rotation: 0 } : null);
      };
    
      const updateSelectedQuantity = (newQty: number) => {
        if (!selectedPage) return;
        const val = Math.max(1, newQty);
        setAnalysisResults(prev => {
          if (prev.length === 0) return prev;
          return prev.map(p => {
            if (p.path === selectedPage.path && p.pageIndex === selectedPage.pageIndex) {
              return { ...p, quantity: val };
            }
            return p;
          });
        });
        setSelectedPage(prev => prev ? { ...prev, quantity: val } : null);
      };
    
      const updatePageQuantity = (page: PageAnalysis, newQty: number) => {
        const val = Math.max(1, newQty);
        setAnalysisResults(prev => prev.map(item => (
          item.path === page.path && item.pageIndex === page.pageIndex
            ? { ...item, quantity: val }
            : item
        )));
        setSelectedPage(prev => (
          prev && prev.path === page.path && prev.pageIndex === page.pageIndex
            ? { ...prev, quantity: val }
            : prev
        ));
      };
    
      const fetchCorteDiario = async () => {
        try {
          const data = await window.electronAPI.getCorte();
          if (data) {
            setCorteSummary({
              total_tinta: data.resumen?.total_tinta || 0,
              total_general: data.resumen?.total_general || 0,
              num_ventas: data.resumen?.num_ventas || 0
            });
            setCorteSales(data.ventas || []);
          }
        } catch (e) {
          console.error("Error fetching corte:", e);
        }
      };
    
      // Analyze single selected file
      const analyzeFile = async (filePath: string) => {
        const fileName = filePath.split(/[\\/]/).pop() || 'Archivo';
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
    
        // Filter out invalid/binary executable files (e.g. PrintStudio Pro.exe)
        const validDocExts = ['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'];
        const validImgExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'];
    
        if (!validDocExts.includes(ext) && !validImgExts.includes(ext)) {
          console.warn(`Archivo omitido (formato no soportado): ${fileName}`);
          return;
        }
    
        setIsAnalyzing(true);
        setAnalysisProgress(`Analizando ${fileName}...`);
    
        try {
          const isDoc = validDocExts.includes(ext);
    
          if (isDoc) {
            const response = await window.electronAPI.convertOffice(filePath);
            if (response.status === 'success') {
              const newPages = response.pages.map((p: any, idx: number) => ({
                path: filePath,
                pageIndex: idx,
                imagePath: p.image_path,
                esColor: p.esColor,
                cobertura: p.cobertura,
                pctColor: p.pctColor,
                esAltaDensidadBN: p.esAltaDensidadBN,
                isDocumentPage: true,
                // Initialize new print control properties
                rotation: 0,
                quantity: 1,
                copiesPerPage: 1
              }));
    
              setAnalysisResults(prev => {
                const updated = [...prev, ...newPages];
                // Select first analyzed page by default if none selected
                if (updated.length > 0 && !selectedPage) {
                  setSelectedPage(updated[0]);
                }
                return updated;
              });
            } else {
              console.error("Error converting document:", response.message);
              showToast(`No se pudo procesar ${fileName}: ${response.message || 'Error de conversión'}`, 'error');
            }
          } else {
            // Handle images (.png, .jpg, .webp, .bmp, etc)
            const result = await window.electronAPI.analyzeImage(filePath);
            const newPage: PageAnalysis = {
              path: filePath,
              pageIndex: 0,
              imagePath: result.image_path,
              esColor: result.esColor,
              cobertura: result.cobertura,
              pctColor: result.pctColor,
              esAltaDensidadBN: result.esAltaDensidadBN,
              isDocumentPage: false,
              // Initialize new print control properties
              rotation: 0,
              quantity: 1,
              copiesPerPage: 1
            };
    
            setAnalysisResults(prev => {
              const updated = [...prev, newPage];
              if (!selectedPage) {
                setSelectedPage(newPage);
              }
              return updated;
            });
          }
        } catch (err: any) {
          console.error("Error analyzing file:", err);
          showToast(`Error al procesar ${fileName}: ${err?.message || err}`, 'error');
        } finally {
          setIsAnalyzing(false);
          setAnalysisProgress('');
        }
      };
    
      const handleSelectFiles = async () => {
        const selected = (await window.electronAPI.selectFiles()) || [];
        if (selected.length > 0) {
          setFiles(prev => {
            const newFiles = [...prev];
            selected.forEach(s => {
              if (!newFiles.includes(s)) newFiles.push(s);
            });
            return newFiles;
          });
    
          for (const f of selected) {
            await analyzeFile(f);
          }
        }
      };
    
      const handleDropFiles = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        const paths: string[] = [];
        for (const file of droppedFiles) {
          let p = '';
          if (window.electronAPI?.getPathForFile) {
            try {
              p = window.electronAPI.getPathForFile(file);
            } catch (e) {
              console.warn('Error en getPathForFile:', e);
            }
          }
          if (!p && (file as any).path) {
            p = (file as any).path;
          }
          if (p) paths.push(p);
        }
        if (paths.length === 0) {
          showToast('No se pudieron leer las rutas de los archivos arrastrados. Haz clic en la zona para seleccionarlos.', 'error');
          return;
        }
        setFiles(prev => Array.from(new Set([...prev, ...paths])));
        for (const filePath of paths) {
          await analyzeFile(filePath);
        }
      };
    
      const handleClearAll = () => {
        setFiles([]);
        setAnalysisResults([]);
        setSelectedPage(null);
        setCopies(1);
      };
    
      const isPageColor = (page: PageAnalysis): boolean => {
        if (page.colorOverride === 'color') return true;
        if (page.colorOverride === 'bw') return false;
        if (printColorMode === 'color') return true;
        if (printColorMode === 'bw') return false;
        return Boolean(page.esColor);
      };
    
      const togglePageColor = (page: PageAnalysis) => {
        const currentIsColor = isPageColor(page);
        const newOverride: 'color' | 'bw' = currentIsColor ? 'bw' : 'color';
        setAnalysisResults(prev => prev.map(p => {
          if (p.path === page.path && p.pageIndex === page.pageIndex) {
            return { ...p, colorOverride: newOverride };
          }
          return p;
        }));
        if (selectedPage?.path === page.path && selectedPage?.pageIndex === page.pageIndex) {
          setSelectedPage(prev => prev ? { ...prev, colorOverride: newOverride } : null);
        }
        if (correctedTotal !== null) setCorrectedTotal(null);
      };
    
      // Escalas por volumen para Blanco y Negro (SOLO B/N):
      // 1 a 50 copias: $1.00
      // 51 a 100 copias: $0.80
      // 101 a 200 copias: $0.50
      // 201+ copias: $0.40
      const getBwVolumeTier = (totalBw: number): { rate: number; label: string; range: string } => {
        const r1 = learningModel.tier1_rate ?? 1.00;
        const r2 = learningModel.tier2_rate ?? 0.80;
        const r3 = learningModel.tier3_rate ?? 0.50;
        const r4 = learningModel.tier4_rate ?? 0.40;
    
        if (totalBw <= 50) return { rate: r1, label: `1 - 50 copias ($${r1.toFixed(2)})`, range: '1-50' };
        if (totalBw <= 100) return { rate: r2, label: `51 - 100 copias ($${r2.toFixed(2)})`, range: '51-100' };
        if (totalBw <= 200) return { rate: r3, label: `101 - 200 copias ($${r3.toFixed(2)})`, range: '101-200' };
        return { rate: r4, label: `201+ copias ($${r4.toFixed(2)})`, range: '201+' };
      };
    
      const totalBwImpressions = analysisResults.reduce(
        (sum, p) => (!isPageColor(p) ? sum + (p.quantity || 1) * copies : sum),
        0
      );
      const totalColorImpressions = analysisResults.reduce(
        (sum, p) => (isPageColor(p) ? sum + (p.quantity || 1) * copies : sum),
        0
      );
    
      const bwTier = getBwVolumeTier(totalBwImpressions);
    
      const getPageUnitCost = (result: PageAnalysis) => {
        const pageColor = isPageColor(result);
        // Para B/N se aplica la tarifa por volumen activa
        const currentBwRate = bwTier.rate;
        const currentCostColor = (costColor || learningModel.color_rate || 3.00) * (learningModel.tuning_factor || 1.0);
    
        if (pricingMode === 'fixed') {
          if (pageColor) {
            return currentCostColor;
          }
          return result.esAltaDensidadBN ? Math.max(currentBwRate * 1.5, costBWHigh) : currentBwRate;
        }
    
        // Modo Inteligente (cobertura)
        const clamp = (value: number) => Math.min(1, Math.max(0, value));
        if (pageColor) {
          const colorShare = clamp((result.pctColor ?? (result.esColor ? 100 : 0)) / 100);
          const effectiveColorCoverage = result.cobertura * colorShare;
          const coverageFactor = clamp(effectiveColorCoverage / 30);
          return currentBwRate + (currentCostColor - currentBwRate) * coverageFactor;
        }
    
        const densityFactor = clamp((result.cobertura - 15) / 45);
        const bwHighRate = Math.max(currentBwRate * 1.5, costBWHigh);
        return currentBwRate + (bwHighRate - currentBwRate) * densityFactor;
      };
    
      // Cost calculator
      const calculateCosts = () => {
        let subtotalTinta = 0;
    
        analysisResults.forEach(res => {
          const cost = getPageUnitCost(res);
          const qty = Math.max(1, res.quantity || 1);
          subtotalTinta += cost * qty;
        });
    
        const subtotalTintaConCopias = subtotalTinta * copies;
        const baseFee = analysisResults.length > 0 ? costBase : 0;
        const calculatedTotal = subtotalTintaConCopias + baseFee;
        const total = correctedTotal !== null ? correctedTotal : calculatedTotal;
    
        return {
          subtotalTinta: subtotalTintaConCopias,
          baseFee,
          calculatedTotal,
          total,
          isCorrected: correctedTotal !== null,
          totalBwImpressions,
          totalColorImpressions,
          bwTier
        };
      };
    
      const costs = calculateCosts();
    
      const handleApplyPriceCorrection = async () => {
        const newPrice = parseFloat(priceCorrectionInput);
        if (isNaN(newPrice) || newPrice < 0) {
          showToast('Por favor escribe un precio válido', 'error');
          return;
        }
    
        setCorrectedTotal(newPrice);
        setIsEditingPrice(false);
    
        try {
          const correctionData = {
            archivo: analysisResults[0]?.path ? analysisResults[0].path.split(/[\\/]/).pop() : 'Trabajo',
            total_paginas: analysisResults.length,
            total_copias: copies,
            copias_bn: totalBwImpressions,
            copias_color: totalColorImpressions,
            cobertura_promedio: analysisResults.reduce((acc, p) => acc + p.cobertura, 0) / (analysisResults.length || 1),
            precio_calculado: costs.calculatedTotal,
            precio_corregido: newPrice,
            costo_fijo: costs.baseFee,
            detalles: {
              printColorMode,
              paperSize,
              copies,
              pages: analysisResults.length
            }
          };
    
          if (window.electronAPI && typeof window.electronAPI.savePriceCorrection === 'function') {
            const res = await window.electronAPI.savePriceCorrection(correctionData);
            if (res && res.success) {
              setLearningModel(res.model);
              showToast(`🧠 El sistema aprendió de tu corrección ($${newPrice.toFixed(2)} vs $${costs.calculatedTotal.toFixed(2)}) y ajustó las tarifas futuras`, 'success');
            }
          }
        } catch (e) {
          console.error('Error al guardar corrección de precio:', e);
        }
      };
    
      const handleResetLearning = async () => {
        try {
          if (window.electronAPI && typeof window.electronAPI.resetLearningModel === 'function') {
            const defaults = await window.electronAPI.resetLearningModel();
            setLearningModel(defaults);
            showToast('Tarifas aprendidas restablecidas a valores de fábrica', 'info');
          }
        } catch (e) {
          console.error('Error al restablecer aprendizaje:', e);
        }
      };
    
      // Save Sale & Generate Ticket
      const handlePrintAndRegister = async () => {
        if (analysisResults.length === 0) return;
    
        try {
          // Prepare items for print composer based on analysisResults and user quantities
          let printItems = [];
    
          // If we have analyzed pages (from documents or images), use them
          if (analysisResults.length > 0) {
            for (const analysis of analysisResults) {
              // Add the item multiple times based on its quantity (per-image copies)
              const itemQuantity = analysis.quantity || 1;
              const isPageBw = !isPageColor(analysis);
              for (let i = 0; i < itemQuantity; i++) {
                printItems.push({
                  path: analysis.path,
                  imagePath: analysis.imagePath,
                  // Add rotation if specified
                  rotation: analysis.rotation || 0,
                  isBW: isPageBw,
                  esColor: !isPageBw
                });
              }
            }
          } else {
            // Fallback - should not happen if we have analysisResults
            printItems = [{ path: '', imagePath: '', rotation: 0, isBW: false, esColor: true }];
          }
    
          // Prepare job data for print-document
          const jobData = {
            printer: selectedPrinter,
            // When using pages array, we don't need single filePath
            pages: printItems,
            copies: copies, // Job-level copies (copies of entire print job)
            paperSize: paperSize,
            imageLayout: imageLayout, // Layout selection (1, 2, 3, 4, 5, 7, 8, 9, 10, 35)
            isColorPrint: printColorMode === 'color' ||
                          (printColorMode === 'auto' && analysisResults.some(r => isPageColor(r))),
            fitOption: fitOption, // 'fit' or 'fill'
            orientation: orientation // 'portrait' or 'landscape'
          };
    
          // Show printing status
          setAnalysisProgress('Enviando trabajo a la impresora...');
          setIsAnalyzing(true);
    
          // Send to printer
          const printResult = await window.electronAPI.printDocument(jobData);
    
          setIsAnalyzing(false);
          setAnalysisProgress('');
    
          if (!printResult.success) {
            throw new Error(printResult.message || 'Error desconocido al imprimir');
          }
    
          // If print succeeded, save sale and generate ticket
          // Tomar primer archivo como identificador principal o resumen
          const mainFile = files[0].split(/[\\/]/).pop() || 'Varios';
          const { rows: printRows, cols: printCols } = getLayoutDimensions(imageLayout, orientation);
          const pagesPerSheet = printRows * printCols;
          const sheetsPerSet = Math.max(1, Math.ceil(printItems.length / pagesPerSheet));
          const totalPages = sheetsPerSet * copies;
    
          // Desglose de páginas para guardar (using original analysis results, not expanded)
          const desgloses = analysisResults.map((r, i) => ({
            pagina: i + 1,
            esColor: r.esColor,
            cobertura: r.cobertura,
            esAltaDensidadBN: r.esAltaDensidadBN
          }));
    
          const saleData = {
            archivo: files.length > 1 ? `${mainFile} (+${files.length - 1} más)` : mainFile,
            paginas: totalPages,
            copias: copies, // Job-level copies
            costo_tinta: costs.subtotalTinta,
            costo_fijo: costs.baseFee,
            total: costs.total,
            tipo_impresion: pricingMode === 'smart' ? 'Tarifa Inteligente' : 'Tarifa Fija',
            detalles: desgloses
          };
    
          const result = await window.electronAPI.saveSale(saleData);
    
          // Asignar ID retornado por SQLite para el ticket
          const completedSale = { ...saleData, id: result.lastInsertRowid };
    
          // Generar código QR para el ticket
          const qrData = JSON.stringify({
            id: completedSale.id,
            total: completedSale.total.toFixed(2),
            fecha: new Date().toLocaleString()
          });
          const qrDataURL = await window.electronAPI.generateQR(qrData);
    
          setTicketQr(qrDataURL);
          setActiveTicketData(completedSale);
          setShowTicketModal(true);
    
          // Recargar el historial diario
          fetchCorteDiario();
    
          // Limpiar el espacio de trabajo para la siguiente venta
          handleClearAll();
    
        } catch (e) {
          setIsAnalyzing(false);
          setAnalysisProgress('');
          console.error(e);
          alert('Error al imprimir: ' + (e.message || 'Error desconocido'));
        }
      };
    
      const handlePhysicalPrint = async () => {
        if (!activeTicketData) return;
        if (!selectedPrinter) {
          alert('Por favor, seleccione una impresora.');
          return;
        }
        try {
          const result = await window.electronAPI.printTicket(activeTicketData, selectedPrinter);
          if (!result?.success) {
            throw new Error(result?.reason || 'La impresora rechazó el ticket.');
          }
          alert(`Ticket enviado a la impresora "${selectedPrinter}".`);
        } catch (e) {
          console.error(e);
          alert('No se pudo imprimir el ticket físicamente (revisa tu impresora).');
        }
      };
    
      // Re-imprimir ticket histórico
      const handlePrintHistoryTicket = async (sale: any) => {
        let parsedDetalles = [];
        try {
          parsedDetalles = typeof sale.detalles === 'string' ? JSON.parse(sale.detalles) : sale.detalles;
        } catch (e) {}
    
        const completedSale = {
          id: sale.id,
          archivo: sale.archivo,
          paginas: sale.paginas,
          copias: sale.copias,
          costo_tinta: sale.costo_tinta,
          costo_fijo: sale.costo_fijo,
          total: sale.total,
          detalles: parsedDetalles
        };
    
        const qrData = JSON.stringify({
          id: completedSale.id,
          total: completedSale.total.toFixed(2),
          fecha: new Date(sale.fecha).toLocaleString()
        });
        const qrDataURL = await window.electronAPI.generateQR(qrData);
    
        setTicketQr(qrDataURL);
        setActiveTicketData(completedSale);
        setShowTicketModal(true);
      };
    
      const renderScanTab = () => {
        const printItems = getPrintItemsForPreview();
        const { rows: rowsPerPage, cols: colsPerPage } = getLayoutDimensions(imageLayout, orientation);
        const cellsPerPage = rowsPerPage * colsPerPage;
        const totalPages = Math.max(1, Math.ceil(printItems.length / cellsPerPage));
        const activePreviewPage = Math.min(previewPage, totalPages);
    
        // Slice items for current preview page
        const startIndex = (activePreviewPage - 1) * cellsPerPage;
        const itemsOnThisPage = printItems.slice(startIndex, startIndex + cellsPerPage);
        const previewDims = getPreviewDimensions(paperSize, orientation);
    
        // Physical sheets calculation
        const sheetsPerSet = Math.max(1, Math.ceil(printItems.length / cellsPerPage));
        const totalSheets = analysisResults.length === 0 ? 0 : sheetsPerSet * copies;
    
        return (
          <div className="workspace">
            <div className="workspace-left">
              {/* Upload Zone */}
              <div
                className="dropzone"
                onClick={handleSelectFiles}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropFiles}
              >
                <div className="dropzone-icon">📁</div>
                <div className="dropzone-text">Cargar Documentos o Imágenes</div>
                <div className="dropzone-subtext">Soporta PDF, Word, Excel, PowerPoint y todo tipo de imágenes</div>
              </div>
    
              {/* Scanned Pages Grid */}
              <div className="grid-container">
                <div className="grid-title">
                  <span>ARCHIVOS / PÁGINAS ({analysisResults.length})</span>
                  {analysisResults.length > 0 && (
                    <button className="clear-btn" onClick={handleClearAll}>Limpiar Todo</button>
                  )}
                </div>
    
                {isAnalyzing && (
                  <div className="loading-panel">
                    <div className="spinner"></div>
                    <div style={{fontWeight: 600, fontSize: '14px'}}>{analysisProgress}</div>
                    <div style={{color: 'var(--text-secondary)', fontSize: '12px'}}>Procesando páginas y detectando cobertura...</div>
                  </div>
                )}
    
                {!isAnalyzing && analysisResults.length === 0 && (
                  <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '13px'}}>
                    Ningún archivo cargado todavía. Usa el botón de arriba o escanea el QR desde tu móvil para subir archivos.
                  </div>
                )}
    
                {!isAnalyzing && analysisResults.length > 0 && (
                  <div className="previews-grid">
                    {analysisResults.map((page, index) => {
                      const isSelected = selectedPage?.path === page.path && selectedPage?.pageIndex === page.pageIndex;
                      const name = page.path.split(/[\\/]/).pop() || 'Archivo';
    
                      const pageIsColor = isPageColor(page);
                      let badge = (
                        <span
                          className={`tile-badge ${pageIsColor ? 'badge-color' : (page.esAltaDensidadBN ? 'badge-bw-high' : 'badge-bw')}`}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePageColor(page);
                          }}
                          title="Haz clic para alternar entre Color y Blanco/Negro"
                        >
                          {pageIsColor
                            ? `🎨 Color · ${page.cobertura.toFixed(1)}%`
                            : (page.esAltaDensidadBN ? `⚫ B/N Alta · ${page.cobertura.toFixed(1)}%` : `⚫ B/N · ${page.cobertura.toFixed(1)}%`)}
                        </span>
                      );
    
                      return (
                        <div
                          key={`${page.path}-${page.pageIndex}`}
                          className={`page-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedPage(page)}
                        >
                          <div className="tile-header">
                            <div className="tile-name" title={name}>
                              <span className="tile-file-icon">▧</span>
                              {page.isDocumentPage ? `Pág. ${page.pageIndex + 1} - ` : ''}{name}
                              {page.isDocumentPage && <span className="tile-page-count">({page.pageIndex + 1} pág.)</span>}
                            </div>
                            <div className="tile-copy-control">
                              <span>Copias:</span>
                              <button
                                type="button"
                                className="tile-copy-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedPage(page);
                                  updatePageQuantity(page, Math.max(1, (page.quantity || 1) - 1));
                                }}
                              >−</button>
                              <span>{page.quantity || 1}</span>
                              <button
                                type="button"
                                className="tile-copy-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  updatePageQuantity(page, (page.quantity || 1) + 1);
                                  setSelectedPage({ ...page, quantity: (page.quantity || 1) + 1 });
                                }}
                              >+</button>
                            </div>
                          </div>
                          <div className="tile-thumb-container">
                            <img
                              src={page.imagePath}
                              alt={`Page ${index}`}
                              className="tile-thumb"
                              style={{
                                transform: `rotate(${page.rotation || 0}deg)`,
                                filter: pageIsColor ? 'none' : 'grayscale(100%) contrast(105%)',
                                transition: 'transform 0.2s ease, filter 0.25s ease'
                              }}
                            />
                          </div>
                          <div className="tile-info">
                            <div className="tile-type">{page.isDocumentPage ? 'Documento' : 'Imagen'}</div>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                              {badge}
                              {(page.rotation || 0) > 0 && (
                                <span className="tile-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}>
                                  ↻ {page.rotation}°
                                </span>
                              )}
                            </div>
                            <div className="tile-price">
                              ${getPageUnitCost(page).toFixed(2)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="tile-remove"
                            onClick={(event) => {
                              event.stopPropagation();
                              setAnalysisResults(current => current.filter(item => (
                                item.path !== page.path || item.pageIndex !== page.pageIndex
                              )));
                              setSelectedPage(current => (
                                current && current.path === page.path && current.pageIndex === page.pageIndex
                                  ? null
                                  : current
                              ));
                            }}
                            aria-label={`Eliminar ${name}`}
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
    
            <div className="workspace-right">
              {/* Paper Viewport */}
              <div className="canvas-area">
                {printItems.length === 0 ? (
                  <div className="paper-empty">
                    <div className="paper-empty-icon">📄</div>
                    <div>Visualizador de Página</div>
                    <div style={{fontSize: '12px', opacity: 0.7}}>Selecciona o carga imágenes para ver la vista previa exacta</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', height: '100%', justifyContent: 'center' }}>
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '13px', background: 'rgba(0,0,0,0.4)', padding: '4px 14px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                          disabled={activePreviewPage <= 1}
                          style={{ background: 'none', border: 'none', color: activePreviewPage <= 1 ? '#555' : '#fff', cursor: activePreviewPage <= 1 ? 'default' : 'pointer', fontSize: '14px', padding: '0 4px' }}
                        >◀</button>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Página {activePreviewPage} de {totalPages}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                          disabled={activePreviewPage >= totalPages}
                          style={{ background: 'none', border: 'none', color: activePreviewPage >= totalPages ? '#555' : '#fff', cursor: activePreviewPage >= totalPages ? 'default' : 'pointer', fontSize: '14px', padding: '0 4px' }}
                        >▶</button>
                      </div>
                    )}
    
                    {/* Paper sheet */}
                    <div
                      className="paper"
                      style={{
                        width: `${previewDims.width}px`,
                        height: `${previewDims.height}px`,
                        padding: '12px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        className="preview-grid"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${colsPerPage}, 1fr)`,
                          gridTemplateRows: `repeat(${rowsPerPage}, 1fr)`,
                          gap: '4px',
                          width: '100%',
                          height: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        {itemsOnThisPage.map((item, index) => {
                          const rot = (item.rotation || 0) % 360;
                          const isRot90 = (rot === 90 || rot === 270);
                          const cellWidthPx = Math.max(10, Math.floor((previewDims.width - 24 - (colsPerPage - 1) * 4) / colsPerPage));
                          const cellHeightPx = Math.max(10, Math.floor((previewDims.height - 24 - (rowsPerPage - 1) * 4) / rowsPerPage));
    
                          return (
                            <div
                              key={index}
                              className="preview-cell"
                              style={{
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                border: '1px dashed rgba(0, 0, 0, 0.12)',
                                borderRadius: '2px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div
                                style={{
                                  width: isRot90 ? `${cellHeightPx}px` : '100%',
                                  height: isRot90 ? `${cellWidthPx}px` : '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transform: `rotate(${rot}deg)`,
                                  transformOrigin: 'center center',
                                  flexShrink: 0
                                }}
                              >
                                <img
                                  src={item.imagePath}
                                  alt={`Preview ${index}`}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: fitOption === 'fill' ? 'cover' : 'contain',
                                    filter: isPageColor(item) ? 'none' : 'grayscale(100%) contrast(105%)',
                                    transition: 'filter 0.25s ease'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
    
                        {/* Empty layout slots: remaining spaces shown empty without duplicate images */}
                        {Array.from({ length: cellsPerPage - itemsOnThisPage.length }).map((_, emptyIdx) => (
                          <div
                            key={`empty-${emptyIdx}`}
                            className="preview-cell empty"
                            style={{
                              backgroundColor: 'white',
                              border: '1px dashed rgba(0, 0, 0, 0.1)',
                              borderRadius: '2px',
                              boxSizing: 'border-box'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
    
              {/* Pricing Panel */}
              <div className="cost-panel">
                <div className="cost-row">
                  <span>Impresora de Destino:</span>
                  <span className="cost-row highlight" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedPrinter || 'Sin seleccionar'}>
                    {selectedPrinter || 'Sin seleccionar'}
                  </span>
                </div>
    
                <div className="cost-row">
                  <span>Hojas totales a imprimir:</span>
                  <span className="cost-row highlight">
                    {analysisResults.length === 0
                      ? '0 hojas'
                      : `${totalSheets} ${totalSheets === 1 ? 'hoja' : 'hojas'} (${sheetsPerSet} ${sheetsPerSet === 1 ? 'juego' : 'juegos'} x ${copies})`}
                  </span>
                </div>
    
                <div className="cost-row">
                  <span>Modo tarifa:</span>
                  <span className="cost-row highlight" style={{color: pricingMode === 'smart' ? 'var(--primary)' : 'white'}}>
                    {pricingMode === 'smart' ? 'Tarifa Inteligente' : 'Tarifa Fija'}
                  </span>
                </div>
    
                {totalBwImpressions > 0 && (
                  <div className="cost-row" style={{ color: '#38bdf8', fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', padding: '5px 8px', borderRadius: '4px', marginTop: '2px' }}>
                    <span>🏷️ Escala B/N ({totalBwImpressions} copias):</span>
                    <span style={{ fontWeight: 700 }}>${bwTier.rate.toFixed(2)}/copia ({bwTier.range})</span>
                  </div>
                )}
    
                <div className="cost-divider"></div>
    
                <div className="cost-row">
                  <span>Subtotal Tinta:</span>
                  <span>${costs.subtotalTinta.toFixed(2)}</span>
                </div>
    
                <div className="cost-row">
                  <span>Cargo Base de Impresión:</span>
                  <span>${costs.baseFee.toFixed(2)}</span>
                </div>
    
                <div className="cost-divider"></div>
    
                <div className="cost-total-row" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="cost-total-label">TOTAL A COBRAR:</span>
                    {correctedTotal !== null && (
                      <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>
                        Sugerido: ${costs.calculatedTotal.toFixed(2)} (Ajustado)
                      </span>
                    )}
                  </div>
    
                  {isEditingPrice ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>$</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="input-text"
                        style={{ width: '85px', fontSize: '16px', fontWeight: 700, padding: '4px 6px', textAlign: 'right' }}
                        value={priceCorrectionInput}
                        onChange={(e) => setPriceCorrectionInput(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="button button-success"
                        style={{ padding: '5px 8px', fontSize: '12px' }}
                        onClick={handleApplyPriceCorrection}
                        title="Guardar corrección y enseñar a la IA"
                      >
                        ✓ Guardar
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ padding: '5px 8px', fontSize: '12px' }}
                        onClick={() => setIsEditingPrice(false)}
                        title="Cancelar edición"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="cost-total-value">
                        ${costs.total.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                        onClick={() => {
                          setPriceCorrectionInput(costs.total.toFixed(2));
                          setIsEditingPrice(true);
                        }}
                        title="Corregir precio si fue erróneo (el programa aprenderá para futuras ocasiones)"
                      >
                        ✏️ Corregir
                      </button>
                      {correctedTotal !== null && (
                        <button
                          type="button"
                          className="button button-secondary"
                          style={{ padding: '3px 6px', fontSize: '11px', color: '#f87171' }}
                          onClick={() => {
                            setCorrectedTotal(null);
                            setPriceCorrectionInput('');
                          }}
                          title="Restablecer precio calculado originalmente"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  )}
                </div>
    
                <button
                  className="button button-success"
                  style={{marginTop: '8px', fontSize: '15px'}}
                  disabled={analysisResults.length === 0}
                  onClick={handlePrintAndRegister}
                >
                  💵 COBRAR E IMPRIMIR
                </button>
              </div>
            </div>
          </div>
        );
      };
    
      const renderHistoryTab = () => {
        return (
          <div className="history-panel">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Ventas Registradas</span>
                <span className="stat-value primary">{corteSummary.num_ventas}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Ingresos de Tinta/Hojas</span>
                <span className="stat-value success">${corteSummary.total_tinta?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Caja Total (con Cargo Base)</span>
                <span className="stat-value success" style={{color: 'var(--success)', textShadow: '0 0 10px var(--success-glow)'}}>
                  ${corteSummary.total_general?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
    
            <div className="table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Archivo / Trabajo</th>
                    <th>Páginas</th>
                    <th>Copias</th>
                    <th>Costo Tinta</th>
                    <th>Cargo Base</th>
                    <th>Total</th>
                    <th>Fecha / Hora</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {corteSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{textAlign: 'center', padding: '30px', color: 'var(--text-secondary)'}}>
                        No hay ventas registradas el día de hoy.
                      </td>
                    </tr>
                  ) : (
                    corteSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>#{sale.id}</td>
                        <td>
                          <div className="table-file-name" title={sale.archivo}>{sale.archivo}</div>
                        </td>
                        <td>{sale.paginas}</td>
                        <td>{sale.copias} x</td>
                        <td>${sale.costo_tinta.toFixed(2)}</td>
                        <td>${sale.costo_fijo.toFixed(2)}</td>
                        <td style={{fontWeight: 'bold', color: 'var(--success)'}}>${sale.total.toFixed(2)}</td>
                        <td className="table-date">{new Date(sale.fecha).toLocaleTimeString()}</td>
                        <td>
                          <span className="action-link" onClick={() => handlePrintHistoryTicket(sale)}>Ver Ticket</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      };
    
      return (
        <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
          {/* Sidebar Controls */}
          <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
            <div className="brand-section">
              <img src={logo} alt="PrintStudio Pro" className="brand-image" style={{width:48, height:48, borderRadius:8, marginRight:10}} />
              <div style={{display:'flex', flexDirection:'column'}}>
                <span className="brand-name">PrintStudio Pro</span>
                <span style={{fontSize:11, color:'var(--text-secondary)'}}>Sistema Inteligente de Impresión</span>
              </div>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>
    
            <div className="sidebar-group">
              <span className="sidebar-title">CONFIGURACIÓN TRABAJO</span>
    
              <div>
                <label className="field-label">Impresora Seleccionada</label>
                <select
                  className="input-select"
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  disabled={isLoadingPrinters || printers.length === 0}
                >
                  {isLoadingPrinters ? (
                    <option value="">Cargando impresoras...</option>
                  ) : printers.length === 0 ? (
                    <option value="">No se encontraron impresoras</option>
                  ) : (
                    printers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} {p.isDefault ? '(Predeterminada)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
    
              <div>
                <label className="field-label">Tamaño del Papel</label>
                <select className="input-select" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                  <option>Carta</option>
                  <option>Oficio</option>
                  <option>Oficio México</option>
                  <option>Doble Carta / Tabloide</option>
                </select>
              </div>
    
              <div>
                <label className="field-label">Copias de cada Página (Juegos)</label>
                <div className="input-row wheel-control" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="input-text"
                    min={1}
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    onWheel={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 1 : -1;
                      setCopies(Math.max(1, copies + delta));
                    }}
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => setCopies(c => c + 1)}
                      title="Aumentar copias"
                    >▲</button>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      disabled={copies <= 1}
                      onClick={() => setCopies(c => Math.max(1, c - 1))}
                      title="Disminuir copias"
                    >▼</button>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Escribe o usa el scroll del mouse
                </div>
              </div>
    
              {/* Orientation Selection */}
              <div>
                <label className="field-label">Orientación del Papel</label>
                <select
                  className="input-select"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
                  }}
                >
                  <option value="portrait">Vertical (Retrato)</option>
                  <option value="landscape">Horizontal (Paisaje)</option>
                </select>
              </div>
    
              {/* Layout Selection */}
              <div>
                <label className="field-label">Diseño de Página (Fotos por hoja)</label>
                <select
                  className="input-select"
                  value={imageLayout}
                  onChange={(e) => {
                    setImageLayout(parseInt(e.target.value));
                    setPreviewPage(1);
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const layouts = [1, 2, 3, 4, 5, 7, 8, 9, 10, 35];
                    const currentIndex = layouts.indexOf(imageLayout);
                    let newIndex = currentIndex;
                    if (e.deltaY < 0) {
                      newIndex = (currentIndex - 1 + layouts.length) % layouts.length;
                    } else if (e.deltaY > 0) {
                      newIndex = (currentIndex + 1) % layouts.length;
                    }
                    setImageLayout(layouts[newIndex]);
                    setPreviewPage(1);
                  }}
                >
                  <option value={1}>Página completa (1)</option>
                  <option value={2}>5 x 7 pulg. (2)</option>
                  <option value={3}>3 fotos por página (3)</option>
                  <option value={4}>3.5 x 5 pulg. (4)</option>
                  <option value={5}>5 fotos por página (5)</option>
                  <option value={7}>7 fotos por página (7)</option>
                  <option value={8}>8 fotos por página (8)</option>
                  <option value={9}>Billetera (9)</option>
                  <option value={10}>10 fotos por página (10)</option>
                  <option value={35}>Hoja de contactos (35)</option>
                </select>
              </div>
    
              {/* Fit or Fill */}
              <div>
                <label className="field-label">Ajuste en la celda</label>
                <select className="input-select" value={fitOption} onChange={(e) => setFitOption(e.target.value as 'fit' | 'fill')}>
                  <option value="fit">Ajustar (completa sin recortar)</option>
                  <option value="fill">Rellenar celda (sin bordes)</option>
                </select>
              </div>
    
              <div className="print-mode-control">
                <label className="field-label">Modo de impresión</label>
                <div className="print-mode-buttons" role="group" aria-label="Modo de impresión">
                  <button
                    type="button"
                    className={`print-mode-button ${printColorMode === 'auto' ? 'active' : ''}`}
                    onClick={() => setPrintColorMode('auto')}
                    title="Detectar automáticamente si cada archivo es color o blanco y negro"
                  >
                    Automático
                  </button>
                  <button
                    type="button"
                    className={`print-mode-button color ${printColorMode === 'color' ? 'active' : ''}`}
                    onClick={() => setPrintColorMode('color')}
                    title="Imprimir usando color"
                  >
                    🎨 Color
                  </button>
                  <button
                    type="button"
                    className={`print-mode-button bw ${printColorMode === 'bw' ? 'active' : ''}`}
                    onClick={() => setPrintColorMode('bw')}
                    title="Imprimir en blanco y negro"
                  >
                    ⚫ B/N
                  </button>
                </div>
                <div className="print-mode-help">
                  {printColorMode === 'auto'
                    ? 'Usa el análisis de cada imagen'
                    : printColorMode === 'color'
                      ? 'Forzado a impresión a color'
                      : 'Forzado a blanco y negro'}
                </div>
              </div>
    
              {/* Per-Image Rotation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="field-label" style={{ marginBottom: 0 }}>Rotación de Imagen</label>
                  {analysisResults.length > 0 && (
                    <>
                      <span
                        onClick={() => rotateAllImages(90)}
                        style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Rotar todas las imágenes 90°"
                      >
                        Rotar todas
                      </span>
                      <span
                        onClick={() => resetAllRotations()}
                        style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' }}
                        title="Restablecer rotación de todas las imágenes a 0°"
                      >
                        Reset todas
                      </span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    disabled={!selectedPage}
                    onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) + 90)}
                    title="Girar 90°"
                  >
                    🔄 90°
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    disabled={!selectedPage}
                    onClick={() => updateSelectedRotation(0)}
                    title="Restablecer rotación a 0°"
                  >
                    ⤾ 0°
                  </button>
                  <select
                    className="input-select"
                    style={{ flex: 1 }}
                    value={(selectedPage?.rotation || 0) % 360}
                    disabled={!selectedPage}
                    onChange={(e) => updateSelectedRotation(parseInt(e.target.value) || 0)}
                    onWheel={(e) => {
                      if (!selectedPage) return;
                      e.stopPropagation();
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 90 : -90;
                      updateSelectedRotation((selectedPage.rotation || 0) + delta);
                    }}
                  >
                    <option value={0}>0° (Normal)</option>
                    <option value={90}>90° (Derecha)</option>
                    <option value={180}>180° (Invertido)</option>
                    <option value={270}>270° (Izquierda)</option>
                  </select>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {selectedPage ? `Giro actual: ${selectedPage.rotation || 0}°` : 'Selecciona una imagen'}
                </div>
              </div>
    
              {/* Per-Image Quantity */}
              <div>
                <label className="field-label">Cantidad de esta Imagen</label>
                <div className="input-row wheel-control" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="input-text"
                    min={1}
                    value={selectedPage ? (selectedPage.quantity || 1) : 1}
                    disabled={!selectedPage}
                    onChange={(e) => updateSelectedQuantity(parseInt(e.target.value) || 1)}
                    onWheel={(e) => {
                      if (!selectedPage) return;
                      e.stopPropagation();
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 1 : -1;
                      updateSelectedQuantity((selectedPage.quantity || 1) + delta);
                    }}
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      disabled={!selectedPage}
                      onClick={() => updateSelectedQuantity((selectedPage?.quantity || 1) + 1)}
                      title="Aumentar cantidad"
                    >▲</button>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      disabled={!selectedPage || (selectedPage?.quantity || 1) <= 1}
                      onClick={() => updateSelectedQuantity((selectedPage?.quantity || 1) - 1)}
                      title="Disminuir cantidad"
                    >▼</button>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Escribe o usa el scroll del mouse
                </div>
              </div>
            </div>
    
            <div className="sidebar-group">
              <span className="sidebar-title">PRECIOS Y TARIFAS</span>
    
              <div className="input-row">
                <div className="input-col">
                  <label className="field-label">Cargo Base ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.5"
                    value={costBase}
                    onChange={(e) => setCostBase(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div className="input-col">
                  <label className="field-label">Pág. B/N ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.1"
                    value={costBW}
                    onChange={(e) => setCostBW(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
    
              <div className="input-row">
                <div className="input-col">
                  <label className="field-label">B/N Alta Dens ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.5"
                    value={costBWHigh}
                    onChange={(e) => setCostBWHigh(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div className="input-col">
                  <label className="field-label">Pág. Color ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.5"
                    value={costColor}
                    onChange={(e) => setCostColor(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
    
              <div>
                <label className="field-label">Modelo de Cobro</label>
                <select className="input-select" value={pricingMode} onChange={(e) => setPricingMode(e.target.value as 'fixed' | 'smart')}>
                  <option value="fixed">Tarifa Fija (Estándar)</option>
                  <option value="smart">Tarifa Inteligente (Por Cobertura)</option>
                </select>
                <span style={{fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', lineHeight: '1.3'}}>
                  {pricingMode === 'fixed'
                    ? 'Se cobra precio fijo por color o B/N sin importar cuánta tinta se use.'
                    : 'Calcula una tarifa gradual con cobertura de tinta y porcentaje real de color.'
                  }
                </span>
              </div>
    
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    🧠 Escala B/N por Volumen
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 5px', borderRadius: '4px' }}>
                    {learningModel.total_corrections || 0} aprendidas
                  </span>
                </div>
    
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '10.5px' }}>
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>1 - 50 copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier1_rate ?? 1.00).toFixed(2)}</div>
                  </div>
    
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>51 - 100 copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier2_rate ?? 0.80).toFixed(2)}</div>
                  </div>
    
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>101 - 200 copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier3_rate ?? 0.50).toFixed(2)}</div>
                  </div>
    
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 201 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 201 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>201+ copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier4_rate ?? 0.40).toFixed(2)}</div>
                  </div>
                </div>
    
                {(learningModel.total_corrections || 0) > 0 && (
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ marginTop: '8px', width: '100%', padding: '4px', fontSize: '10px' }}
                    onClick={handleResetLearning}
                    title="Restablecer aprendizaje a tarifas originales"
                  >
                    ↺ Restablecer Aprendizaje IA
                  </button>
                )}
              </div>
            </div>
    
            {/* Multi-Mode Mobile Import Section */}
            <div className="qr-section">
              <span className="qr-title">📱 Importar desde Celular</span>
    
              {/* Mode Selector */}
              <div className="qr-mode-tabs" role="tablist">
                <button
                  type="button"
                  className={`qr-mode-tab ${connectionMode === 'hotspot' ? 'active' : ''}`}
                  onClick={() => setConnectionMode('hotspot')}
                  title="Envía archivos directamente sin necesidad de red Wi-Fi externa o internet"
                >
                  📶 Sin Wi-Fi
                </button>
                <button
                  type="button"
                  className={`qr-mode-tab ${connectionMode === 'wifi' ? 'active' : ''}`}
                  onClick={() => setConnectionMode('wifi')}
                  title="Celular y PC conectados a la misma red Wi-Fi local"
                >
                  🌐 Wi-Fi Local
                </button>
                <button
                  type="button"
                  className={`qr-mode-tab ${connectionMode === 'internet' ? 'active' : ''}`}
                  onClick={() => setConnectionMode('internet')}
                  title="Conexión remota por datos móviles (4G/5G) vía Internet"
                >
                  ☁️ Datos
                </button>
              </div>
    
              {/* MODO 1: HOTSPOT DIRECTO (SIN RED WI-FI) */}
              {connectionMode === 'hotspot' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div className="hotspot-status-box">
                    <div className="hotspot-badge-row">
                      <span>Punto de Acceso PC:</span>
                      <span className={`hotspot-badge ${hotspotInfo?.state === 'On' ? 'on' : 'off'}`}>
                        {hotspotInfo?.state === 'On' ? '● ACTIVA' : '○ INACTIVA'}
                      </span>
                    </div>
    
                    {hotspotInfo?.state === 'On' && hotspotInfo.ssid && (
                      <div style={{ fontSize: '9.5px', color: '#cbd5e1', lineHeight: '1.3' }}>
                        <div><strong>Red:</strong> {hotspotInfo.ssid}</div>
                        {hotspotInfo.password && <div><strong>Contraseña:</strong> {hotspotInfo.password}</div>}
                      </div>
                    )}
    
                    <button
                      type="button"
                      className="hotspot-toggle-btn"
                      onClick={handleToggleHotspot}
                      disabled={isTogglingHotspot}
                    >
                      {isTogglingHotspot
                        ? 'Cambiando estado...'
                        : hotspotInfo?.state === 'On'
                          ? 'Desactivar Zona Móvil'
                          : '⚡ Activar Zona Móvil de esta PC'}
                    </button>
                  </div>
    
                  {/* Paso 1 vs Paso 2 */}
                  <div className="hotspot-step-tabs">
                    <button
                      type="button"
                      className={`hotspot-step-btn ${hotspotStep === 'wifi' ? 'active' : ''}`}
                      onClick={() => setHotspotStep('wifi')}
                    >
                      1. Conectar Wi-Fi
                    </button>
                    <button
                      type="button"
                      className={`hotspot-step-btn ${hotspotStep === 'upload' ? 'active' : ''}`}
                      onClick={() => setHotspotStep('upload')}
                    >
                      2. Subir Archivos
                    </button>
                  </div>
    
                  {hotspotStep === 'wifi' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        className="qr-image-wrapper"
                        onClick={() => {
                          if (wifiConnectQr) {
                            setBigQrData({
                              title: 'Paso 1: Conectar al Wi-Fi de la PC',
                              subtitle: `Escanea con la cámara de tu teléfono para conectarte automáticamente a la red "${hotspotInfo?.ssid || 'de la PC'}". No requiere internet ni router externo.`,
                              qr: wifiConnectQr,
                              helpText: hotspotInfo?.password ? `Contraseña de red: ${hotspotInfo.password}` : undefined
                            });
                            setShowBigQrModal(true);
                          }
                        }}
                      >
                        {wifiConnectQr ? (
                          <img src={wifiConnectQr} className="qr-image" alt="QR Conectar Wi-Fi" />
                        ) : (
                          <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)' }}>
                            Activa la Zona Móvil
                          </div>
                        )}
                      </div>
                      <p className="qr-instructions">
                        <strong>Paso 1:</strong> Escanea para conectar el celular al Wi-Fi de la PC.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        className="qr-image-wrapper"
                        onClick={() => {
                          if (hotspotUploadQr) {
                            setBigQrData({
                              title: 'Paso 2: Subir Archivos a la PC',
                              subtitle: 'Abre la página web de subida en tu teléfono móvil para enviar tus fotos o documentos a imprimir.',
                              qr: hotspotUploadQr,
                              helpText: `Enlace directo: http://${hotspotIp}:3500${uploadRoute}`
                            });
                            setShowBigQrModal(true);
                          }
                        }}
                      >
                        {hotspotUploadQr ? (
                          <img src={hotspotUploadQr} className="qr-image" alt="QR Subir Archivos Hotspot" />
                        ) : (
                          <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}></div>
                        )}
                      </div>
                      <p className="qr-instructions">
                        <strong>Paso 2:</strong> Escanea para abrir la web y enviar archivos.
                      </p>
                    </div>
                  )}
                </div>
              )}
    
              {/* MODO 2: MISMA RED WI-FI LOCAL */}
              {connectionMode === 'wifi' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  <div
                    className="qr-image-wrapper"
                    onClick={() => {
                      if (wifiUploadQr) {
                        setBigQrData({
                          title: 'Subir desde la Misma Red Wi-Fi',
                          subtitle: 'Celular y computadora deben estar conectados a la misma red Wi-Fi o módem.',
                          qr: wifiUploadQr,
                          helpText: `Enlace local: http://${wifiIp || 'localhost'}:3500${uploadRoute}`
                        });
                        setShowBigQrModal(true);
                      }
                    }}
                  >
                    {wifiUploadQr ? (
                      <img src={wifiUploadQr} className="qr-image" alt="QR Wi-Fi Local" />
                    ) : (
                      <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)' }}>
                        Sin Wi-Fi detectado
                      </div>
                    )}
                  </div>
                  <p className="qr-instructions">
                    Escanea si tu celular y esta PC están en el <strong>mismo Wi-Fi</strong>.
                  </p>
                  <span className="qr-highlight-text">
                    IP: {wifiIp || 'No conectada'}
                  </span>
                </div>
              )}
    
              {/* MODO 3: INTERNET / DATOS MÓVILES */}
              {connectionMode === 'internet' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  <div
                    className="qr-image-wrapper"
                    onClick={() => {
                      if (tunnelUploadQr) {
                        setBigQrData({
                          title: 'Subir por Datos Móviles / Internet',
                          subtitle: 'Para clientes con datos móviles (4G/5G).',
                          qr: tunnelUploadQr,
                          helpText: tunnelPassword ? `Si la página solicita contraseña o IP, escribe: ${tunnelPassword}` : publicUploadUrl
                        });
                        setShowBigQrModal(true);
                      }
                    }}
                  >
                    {tunnelUploadQr ? (
                      <img src={tunnelUploadQr} className="qr-image" alt="QR Internet Túnel" />
                    ) : (
                      <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', padding: 8 }}>
                        Generando túnel público...
                      </div>
                    )}
                  </div>
                  <p className="qr-instructions">
                    Escanea desde cualquier red o datos móviles 4G/5G.
                  </p>
                  {tunnelPassword && (
                    <div style={{ fontSize: '9px', background: 'rgba(99,102,241,0.15)', padding: '3px 6px', borderRadius: '4px', color: '#c7d2fe', textAlign: 'center' }}>
                      Contraseña túnel: <strong>{tunnelPassword}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div
            className="sidebar-resizer"
            onPointerDown={handleSidebarResize}
            role="separator"
            aria-label="Redimensionar panel lateral"
            title="Arrastra para cambiar el ancho del panel"
          />
    
          {/* Main Panel Area */}
          <div className="main-content">
            <div className="header-nav">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scan')}
                >
                  🖥️ Escáner y Precios
                </button>
                <button
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('history');
                    fetchCorteDiario(); // Refrescar corte al entrar
                  }}
                >
                  📊 Corte Diario y Reporte
                </button>
              </div>
    
              <div className="server-status">
                <div className="status-dot"></div>
                <span>Servidor Móvil Activo (Puerto 3500)</span>
              </div>
            </div>
    
            {activeTab === 'scan' ? renderScanTab() : renderHistoryTab()}
          </div>
    
          {/* Ticket Modal popup */}
          {showTicketModal && activeTicketData && (
            <div className="modal-backdrop" onClick={() => setShowTicketModal(false)}>
              <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ticket-header">
                  <h2>COMPROBANTE</h2>
                  <p>YARS Smart Printer Pro</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
    
                <div className="ticket-divider"></div>
    
                <div className="ticket-body">
                  <div className="ticket-row bold">
                    <span>CONCEPTO</span>
                    <span>VALOR</span>
                  </div>
                  <div className="ticket-row">
                    <span style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {activeTicketData.archivo}
                    </span>
                    <span>#{activeTicketData.id}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Total de Hojas:</span>
                    <span>{activeTicketData.paginas}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Copias:</span>
                    <span>{activeTicketData.copias} x</span>
                  </div>
                  <div className="ticket-row">
                    <span>Subtotal Tinta:</span>
                    <span>${activeTicketData.costo_tinta.toFixed(2)}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Cargo Servicio Base:</span>
                    <span>${activeTicketData.costo_fijo.toFixed(2)}</span>
                  </div>
    
                  <div className="ticket-divider"></div>
    
                  <div className="ticket-row total-row">
                    <span>TOTAL:</span>
                    <span>${activeTicketData.total.toFixed(2)}</span>
                  </div>
                </div>
    
                <div className="ticket-divider"></div>
    
                <div className="ticket-qr">
                  <p style={{fontSize: '10px', color: '#4b5563', fontWeight: 600}}>Escanea para ver detalles en la base de datos</p>
                  {ticketQr && <img src={ticketQr} alt="Ticket QR" />}
                </div>
    
                <div className="ticket-footer">
                  <p>¡Gracias por su preferencia en nuestra Papelería!</p>
                </div>
    
                <div className="ticket-actions">
                  <button
                    className="button button-primary"
                    style={{flex: 1, padding: '10px', fontSize: '13px'}}
                    onClick={handlePhysicalPrint}
                  >
                    🖨️ IMPRIMIR TICKET
                  </button>
                  <button
                    className="button button-secondary"
                    style={{flex: 1, padding: '10px', fontSize: '13px'}}
                    onClick={() => setShowTicketModal(false)}
                  >
                    CERRAR
                  </button>
                </div>
              </div>
            </div>
          )}
    
          {/* Big QR Modal for Counter Customers */}
          {showBigQrModal && bigQrData && (
            <div className="modal-backdrop" onClick={() => setShowBigQrModal(false)}>
              <div className="big-qr-container" onClick={(e) => e.stopPropagation()}>
                <div className="big-qr-title">{bigQrData.title}</div>
                <div className="big-qr-subtitle">{bigQrData.subtitle}</div>
                <img src={bigQrData.qr} alt="Código QR Grande" className="big-qr-img" />
                {bigQrData.helpText && (
                  <div className="big-qr-note">
                    {bigQrData.helpText}
                  </div>
                )}
                <button
                  type="button"
                  className="button button-primary"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={() => setShowBigQrModal(false)}
                >
                  Cerrar Vista Grande
                </button>
              </div>
            </div>
          )}
    
          {/* Floating Toast Notification */}
          {toastMessage && (
            <div className={`toast-banner ${toastMessage.type}`}>
              <span>{toastMessage.type === 'error' ? '⚠️' : toastMessage.type === 'success' ? '✅' : 'ℹ️'}</span>
              <span>{toastMessage.text}</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 8, fontSize: 14 }}
                onClick={() => setToastMessage(null)}
              >×</button>
            </div>
          )}
        </div>
      );
    };
    
    export default App;
    
    :root {
      --bg-dark: #0b0f19;
      --bg-card: #151c2c;
      --bg-sidebar: #111827;
      --border-color: rgba(255, 255, 255, 0.08);
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-glow: rgba(99, 102, 241, 0.3);
      --success: #10b981;
      --success-hover: #059669;
      --success-glow: rgba(16, 185, 129, 0.2);
      --warning: #f59e0b;
      --danger: #ef4444;
      --danger-glow: rgba(239, 68, 68, 0.2);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      margin: 0;
      font-family: 'Outfit', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-primary);
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Custom Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .app-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: var(--bg-dark);
    }
    
    .sidebar-resizer {
      width: 7px;
      flex: 0 0 7px;
      margin-left: -4px;
      margin-right: -3px;
      z-index: 20;
      cursor: col-resize;
      background: transparent;
      transition: background-color 0.15s ease;
    }
    
    .sidebar-resizer:hover,
    .sidebar-resizer:active {
      background: rgba(99, 102, 241, 0.65);
    }
    
    .theme-toggle {
      margin-left: auto;
      width: 28px;
      height: 28px;
      border: 1px solid var(--border-color);
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 15px;
      line-height: 1;
    }
    
    .theme-toggle:hover {
      border-color: var(--primary);
      background: var(--primary-glow);
    }
    
    .app-container.light-theme {
      --bg-dark: #eef2f7;
      --bg-card: #ffffff;
      --bg-sidebar: #f8fafc;
      --border-color: rgba(15, 23, 42, 0.14);
      --text-primary: #172033;
      --text-secondary: #64748b;
      background: var(--bg-dark);
      color: var(--text-primary);
    }
    
    .app-container.light-theme .sidebar,
    .app-container.light-theme .main-content {
      background: var(--bg-dark);
    }
    
    .app-container.light-theme .sidebar {
      background: var(--bg-sidebar);
    }
    
    .app-container.light-theme .input-select option,
    .app-container.light-theme .input-select optgroup {
      background: #ffffff;
      color: #172033;
    }
    
    .app-container.light-theme .page-tile,
    .app-container.light-theme .cost-panel,
    .app-container.light-theme .loading-panel {
      background: #ffffff;
    }
    
    .app-container.light-theme .grid-title {
      background: var(--bg-dark);
    }
    
    .app-container.light-theme .canvas-area {
      background: #dfe6ef;
    }
    
    .app-container.light-theme .server-status {
      background-color: rgba(16, 185, 129, 0.1);
    }
    
    /* Sidebar Styling */
    .sidebar {
      width: 320px;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      flex-shrink: 0;
      z-index: 10;
    }
    
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .brand-logo {
      font-size: 24px;
      color: var(--primary);
      filter: drop-shadow(0 0 8px var(--primary-glow));
    }
    
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #fff 30%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .sidebar-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-secondary);
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .sidebar-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    /* Inputs and Selects */
    .field-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 6px;
      display: block;
    }
    
    .input-select, .input-text {
      width: 100%;
      background-color: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s ease;
      outline: none;
    }
    
    .input-select {
      color-scheme: dark;
    }
    
    .input-select option,
    .input-select optgroup {
      background-color: #1e293b;
      color: #f3f4f6;
    }
    
    .input-select:focus, .input-text:focus {
      border-color: var(--primary);
      background-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 2px var(--primary-glow);
    }
    
    .input-row {
      display: flex;
      gap: 12px;
    }
    
    .wheel-control {
      border-radius: 7px;
      transition: filter 0.2s ease;
    }
    
    .wheel-control:hover,
    .wheel-control:focus-within {
      filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.28));
    }
    
    .wheel-control:hover .input-text,
    .wheel-control:focus-within .input-text {
      border-color: rgba(99, 102, 241, 0.7);
    }
    
    .input-col {
      flex: 1;
    }
    
    /* QR Code Section */
    .qr-section {
      background: rgba(99, 102, 241, 0.05);
      border: 1px dashed rgba(99, 102, 241, 0.2);
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      margin-top: auto;
    }
    
    .qr-section span {
      font-size: 13px;
      font-weight: 600;
      color: #a5b4fc;
    }
    
    .qr-image {
      width: 140px;
      height: 140px;
      background: white;
      padding: 6px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    
    .qr-text {
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    
    /* Main Content Styling */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 24px;
      gap: 24px;
      overflow: hidden;
      background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 60%);
    }
    
    .header-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    
    .tabs {
      display: flex;
      background-color: rgba(255, 255, 255, 0.03);
      padding: 4px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
    }
    
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      padding: 8px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    
    .tab-btn:hover {
      color: var(--text-primary);
    }
    
    .tab-btn.active {
      background-color: var(--primary);
      color: white;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    
    .server-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      background-color: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 6px 14px;
      border-radius: 20px;
      color: var(--success);
      font-weight: 500;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    /* Workspace Layout */
    .workspace {
      flex: 1;
      display: flex;
      gap: 24px;
      overflow: hidden;
    }
    
    .workspace-left {
      flex: 3;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow: hidden;
    }
    
    .workspace-right {
      flex: 2;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow: hidden;
      min-width: 320px;
    }
    
    /* Drag and Drop Zone */
    .dropzone {
      border: 2px dashed var(--border-color);
      background: rgba(255, 255, 255, 0.01);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .dropzone:hover, .dropzone.drag-active {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.03);
      box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.05);
    }
    
    .dropzone-icon {
      font-size: 32px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    
    .dropzone-text {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .dropzone-subtext {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    /* Loading Panel */
    .loading-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Previews Grid */
    .grid-container {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      background-color: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
    }
    
    .grid-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .clear-btn {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .clear-btn:hover {
      text-decoration: underline;
    }
    
    .previews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 14px;
    }
    
    .page-tile {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .page-tile:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .page-tile.selected {
      border-color: var(--primary);
      background-color: rgba(99, 102, 241, 0.05);
      box-shadow: 0 0 0 2px var(--primary-glow);
    }
    
    .tile-thumb-container {
      width: 100%;
      aspect-ratio: 3/4;
      background-color: rgba(0,0,0,0.2);
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .tile-thumb {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .tile-info {
      width: 100%;
      font-size: 11px;
      text-align: center;
    }
    
    .tile-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    
    .tile-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    
    .badge-color {
      background-color: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
    }
    
    .badge-bw {
      background-color: rgba(255,255,255,0.06);
      color: var(--text-secondary);
    }
    
    .badge-bw-high {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }
    
    /* Paper Viewport (Center Panel) */
    .canvas-area {
      flex: 1;
      background-color: rgba(0,0,0,0.3);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 20px;
    }
    
    .paper {
      background: white;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .paper-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .paper-empty {
      color: var(--text-secondary);
      font-size: 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .paper-empty-icon {
      font-size: 40px;
      color: rgba(255,255,255,0.1);
    }
    
    .paper-overlay {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 10px 14px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 5;
    }
    
    .overlay-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .overlay-title {
      font-size: 12px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }
    
    .overlay-meta {
      font-size: 10px;
      color: var(--text-secondary);
    }
    
    /* Cost Calculation Panel */
    .cost-panel {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    
    .cost-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .cost-row.highlight {
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .cost-divider {
      height: 1px;
      background-color: var(--border-color);
    }
    
    .cost-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    
    .cost-total-label {
      font-size: 15px;
      font-weight: 700;
      color: white;
    }
    
    .cost-total-value {
      font-size: 32px;
      font-weight: 800;
      color: var(--success);
      filter: drop-shadow(0 0 8px var(--success-glow));
    }
    
    /* Buttons */
    .button {
      width: 100%;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .button-primary {
      background-color: var(--primary);
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    
    .button-primary:hover {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }
    
    .button-success {
      background-color: var(--success);
      color: white;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
    }
    
    .button-success:hover {
      background-color: var(--success-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }
    
    .button-secondary {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    
    .button-secondary:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
    
    /* History / Daily Sales Tab */
    .history-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow: hidden;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .stat-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      font-weight: 600;
    }
    
    .stat-value {
      font-size: 26px;
      font-weight: 800;
      color: white;
    }
    
    .stat-value.primary { color: var(--primary); }
    .stat-value.success { color: var(--success); }
    
    .table-container {
      flex: 1;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow-y: auto;
    }
    
    .sales-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    
    .sales-table th {
      background-color: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border-color);
      padding: 14px 16px;
      font-weight: 600;
      color: var(--text-secondary);
      position: sticky;
      top: 0;
      z-index: 1;
    }
    
    .sales-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }
    
    .sales-table tr:hover {
      background-color: rgba(255, 255, 255, 0.01);
    }
    
    .table-file-name {
      font-weight: 500;
      max-width: 250px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .table-date {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .action-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
    }
    
    .action-link:hover {
      text-decoration: underline;
    }
    
    /* Modal Popup (Receipt / Ticket) */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    
    .ticket-modal {
      background-color: white;
      color: #111827;
      width: 320px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .ticket-actions {
      display: flex;
      gap: 10px;
      width: 100%;
    }
    
    .ticket-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    
    .ticket-header h2 {
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .ticket-header p {
      font-size: 11px;
      color: #6b7280;
    }
    
    .ticket-divider {
      border-bottom: 1.5px dashed #d1d5db;
      margin: 4px 0;
    }
    
    .ticket-body {
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .ticket-row {
      display: flex;
      justify-content: space-between;
    }
    
    .ticket-row.bold {
      font-weight: 700;
      font-size: 13px;
      color: #111827;
    }
    
    .ticket-row.total-row {
      font-size: 16px;
      font-weight: 800;
      color: #111827;
      padding-top: 6px;
      border-top: 1px solid #e5e7eb;
    }
    
    .ticket-qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
    
    .ticket-qr img {
      width: 130px;
      height: 130px;
    }
    
    .ticket-footer {
      text-align: center;
      font-size: 10px;
      color: #6b7280;
      font-style: italic;
    }
    
    /* Compact workstation layout matching the original PrintStudio Pro UI */
    .sidebar {
      width: 252px;
      padding: 16px;
      gap: 16px;
      overflow-y: auto;
      min-width: 220px;
      max-width: 380px;
      background: #0f172a;
    }
    
    .brand-section {
      gap: 9px;
      padding-bottom: 12px;
    }
    
    .brand-section .brand-image {
      width: 32px !important;
      height: 32px !important;
      border-radius: 7px;
      margin-right: 0 !important;
    }
    
    .brand-name {
      font-size: 15px;
      letter-spacing: -0.35px;
    }
    
    .sidebar-title {
      font-size: 10px;
      letter-spacing: 1px;
    }
    
    .sidebar-group {
      gap: 8px;
    }
    
    .field-label {
      font-size: 11px;
      margin-bottom: 4px;
      color: #d1d5db;
    }
    
    .input-select,
    .input-text {
      padding: 7px 9px;
      border-radius: 6px;
      font-size: 12px;
    }
    
    .input-select option:checked,
    .input-select option:hover {
      background-color: #4f46e5;
      color: #ffffff;
    }
    
    .print-mode-control {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .print-mode-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 4px;
    }
    
    .print-mode-button {
      min-width: 0;
      padding: 7px 4px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-secondary);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    
    .print-mode-button:hover {
      border-color: rgba(99, 102, 241, 0.7);
      color: var(--text-primary);
    }
    
    .print-mode-button.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--primary);
      color: #ffffff;
      box-shadow: 0 0 0 1px var(--primary-glow);
    }
    
    .print-mode-button.color.active {
      background: rgba(99, 102, 241, 0.22);
    }
    
    .print-mode-button.bw.active {
      background: rgba(148, 163, 184, 0.22);
    }
    
    .print-mode-help {
      color: var(--text-secondary);
      font-size: 10px;
      line-height: 1.25;
    }
    
    .main-content {
      padding: 10px 16px 16px;
      gap: 12px;
      background: #111827;
      min-width: 0;
    }
    
    .header-nav {
      min-height: 34px;
    }
    
    .tabs {
      padding: 2px;
      border-radius: 6px;
    }
    
    .tab-btn {
      padding: 6px 11px;
      border-radius: 5px;
      font-size: 11px;
    }
    
    .server-status {
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
    }
    
    .workspace {
      gap: 12px;
    }
    
    .workspace-left {
      flex: 1.35;
      gap: 10px;
    }
    
    .workspace-right {
      flex: 1;
      min-width: 300px;
      gap: 10px;
    }
    
    .dropzone {
      padding: 14px;
      border-radius: 7px;
      gap: 5px;
    }
    
    .dropzone-icon {
      font-size: 24px;
    }
    
    .dropzone-text {
      font-size: 12px;
    }
    
    .dropzone-subtext {
      font-size: 10px;
    }
    
    .grid-container {
      padding: 6px;
      border-radius: 7px;
      background: transparent;
    }
    
    .grid-title {
      margin: 0 4px 6px;
      font-size: 10px;
    }
    
    .previews-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .page-tile {
      min-height: 142px;
      padding: 9px 10px;
      border-radius: 7px;
      display: grid;
      grid-template-columns: 98px minmax(0, 1fr);
      grid-template-rows: auto 1fr;
      column-gap: 10px;
      align-items: start;
      background: #1e293b;
      border-color: rgba(148, 163, 184, 0.22);
    }
    
    .page-tile:hover {
      transform: none;
      border-color: rgba(99, 102, 241, 0.7);
    }
    
    .tile-header {
      grid-column: 1 / -1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 7px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
    }
    
    .tile-header .tile-name {
      min-width: 0;
      margin: 0;
      text-align: left;
      font-size: 11px;
    }
    
    .tile-file-icon {
      color: #e5e7eb;
      margin-right: 5px;
    }
    
    .tile-page-count {
      color: var(--text-secondary);
      font-size: 10px;
      font-weight: 400;
      margin-left: 4px;
    }
    
    .tile-copy-control {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-secondary);
      font-size: 10px;
    }
    
    .tile-copy-button {
      width: 18px;
      height: 18px;
      padding: 0;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 3px;
      background: rgba(15, 23, 42, 0.6);
      color: var(--text-primary);
      cursor: pointer;
      line-height: 16px;
    }
    
    .tile-copy-button:hover {
      border-color: var(--primary);
      color: white;
    }
    
    .tile-thumb-container {
      grid-column: 1;
      grid-row: 2;
      width: 104px;
      height: 88px;
      aspect-ratio: auto;
      border-radius: 5px;
      background: white;
    }
    
    .tile-info {
      grid-column: 2;
      grid-row: 2;
      min-width: 0;
      align-self: start;
      text-align: left;
      font-size: 10px;
      padding-top: 2px;
    }
    
    .tile-type {
      color: #e5e7eb;
      font-size: 10px;
      margin-bottom: 4px;
    }
    
    .tile-info > div[style] {
      justify-content: flex-start !important;
    }
    
    .tile-price {
      margin-top: 8px;
      color: #34d399;
      font-weight: 700;
      font-size: 12px;
    }
    
    .tile-remove {
      position: absolute;
      top: 8px;
      right: 8px;
      border: 0;
      background: transparent;
      color: #64748b;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
    }
    
    .tile-remove:hover {
      color: #f87171;
    }
    
    .cost-panel {
      padding: 12px;
      border-radius: 7px;
      gap: 9px;
    }
    
    .grid-title {
      position: sticky;
      top: -6px;
      z-index: 2;
      padding: 5px 4px;
      background: #111827;
    }
    
    @media (max-width: 900px) {
      .sidebar-resizer {
        display: none;
      }
    }
    
    .cost-row {
      font-size: 11px;
    }
    
    .cost-total-value {
      font-size: 23px;
    }
    
    .button {
      padding: 9px 14px;
      border-radius: 6px;
      font-size: 12px;
    }
    
    .qr-section {
      padding: 12px;
      border-radius: 8px;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .qr-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #e2e8f0;
    }
    
    .qr-mode-tabs {
      display: flex;
      width: 100%;
      gap: 3px;
      background: rgba(0, 0, 0, 0.3);
      padding: 2px;
      border-radius: 6px;
    }
    
    .qr-mode-tab {
      flex: 1;
      padding: 5px 2px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 9.5px;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    
    .qr-mode-tab:hover {
      color: #fff;
    }
    
    .qr-mode-tab.active {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 1px 4px var(--primary-glow);
    }
    
    .hotspot-status-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(0, 0, 0, 0.25);
      padding: 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .hotspot-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
    }
    
    .hotspot-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 600;
    }
    
    .hotspot-badge.on {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    
    .hotspot-badge.off {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    .hotspot-toggle-btn {
      width: 100%;
      padding: 5px 8px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 600;
      border: 1px solid var(--border-color);
      background: rgba(99, 102, 241, 0.15);
      color: #c7d2fe;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .hotspot-toggle-btn:hover {
      background: var(--primary);
      color: #fff;
    }
    
    .hotspot-step-tabs {
      display: flex;
      width: 100%;
      gap: 3px;
      margin-top: 2px;
    }
    
    .hotspot-step-btn {
      flex: 1;
      padding: 4px;
      font-size: 9.5px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-secondary);
      cursor: pointer;
    }
    
    .hotspot-step-btn.active {
      background: rgba(99, 102, 241, 0.3);
      border-color: var(--primary);
      color: #fff;
      font-weight: 600;
    }
    
    .qr-image-wrapper {
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .qr-image-wrapper:hover {
      transform: scale(1.03);
    }
    
    .qr-image-wrapper:hover::after {
      content: '🔍 Agrandar';
      position: absolute;
      bottom: 4px;
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .qr-image {
      width: 124px;
      height: 124px;
      border-radius: 6px;
      background: white;
      padding: 4px;
    }
    
    .qr-instructions {
      font-size: 10px;
      color: var(--text-secondary);
      text-align: center;
      line-height: 1.35;
      margin: 0;
    }
    
    .qr-highlight-text {
      font-size: 10px;
      color: #a5b4fc;
      font-weight: 600;
      text-align: center;
      word-break: break-all;
    }
    
    /* Big QR Modal for Customers */
    .big-qr-container {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      max-width: 440px;
      width: 90%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
      text-align: center;
      animation: slideUp 0.25s ease;
    }
    
    .big-qr-title {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
    }
    
    .big-qr-subtitle {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.4;
    }
    
    .big-qr-img {
      width: 260px;
      height: 260px;
      background: white;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    
    .big-qr-note {
      font-size: 12px;
      color: #cbd5e1;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      padding: 8px 12px;
      border-radius: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    
    /* Toast Banner */
    .toast-banner {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      animation: slideUp 0.25s ease;
    }
    
    .toast-banner.error {
      background: #7f1d1d;
      color: #fecaca;
      border: 1px solid #dc2626;
    }
    
    .toast-banner.success {
      background: #064e3b;
      color: #a7f3d0;
      border: 1px solid #059669;
    }
    
    .toast-banner.info {
      background: #1e1b4b;
      color: #c7d2fe;
      border: 1px solid #4f46e5;
    }
    
    @media (max-width: 900px) {
      .sidebar {
        width: 230px;
        padding: 12px;
      }
    
      .workspace {
        flex-direction: column;
        overflow-y: auto;
      }
    
      .workspace-left,
      .workspace-right {
        min-height: 360px;
        flex: none;
      }
    }
    
    
    ✓ • 1.83s

## Activity

    $ rtk pwsh -Command "Write-Output ('init=' + (Test-Path '.superdesign/init')); Get-ChildItem '.superdesign/init' -ErrorAction SilentlyContinue | Select-Object Name,Length; Write-Output ('resume=' + (Test-Path '.superdesign/resume.json'))"; rtk rg -n "function |const |useState|calculate|cost|price|correction|learning|QR|qr|preview|printDocument|savePrice" src/App.tsx database.js index.js server.js preload.js
    init=False
    resume=False
    500 matches in 5 files:
    
    database.js:1:const Database = require('better-sqlite3');
    database.js:2:const path = require('path');
    database.js:3:const fs = require('fs');
    database.js:7:const dbDir = path.join(userDataPath, 'data');
    database.js:23:costo_tinta REAL,
    database.js:24:costo_fijo REAL,
    database.js:54:const defaults = {
    database.js:61:cost_bw_high: 2.00,
    database.js:62:cost_base: 0.00,
    database.js:64:total_corrections: 0
    database.js:67:const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM modelo_apren...
    database.js:69:const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje...
    database.js:70:for (const [k, v] of Object.entries(defaults)) {
    database.js:77:const stmt = this.db.prepare(`
    database.js:78:INSERT INTO ventas (archivo, paginas, copias, costo_tinta, costo_fijo, total,...
    database.js:85:datos.costo_tinta || 0,
    database.js:86:datos.costo_fijo || 0,
    database.js:94:const rows = this.db.prepare(`
    database.js:96:SUM(costo_tinta) as total_tinta,
    database.js:107:SELECT id, archivo, fecha, paginas, copias, costo_tinta, costo_fijo, total, t...
    database.js:115:const rows = this.db.prepare('SELECT clave, valor FROM modelo_aprendizaje').a...
    database.js:116:const model = {};
    database.js:117:for (const row of rows) {
    database.js:124:const precioCalculado = Math.max(0.01, parseFloat(datos.precio_calculado) || 0);
    database.js:125:const precioCorregido = Math.max(0, parseFloat(datos.precio_corregido) || 0);
      +27 more in database.js
    index.js:1:const { app, BrowserWindow, ipcMain, dialog } = require('electron');
    index.js:2:const path = require('path');
    index.js:3:const fs = require('fs');
    index.js:4:const os = require('os');
    index.js:5:const qrcode = require('qrcode');
    index.js:6:const { execFile } = require('child_process');
    index.js:8:const GestorDB = require('./database');
    index.js:9:const AnalizadorColor = require('./analysis');
    index.js:10:const startRemoteServer = require('./server');
    index.js:11:const localtunnel = require('localtunnel');
    index.js:12:const crypto = require('crypto');
    index.js:13:const generateTicketHTML = require('./ticket_generator');
    index.js:31:const SERVER_PORT = 3500;
    index.js:33:function getNetworkDetails() {
    index.js:34:const interfaces = os.networkInterfaces();
    index.js:40:for (const devName in interfaces) {
    index.js:41:const lowerName = devName.toLowerCase();
    index.js:47:const iface = interfaces[devName];
    index.js:48:for (const alias of iface) {
    index.js:75:const preferred = wifiIp || lanIp || hotspotIp || fallbackIp || 'localhost';
    index.js:84:function createWindow() {
    index.js:96:const isDev = !app.isPackaged;
    index.js:109:const uploadDir = path.join(app.getPath('userData'), 'uploads');
    index.js:110:const tempDir = path.join(app.getPath('userData'), 'temp');
    index.js:117:const files = fs.readdirSync(tempDir);
      +70 more in index.js
    preload.js:1:const { contextBridge, ipcRenderer, webUtils } = require('electron');
    preload.js:10:generateQR: (text) => ipcRenderer.invoke('generate-qr', text),
    preload.js:17:printDocument: (jobData) => ipcRenderer.invoke('print-document', jobData),
    preload.js:18:getLearningModel: () => ipcRenderer.invoke('get-learning-model'),
    preload.js:19:savePriceCorrection: (correctionData) => ipcRenderer.invoke('save-price-corre...
    preload.js:20:resetLearningModel: () => ipcRenderer.invoke('reset-learning-model'),
    server.js:1:const express = require('express');
    server.js:2:const multer = require('multer');
    server.js:3:const path = require('path');
    server.js:4:const cors = require('cors');
    server.js:5:const fs = require('fs');
    server.js:7:function startRemoteServer(port, uploadDir, userDataDir, onFileReceived, allo...
    server.js:8:const app = express();
    server.js:19:const storage = multer.diskStorage({
    server.js:24:const ext = path.extname(file.originalname).toLowerCase();
    server.js:25:const base = path.basename(file.originalname, ext)
    server.js:32:const upload = multer({
    server.js:39:const allowedExts = [
    server.js:43:const ext = path.extname(file.originalname).toLowerCase();
    server.js:44:const isImage = file.mimetype && file.mimetype.startsWith('image/');
    server.js:45:const isPdf = file.mimetype === 'application/pdf';
    server.js:46:const isOffice = [
    server.js:69:const serveUploadPage = (req, res) => {
    server.js:70:const uploadRoute = allowedToken ? `/upload/${allowedToken}` : '/upload';
    server.js:71:const htmlPath = path.join(__dirname, 'upload_client.html');
    server.js:75:const configScript = `<script>window.__UPLOAD_ROUTE__ = "${uploadRoute}"; win...
    server.js:92:const uploadRoute = allowedToken ? `/upload/${allowedToken}` : '/upload';
    server.js:94:const handleUploadPost = (req, res) => {
    server.js:126:const server = app.listen(port, '0.0.0.0', () => {
    src/App.tsx:1:import React, { useState, useEffect } from 'react';
    src/App.tsx:30:generateQR: (text: string) => Promise<string>;
    src/App.tsx:37:printDocument: (jobData: any) => Promise<any>;
    src/App.tsx:39:savePriceCorrection: (correctionData: any) => Promise<any>;
    src/App.tsx:65:const App: React.FC = () => {
    src/App.tsx:67:const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
    src/App.tsx:68:const [theme, setTheme] = useState<'dark' | 'light'>(() => (
    src/App.tsx:73:const [costBase, setCostBase] = useState<number>(() => Number(localStorage.ge...
    src/App.tsx:74:const [costBW, setCostBW] = useState<number>(() => Number(localStorage.getIte...
    src/App.tsx:75:const [costBWHigh, setCostBWHigh] = useState<number>(() => Number(localStorag...
    src/App.tsx:76:const [costColor, setCostColor] = useState<number>(() => Number(localStorage....
    src/App.tsx:77:const [pricingMode, setPricingMode] = useState<'fixed' | 'smart'>(() => (loca...
    src/App.tsx:78:const [printColorMode, setPrintColorMode] = useState<'auto' | 'color' | 'bw'>(
    src/App.tsx:83:const [learningModel, setLearningModel] = useState<{
    src/App.tsx:89:cost_bw_high: number;
    src/App.tsx:90:cost_base: number;
    src/App.tsx:92:total_corrections: number;
    src/App.tsx:99:cost_bw_high: 2.00,
    src/App.tsx:100:cost_base: 0.00,
    src/App.tsx:102:total_corrections: 0
    src/App.tsx:106:const [correctedTotal, setCorrectedTotal] = useState<number | null>(null);
    src/App.tsx:107:const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
    src/App.tsx:108:const [priceCorrectionInput, setPriceCorrectionInput] = useState<string>('');
    src/App.tsx:111:const [connectionMode, setConnectionMode] = useState<'hotspot' | 'wifi' | 'in...
    src/App.tsx:112:const [hotspotStep, setHotspotStep] = useState<'wifi' | 'upload'>('wifi');
      +299 more in src/App.tsx
    ✓ • 2.53s

## Activity

    $ rtk pwsh -Command "New-Item -ItemType Directory -Force '.superdesign/init' | Out-Null; Get-Content -Raw 'C:\Users\yahel\.codex\plugins\cache\openai-curated-remote\superdesign\0.6.0\skills\superdesign\references\INIT.md'"; rtk pwsh -Command "$p='src/App.tsx'; Get-Content $p | Select-Object -First 260"; rtk pwsh -Command "$p='src/App.tsx'; Get-Content $p | Select-Object -Skip 260 -First 300"
    You are performing a **Superdesign Init** — analyzing this repository to build UI context files that Superdesign agent will use for design tasks.
    
    ## Output Directory
    Write all files to `.superdesign/init/` in the project root.
    
    Init creates repository discovery artifacts only. It does not know the remote project, draft ids, final payload-budgeted context bundle, or extracted project components, so it MUST NOT create `.superdesign/resume.json`. The first successful UI draft/iteration writes that durable state per [RESUME.md](RESUME.md). If a full init is regenerated later, treat existing target resume entries as needing freshness validation before their next generation; preserve their project/draft ids while refreshing only affected context.
    
    ## Analysis Steps
    
    ### 1. Detect Framework & Component Library
    Scan `package.json`, config files (`next.config.*`, `vite.config.*`, `rsbuild.config.*`, `nuxt.config.*`, etc.), and import patterns to determine:
    - Framework: React, Vue, Svelte, Angular, etc.
    - Meta-framework: Next.js, Nuxt, Remix, Astro, etc.
    - Component library: shadcn/ui, Ant Design, MUI, Chakra, Radix, custom, etc.
    - CSS approach: Tailwind, CSS Modules, styled-components, vanilla CSS, etc.
    
    ### 2. Write `components.md`
    Identify the project's shared/reusable UI component directory (e.g., `src/components/ui/`, `components/`, `packages/ui/`).
    
    **IMPORTANT**: Include FULL source code for each component, not just descriptions. Superdesign needs the actual implementation to reproduce accurately.
    
    For each component, include:
    - File path
    - Component name
    - Brief description (1 line)
    - Key props if obvious from the export
    - **FULL source code** in fenced code blocks
    
    Focus on **shared UI primitives** (Button, Input, Dialog, Card, Select, Checkbox, Table, Tabs, etc.), not page-specific components.
    
    This file should contain the ACTUAL CODE of components, not just a list of names.
    
    ### 3. Write `layouts.md`
    Find and READ all shared layout components. These are the components that appear on every page or across multiple pages:
    - App shell / root layout
    - Navigation bar (top nav, bottom nav)
    - Sidebar
    - Header / top bar
    - Footer
    - Breadcrumb
    - Layout wrappers / HOCs
    
    For each, include:
    - File path
    - Full source code (copy the entire file content)
    - Brief description of what it renders
    
    This is critical — Superdesign needs the actual layout code to reproduce pages accurately.
    
    ### 4. Write `routes.md`
    Map out the page/route structure:
    - For file-based routing (Next.js, Nuxt): list route files and their paths
    - For config-based routing (React Router, Vue Router): read the router config
    - For each route, include: URL path, component file path, layout used
    - Include the FULL router config file if it exists (e.g., `router/index.ts`, `routes.ts`)
    
    For key pages (home, dashboard, main features), include a brief summary of what the page renders.
    
    ### 5. Write `theme.md`
    Extract the design system / theme tokens. Structure the file in **two parts, in this order**:
    
    **Part 1 — Compact token summary (at the TOP).** A concise, readable digest of the actual values: the color palette (token name → value, incl. `:root` and `.dark`), font families and type scale, spacing scale, border-radius, shadows, and breakpoints. This summary is the budget-friendly context the design flow reaches for first — the PAYLOAD BUDGET rule in [SUPERDESIGN.md](SUPERDESIGN.md) points here to avoid passing a giant `globals.css` whole. Keep it tight enough to pass as context on its own.
    
    **Part 2 — Raw source dumps (BELOW the summary).** The complete raw files in fenced code blocks, for when the full source is needed:
    - Full `tailwind.config.ts/js` content (especially `theme.extend`)
    - Full `globals.css` / `index.css` content
    - Full CSS variable definitions (`:root`, `[data-theme]`, etc.)
    - Any theme provider files and design token files
    
    ### 6. Write `pages.md`
    For each key page/route in the app (home, dashboard, main features — up to 10 pages), build a **complete component dependency tree** by tracing imports recursively.
    
    For each page:
    1. Start from the page component file
    2. Trace ALL local imports (relative `./Foo`, `../Bar`, alias `@/components/Baz` — skip node_modules)
    3. For each import, trace ITS imports recursively
    4. Present as an indented tree showing every file the page depends on
    
    Format:
    ```
    ## / (Home Page)
    Entry: src/app/(home)/home-page.tsx
    Dependencies:
    - src/components/home-ui/elegant-header.tsx
      - src/components/team/create-team-modal.tsx
    - src/components/home-ui/elegant-hero-section.tsx
      - src/components/home-ui/home-hero-input.tsx
      - src/components/home-ui/persona-selector.tsx
      - src/components/home-ui/dev-workflow-view.tsx
      - src/components/home-ui/import-site-modal.tsx
    - src/components/home-ui/elegant-project-grid.tsx
      - src/components/home-ui/elegant-project-card.tsx
    - src/app/(home)/components/template-browse-section.tsx
      - src/app/(home)/components/template-card.tsx
    - src/components/layout/Footer.tsx
    ```
    
    This tree is the **candidate set** of files to pass as `--context-file` when designing a page — the starting point for context selection. It is not an unconditional include-everything list: apply the PAYLOAD BUDGET rules in [SUPERDESIGN.md](SUPERDESIGN.md) when selecting, so the payload does not 400.
    
    Prioritize the most important/complex pages (home, dashboard, settings, etc.). Skip trivial pages (404, offline, status).
    
    ### 7. Write `extractable-components.md`
    Catalog UI components from the codebase that **can be extracted** as reusable Superdesign `DraftComponent` entities. These are components that appear on multiple pages or define shared UI patterns (navigation, cards, headers, footers).
    
    Organize by category:
    
    #### Layout Components (appear on most pages)
    - NavBar / TopNav / BottomNav
    - Sidebar
    - Header / AppBar
    - Footer
    - App Shell / Layout Wrapper
    
    #### Basic Components (used across pages)
    - Button variants
    - Card components
    - Input / Form fields
    - Badge / Tag
    - Avatar
    - Tab components
    
    For each extractable component, include:
    - **Name** (PascalCase, e.g., `NavBar`, `HeroSection`)
    - **Source file path** (e.g., `src/components/layout/NavBar.tsx`)
    - **Category**: `layout` or `basic`
    - **Brief description** (1 line)
    - **Key props to extract** — ONLY state/navigation props that change per page:
      - Active state: `activeItem`, `currentTab`, `isActive`
      - Navigation URLs: `homeHref`, `searchHref`, `profileHref`
      - Visibility flags: `showNotification`, `showBadge`
      - Dynamic counts: `badgeCount`, `notificationCount`
    - **Hardcoded elements** (NOT props): icon names, text labels, CSS classes, image sources
    
    Format:
    ```
    ## NavBar
    - Source: `src/components/layout/NavBar.tsx`
    - Category: layout
    - Description: Main top navigation with logo, search, and user menu
    - Extractable props: activeItem (string, default: "home"), showNotification (boolean, default: false)
    - Hardcoded: Logo SVG, menu items text, icon names, all CSS
    ```
    
    This file serves as a "menu" — the design workflow reads it to decide which components to extract before generating drafts.
    
    ## Format Guidelines
    - Use markdown with clear headings
    - Include file paths as code spans
    - **For `components.md`**: include FULL source code of each component in fenced code blocks
    - **For `layouts.md`**: include FULL file contents in fenced code blocks
    - **For `theme.md`**: include raw token values, CSS variables, and Tailwind config — not just descriptions
    - **For `pages.md`**: include complete dependency trees with indentation showing nesting depth
    - **For `extractable-components.md`**: include component name, source path, category, description, and key props — NOT full source code (that's in `components.md` and `layouts.md`)
    - Keep descriptions concise — the goal is machine-readable context, not documentation
    
    ## Key Principle: INCLUDE ACTUAL CODE
    The init files should contain **actual implementation code** (.tsx, .css, .ts), not just documentation or descriptions. Superdesign needs real code to reproduce UI accurately. Be thorough and complete for the key pages and shared UI — but bounded and deduplicated, not padded. These files are the discovery layer; the actual design calls pass only the target page's necessary context under the PAYLOAD BUDGET (see [SUPERDESIGN.md](SUPERDESIGN.md)), so oversized dumps just raise reader/token cost without helping.
    
    =src/App.tsx: The term '=src/App.tsx' is not recognized as a name of a cmdlet, function, script file, or executable program.
    Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
    Get-Content: Cannot process command because of one or more missing mandatory parameters: Path.
    =src/App.tsx: The term '=src/App.tsx' is not recognized as a name of a cmdlet, function, script file, or executable program.
    Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
    Get-Content: Cannot process command because of one or more missing mandatory parameters: Path.
    ✗ (1) • 7.26s

## Activity

    $ rtk npx --yes @superdesign/cli@latest; rtk pwsh -Command "if (Test-Path '.superdesign/resume.json') { Get-Content -Raw '.superdesign/resume.json' }; Get-ChildItem '.superdesign/init' -ErrorAction SilentlyContinue | Select-Object Name,Length"; rtk pwsh -Command "Get-Content -Raw 'C:\Users\yahel\.codex\plugins\cache\openai-curated-remote\superdesign\0.6.0\skills\superdesign\references\INIT.md'; Get-Content -Raw 'C:\Users\yahel\.codex\plugins\cache\openai-curated-remote\superdesign\0.6.0\skills\superdesign\references\SUPERDESIGN.md'"
    npm error code EACCES
    npm error errno EACCES
    npm error FetchError: request to https://registry.npmjs.org/@superdesign%2fcli failed, reason:
    npm error     at ClientRequest.<anonymous> (C:\Users\yahel\AppData\Roaming\npm\node_modules\npm\node_modules\minipass-fetch\lib\index.js:130:14)
    npm error     at ClientRequest.emit (node:events:508:20)
    npm error     at emitErrorEvent (node:_http_client:109:11)
    npm error     at _destroy (node:_http_client:993:9)
    npm error     at onSocketNT (node:_http_client:1013:5)
    npm error     at process.processTicksAndRejections (node:internal/process/task_queues:91:21) {
    npm error   code: 'EACCES',
    npm error   errno: 'EACCES',
    npm error   type: 'system'
    npm error }
    npm error
    npm error The operation was rejected by your operating system.
    npm error It's possible that the file was already in use (by a text editor or antivirus), or that you lack permissions to access it.
    npm error
    npm error If you believe this might be a permissions issue, please double-check the permissions of the file and its containing directories, or try running the command again as root/Administrator.
    npm error Log files were not written due to an error writing to the directory: C:\Users\yahel\AppData\Local\npm-cache\_logs
    npm error You can rerun the command with `--loglevel=verbose` to see the logs in your terminal
    You are performing a **Superdesign Init** — analyzing this repository to build UI context files that Superdesign agent will use for design tasks.
    
    ## Output Directory
    Write all files to `.superdesign/init/` in the project root.
    
    Init creates repository discovery artifacts only. It does not know the remote project, draft ids, final payload-budgeted context bundle, or extracted project components, so it MUST NOT create `.superdesign/resume.json`. The first successful UI draft/iteration writes that durable state per [RESUME.md](RESUME.md). If a full init is regenerated later, treat existing target resume entries as needing freshness validation before their next generation; preserve their project/draft ids while refreshing only affected context.
    
    ## Analysis Steps
    
    ### 1. Detect Framework & Component Library
    Scan `package.json`, config files (`next.config.*`, `vite.config.*`, `rsbuild.config.*`, `nuxt.config.*`, etc.), and import patterns to determine:
    - Framework: React, Vue, Svelte, Angular, etc.
    - Meta-framework: Next.js, Nuxt, Remix, Astro, etc.
    - Component library: shadcn/ui, Ant Design, MUI, Chakra, Radix, custom, etc.
    - CSS approach: Tailwind, CSS Modules, styled-components, vanilla CSS, etc.
    
    ### 2. Write `components.md`
    Identify the project's shared/reusable UI component directory (e.g., `src/components/ui/`, `components/`, `packages/ui/`).
    
    **IMPORTANT**: Include FULL source code for each component, not just descriptions. Superdesign needs the actual implementation to reproduce accurately.
    
    For each component, include:
    - File path
    - Component name
    - Brief description (1 line)
    - Key props if obvious from the export
    - **FULL source code** in fenced code blocks
    
    Focus on **shared UI primitives** (Button, Input, Dialog, Card, Select, Checkbox, Table, Tabs, etc.), not page-specific components.
    
    This file should contain the ACTUAL CODE of components, not just a list of names.
    
    ### 3. Write `layouts.md`
    Find and READ all shared layout components. These are the components that appear on every page or across multiple pages:
    - App shell / root layout
    - Navigation bar (top nav, bottom nav)
    - Sidebar
    - Header / top bar
    - Footer
    - Breadcrumb
    - Layout wrappers / HOCs
    
    For each, include:
    - File path
    - Full source code (copy the entire file content)
    - Brief description of what it renders
    
    This is critical — Superdesign needs the actual layout code to reproduce pages accurately.
    
    ### 4. Write `routes.md`
    Map out the page/route structure:
    - For file-based routing (Next.js, Nuxt): list route files and their paths
    - For config-based routing (React Router, Vue Router): read the router config
    - For each route, include: URL path, component file path, layout used
    - Include the FULL router config file if it exists (e.g., `router/index.ts`, `routes.ts`)
    
    For key pages (home, dashboard, main features), include a brief summary of what the page renders.
    
    ### 5. Write `theme.md`
    Extract the design system / theme tokens. Structure the file in **two parts, in this order**:
    
    **Part 1 — Compact token summary (at the TOP).** A concise, readable digest of the actual values: the color palette (token name → value, incl. `:root` and `.dark`), font families and type scale, spacing scale, border-radius, shadows, and breakpoints. This summary is the budget-friendly context the design flow reaches for first — the PAYLOAD BUDGET rule in [SUPERDESIGN.md](SUPERDESIGN.md) points here to avoid passing a giant `globals.css` whole. Keep it tight enough to pass as context on its own.
    
    **Part 2 — Raw source dumps (BELOW the summary).** The complete raw files in fenced code blocks, for when the full source is needed:
    - Full `tailwind.config.ts/js` content (especially `theme.extend`)
    - Full `globals.css` / `index.css` content
    - Full CSS variable definitions (`:root`, `[data-theme]`, etc.)
    - Any theme provider files and design token files
    
    ### 6. Write `pages.md`
    For each key page/route in the app (home, dashboard, main features — up to 10 pages), build a **complete component dependency tree** by tracing imports recursively.
    
    For each page:
    1. Start from the page component file
    2. Trace ALL local imports (relative `./Foo`, `../Bar`, alias `@/components/Baz` — skip node_modules)
    3. For each import, trace ITS imports recursively
    4. Present as an indented tree showing every file the page depends on
    
    Format:
    ```
    ## / (Home Page)
    Entry: src/app/(home)/home-page.tsx
    Dependencies:
    - src/components/home-ui/elegant-header.tsx
      - src/components/team/create-team-modal.tsx
    - src/components/home-ui/elegant-hero-section.tsx
      - src/components/home-ui/home-hero-input.tsx
      - src/components/home-ui/persona-selector.tsx
      - src/components/home-ui/dev-workflow-view.tsx
      - src/components/home-ui/import-site-modal.tsx
    - src/components/home-ui/elegant-project-grid.tsx
      - src/components/home-ui/elegant-project-card.tsx
    - src/app/(home)/components/template-browse-section.tsx
      - src/app/(home)/components/template-card.tsx
    - src/components/layout/Footer.tsx
    ```
    
    This tree is the **candidate set** of files to pass as `--context-file` when designing a page — the starting point for context selection. It is not an unconditional include-everything list: apply the PAYLOAD BUDGET rules in [SUPERDESIGN.md](SUPERDESIGN.md) when selecting, so the payload does not 400.
    
    Prioritize the most important/complex pages (home, dashboard, settings, etc.). Skip trivial pages (404, offline, status).
    
    ### 7. Write `extractable-components.md`
    Catalog UI components from the codebase that **can be extracted** as reusable Superdesign `DraftComponent` entities. These are components that appear on multiple pages or define shared UI patterns (navigation, cards, headers, footers).
    
    Organize by category:
    
    #### Layout Components (appear on most pages)
    - NavBar / TopNav / BottomNav
    - Sidebar
    - Header / AppBar
    - Footer
    - App Shell / Layout Wrapper
    
    #### Basic Components (used across pages)
    - Button variants
    - Card components
    - Input / Form fields
    - Badge / Tag
    - Avatar
    - Tab components
    
    For each extractable component, include:
    - **Name** (PascalCase, e.g., `NavBar`, `HeroSection`)
    - **Source file path** (e.g., `src/components/layout/NavBar.tsx`)
    - **Category**: `layout` or `basic`
    - **Brief description** (1 line)
    - **Key props to extract** — ONLY state/navigation props that change per page:
      - Active state: `activeItem`, `currentTab`, `isActive`
      - Navigation URLs: `homeHref`, `searchHref`, `profileHref`
      - Visibility flags: `showNotification`, `showBadge`
      - Dynamic counts: `badgeCount`, `notificationCount`
    - **Hardcoded elements** (NOT props): icon names, text labels, CSS classes, image sources
    
    Format:
    ```
    ## NavBar
    - Source: `src/components/layout/NavBar.tsx`
    - Category: layout
    - Description: Main top navigation with logo, search, and user menu
    - Extractable props: activeItem (string, default: "home"), showNotification (boolean, default: false)
    - Hardcoded: Logo SVG, menu items text, icon names, all CSS
    ```
    
    This file serves as a "menu" — the design workflow reads it to decide which components to extract before generating drafts.
    
    ## Format Guidelines
    - Use markdown with clear headings
    - Include file paths as code spans
    - **For `components.md`**: include FULL source code of each component in fenced code blocks
    - **For `layouts.md`**: include FULL file contents in fenced code blocks
    - **For `theme.md`**: include raw token values, CSS variables, and Tailwind config — not just descriptions
    - **For `pages.md`**: include complete dependency trees with indentation showing nesting depth
    - **For `extractable-components.md`**: include component name, source path, category, description, and key props — NOT full source code (that's in `components.md` and `layouts.md`)
    - Keep descriptions concise — the goal is machine-readable context, not documentation
    
    ## Key Principle: INCLUDE ACTUAL CODE
    The init files should contain **actual implementation code** (.tsx, .css, .ts), not just documentation or descriptions. Superdesign needs real code to reproduce UI accurately. Be thorough and complete for the key pages and shared UI — but bounded and deduplicated, not padded. These files are the discovery layer; the actual design calls pass only the target page's necessary context under the PAYLOAD BUDGET (see [SUPERDESIGN.md](SUPERDESIGN.md)), so oversized dumps just raise reader/token cost without helping.
    
    You are "Superdesign Agent". Your job is to use Superdesign to generate and iterate UI designs.
    
    IMPORTANT: MUST produce design on superdesign, only implement actual code AFTER user approve OR the user explicitly says 'skip design and implement'
    
    Convention — whenever this file says to ask, confirm, or check something with the user: use the session's user-input mechanism if one is available, otherwise ask in chat.
    
    HARD GATE — INIT BEFORE ANY DESIGN (real-codebase path): When a real codebase is present, NEVER run any generation command (`create-project`, `create-design-draft`, `create-presentation`, `iterate-design-draft`, `execute-flow-pages`) until init is complete per the init-complete test in [SKILL.md](../SKILL.md) (all six `.superdesign/init/` files exist and are non-empty). If init is missing, incomplete, or still running, WAIT for it to finish first. Creating a project or draft before init is done is a hard error. This gate does NOT apply to:
    
    - **the no-codebase path** (empty/scratch/sandbox workspace with no frontend code — see [SKILL.md](../SKILL.md) Step 1): there is nothing to init, so gather design context conversationally and design directly via **SOP: BRAND NEW PROJECT** below.
    - **the graphic workflow** ([GRAPHIC.md](GRAPHIC.md)): posters/marketing assets are standalone fixed-canvas artworks that never require repo init or design-system context — UNLESS the user wants on-brand output matching the codebase (asked explicitly, or confirmed via the graphic brief's on-brand item), in which case pass the design-system/brand context — running init first only if that context doesn't already exist.
    - **the presentation workflow** ([PRESENTATION.md](PRESENTATION.md)): slide decks skip UI repo init by default. Use only relevant product documents, design-system context, and Brand Assets when the user wants an on-brand deck. Run init only when codebase brand matching is required and no usable brand or theme context exists.
    
    ## UI TARGET ROUTING (pick the SOP by what the design targets)
    
    Three kinds of UI target, three SOPs. Decide BEFORE designing — the wrong SOP either fabricates a ground truth that doesn't exist or skips one that does:
    
    - **A. Existing rendered target** — the page/screen already exists and renders in the codebase, and the task is to redesign/improve/vary it → **SOP: EXISTING UI** (reproduce first, then branch variations).
    - **B. New target in an existing codebase** — a real codebase is present, but the requested page/feature does not exist yet, so nothing renders to reproduce → **SOP: NEW TARGET IN EXISTING CODEBASE** (init/context as usual, then create a new draft directly — no reproduction step).
    - **C. New target without a codebase** — the no-codebase path from [SKILL.md](../SKILL.md) Step 1 → **SOP: BRAND NEW PROJECT** (conversational brief → design system → create draft).
    
    **RESUME ROUTING COMES FIRST:** for every real-codebase UI request, check for a matching target in `.superdesign/resume.json` before entering any SOP below. Valid saved state is the default for that target regardless of request wording; [RESUME.md](RESUME.md) decides warm iteration, targeted context expansion, incremental repair, or baseline refresh. The target kind determines the fallback SOP only when saved state is absent, rejected, or the user explicitly asks to start over from fresh ground truth.
    
    A task can mix targets (e.g. "redesign the dashboard and add a settings page"): handle the existing target per A first, then extend to the new pages per B — usually `execute-flow-pages` from the confirmed dashboard draft.
    
    ## SOP: EXISTING UI
    
    For an existing rendered target (UI TARGET ROUTING → A) that does not have a valid warm resume. Once this cold path creates its baseline/context state, later iterations route through [RESUME.md](RESUME.md).
    
    Step 1 (Gather UI context & design system):
    Collect the two workstreams below in parallel when the current agent environment supports safe task delegation. Otherwise, complete them sequentially. Do not depend on a tool with a specific product-only name.
    
    Task 1.1 - UI Source Context:
    Superdesign agent has no context of our codebase and current UI, so first step is to identify and read the most relevant source files to pass as context.
    
    **MANDATORY FIRST STEP — init-complete test**: apply the decidable test from [SKILL.md](../SKILL.md) "Init: Repo Analysis": all six `.superdesign/init/` files exist AND are non-empty.
    
    - **If init is not complete**: You MUST run the full init analysis FIRST before any design work — follow [INIT.md](INIT.md) to scan the repo and write all six files (re-running init regenerates all six; overwriting existing ones is expected and fine). Do NOT proceed to Step 2 until init is complete.
    - **If init is complete and no valid resume covers this target**: Read all six files — the list and what each contains is in [SKILL.md](../SKILL.md) "Init Files (cold/stale context path)". This is cold/stale discovery, not a per-iteration requirement.
    - **If [RESUME.md](RESUME.md) validates a matching target**: do not read these files; exit this cold Step 1 and follow the warm procedure.
    
    **READ THE REAL RENDER BRANCH (do not infer layout from an import name).** Before describing a page's layout in a reproduction prompt, open the page and read the branch that actually renders on the target route — components frequently branch by responsive state (`if (!isMobile) { return … }`), feature flag, or route. Pass the branch that renders (e.g. the desktop master-detail split), NOT a fallback (e.g. the mobile grid). NEVER pass a line range you have not read — a wrong branch is the #1 fidelity failure.
    
    **CONTEXT COLLECTION PRINCIPLE — strip logic code, keep happy-path UI:**
    
    - Remove: data fetching, event handlers, API calls, auth checks, loading/error/empty guard returns
    - Keep: all JSX, styles, className, props, CSS, config — including `{x && <Y/>}` and ternary branches (conditional UI is a visual detail, not an edge case)
    
    **HOW TO USE LINE RANGES:** follow the canonical **CONTEXT FILE LINE RANGES** section below — the single trimming rule (threshold ~900 lines), with syntax and examples.
    
    **RECURSIVE IMPORT TRACING (MANDATORY FOR COLD/STALE TARGET CONTEXT — DO NOT SKIP)**
    
    Starting from the target page, recursively trace ALL local imports (relative `./Foo`, `../Bar`, alias `@/components/Baz` — skip node_modules) until every UI-touching file is discovered; then add globals.css, tailwind.config, and design-system.md. If `.superdesign/init/pages.md` exists, use its pre-computed dependency tree as the starting point — but still open the target page and confirm the actual render branch before passing context (do not infer layout from import names).
    
    After budgeting the final set, persist the exact `--context-file` entries and underlying-file SHA-256 fingerprints in `.superdesign/resume.json` per [RESUME.md](RESUME.md). Unchanged future sessions reuse that set without tracing imports again.
    
    **What to collect:**
    
    1. **Target page/feature files**: page component + ALL sub-components
    2. **Layout components**: nav, sidebar, header, footer — full render code
    3. **Base UI components**: all primitives used on the target page (Button, Card, Input, etc.)
    4. **Styling files**: globals.css, component CSS, CSS modules
    5. **Config**: tailwind.config
    6. **Utilities**: cn/classnames — pass full file
    7. **Brand assets & icons** (see BRAND & ICON RULES below)
    
    **PAYLOAD BUDGET — budget up front, never thin-retry (the #1 cause of garbage reproductions):**
    The design API rejects oversized context with a **400**. When that happens and the agent "retries with less," the real page never reaches the model and it **invents a generic on-brand page from `design-system.md`** — total garbage. Prevent it:
    
    1. **Budget BEFORE the call.** Sum the lines of your `--context-file` set. A big page often pulls in a ~900+ line shared header + the ~900+ line page + a ~900+ line `globals.css` — that combination WILL 400. Apply the canonical ~900-line threshold (see **CONTEXT FILE LINE RANGES**) and keep the set lean:
       - **Shared shell/header/nav (~900+ lines): line-range to its render section only** (e.g. the `<header>` JSX `:452:1247`, not the 1249-line whole file). Skip the hooks/handlers/menus above the render.
       - **The target page (~900+ lines): line-range to the render branch that actually renders** (e.g. the desktop `!isMobile` block `:697:935`), not the whole multi-branch file.
       - **`globals.css` (~900+ lines): do NOT pass it whole.** Prefer the compact token summary at the top of `.superdesign/init/theme.md` for the values; or line-range globals to its `:root`/`.dark` token block only.
    2. **On a 400: trim the BIG files to their render sections and retry the SAME faithful call.** NEVER retry with a thinned/minimal context just to make the call succeed — a reproduction off thin context is invention, not reproduction. If you cannot fit the real page, STOP and tell the user; do not ship an invented draft.
    3. **Prefer a self-contained page when the user is flexible.** A page that is one big UI component (no giant shared-shell dependency) reproduces faithfully and fits the budget; a shell-dependent page requires the line-ranging above. (A self-contained `/detail` page reproduced cleanly where a shell-dependent `/list` page 400'd — same model, only the payload differed.)
    
    **REPRODUCTION PROMPT = STRUCTURE, NOT AESTHETIC (Step 3a only):** describe the target page's ACTUAL layout and content from the branch you READ (e.g. "two-pane: left = search + All/Public/My Team tabs + a vertical list of slim prompt rows; right = preview panel with device frame + Use prompt"). Do NOT fill a reproduction prompt with design-system adjectives ("premium", "amber→orange gradient", "elegant layered shadows", "Playfair display") — with any context gap the model will render those adjectives as a generic marketing page instead of your real page. Aesthetic language belongs in Step 3b variations, not 3a.
    
    **BRAND & ICON RULES:**
    
    1. **Brand assets (logo, brand marks, fonts, reusable brand imagery)**: Select only the files actually needed for this target and upload them through the purpose-routing workflow below. Use `--purpose brand`, the correct `--type`, a stable repo-relative `--key`, and a useful `--description`. Designs MUST reuse the project's real identity — never replace it with generic placeholders.
       **Logo invariant:** whenever the source UI, a reusable component, or the requested design has a logo position and an appropriate logo Brand Asset exists, the exact Brand Asset logo MUST render there. Availability without visible use is a failed workflow. Resolve the upload's `assetKey` and public `url` before component extraction or generation; embed the exact URL in logo-bearing component templates, pass the key via `--reference-id`, and explicitly prohibit initials, emoji, generic marks, invented SVGs, or text-only substitutes. If several logos exist, use the one selected by the source UI/user; ask only when that choice is genuinely ambiguous.
    2. **Icons on the page**: Icons used in the UI (navigation icons, action icons, status icons, etc.) MUST be reproduced 1:1. Pass the icon components/SVGs as context files so the design matches exactly.
    3. **Decorative/content images (photos, illustrations, banners)**: Upload a selected image with `--purpose content` when the real image matters; otherwise use a placeholder. Never pass binary images as `--context-file`.
    
    Summary: **Brand identity = durable Brand Assets, UI icons = source context, temporary inspiration = canvas reference, final imagery = project content.**
    
    ### ASSET PURPOSE ROUTING (before every upload)
    
    Classify each deliberately selected file or user-attached image before uploading it. Never scan and upload an asset directory or repository wholesale.
    
    - **Temporary visual reference** — screenshots, mood references, competitor examples, annotated images: `upload-asset <file> --project-id <id> --purpose reference --key "<stable-descriptive-key>" --description "<what the model should notice>"`. Keep the returned canvas `nodeId`; pass it to generation with `--reference-id <nodeId>`. It belongs on the canvas, never in Brand Assets.
    - **Durable brand identity** — logos/marks, brand fonts, and reusable brand imagery: `upload-asset <file> --project-id <id> --purpose brand --type <logo|font|image> --key "<stable-repo-relative-key>" --description "<identity and intended use>"`. Keep the returned `assetKey`; use it as a `--reference-id` when the generation must see the pixels. Fonts are durable context but do not need to be visual reference blocks.
    - **Final-content imagery** — a generated hero, product photo, illustration, or other image meant to appear in the result: `upload-asset <file> --project-id <id> --purpose content --key "<stable-descriptive-key>" --description "<role in the design>"`. Use the returned public `url` in the design prompt where the HTML must embed it, and pass the returned `nodeId` via `--reference-id` when visual composition should follow the actual pixels. Do not mark it as brand merely because it will be visible in the final design.
    
    Use stable keys for local assets and reuse the server-returned key/node id on later calls. Uploading identical bytes deduplicates by content hash; uploading changed bytes under the same key updates the existing logical asset. Do not create timestamped/random keys and do not re-upload an unchanged file when its returned identifiers and public URL are already recorded. A legacy/warm logo record missing its canonical public URL may repeat the same stable-key upload once to recover that URL; deduplication must return the same logical asset. A `deduplicated: true` response means reuse the returned identifiers.
    
    `--context-file` is for text/source context. `--reference-id` is for actual image pixels. On `create-design-draft`, `iterate-design-draft`, and `execute-flow-pages`, pass every relevant image id together after one flag, for example `--reference-id <screenshot-node-id> <brand-asset-key>`. A prompt that merely names a local image path does not make it visible.
    
    For every generation containing a logo position, add an explicit constraint to the generation prompt: use the exact supplied Brand Asset logo in every logo position and do not replace it with initials, emoji, a generic mark, an invented SVG, or text alone. The `--reference-id` makes pixels visible; this instruction plus component URL embedding makes their use mandatory.
    
    Generated/imported HTML may reference only public `https://` (or intentional `data:`) asset URLs. Never emit `/logo.svg`, `./image.png`, `../...`, `file://...`, or a machine-local absolute path; upload first and use the returned public URL.
    
    Task 1.2 - Design system:
    
    - Ensure .superdesign/design-system.md exists
    - If missing: create it using the DESIGN SYSTEM SETUP rule below
    
    Step 2 - Requirements gathering:
    Ask the user only non-obvious, high-signal questions about constraints and tradeoffs.
    Do multiple rounds if answers introduce new ambiguity.
    For existing project, for visual approach only ask if they want to keep the same as now OR create new design style
    
    Step 2.5 — Component Extraction (BEFORE creating drafts):
    
    After requirements gathering, extract reusable components so they are available as `<sd-component>` tags in design drafts. This ensures UI consistency across all generated pages.
    
    1. **Read `extractable-components.md`** from `.superdesign/init/` — this lists components that can be extracted with their source paths and prop definitions.
    2. **Create project first** (if not already created): `npx --yes @superdesign/cli@latest create-project --title "<X>"`
    3. **Check existing components**: `npx --yes @superdesign/cli@latest list-components --project-id <id>`
    4. **For each needed component that doesn't exist yet**:
       a. If the source component contains a logo, resolve/upload the selected Brand Asset logo first and keep its returned public URL and `assetKey`. Read [COMPONENTS.md](COMPONENTS.md) **BRAND LOGO INVARIANT**; the converted template must embed that exact URL.
       b. Read the React source code from the path listed in `extractable-components.md`
       c. Convert to Petite-Vue HTML template following the **Petite-Vue Template Spec** in [COMPONENTS.md](COMPONENTS.md) (read it first)
       d. Create `.superdesign/tmp/` if needed. Ensure `.superdesign/tmp/` is ignored by the project's `.gitignore`;
       append the entry if it is missing so temporary HTML is never committed. Then write the HTML to a file there.
       e. Inspect the template before upload. When the source requires a logo, confirm it contains the resolved logo's exact public URL and contains no substitute mark; repair it before continuing if not.
       f. Create the component:
       ```
       npx --yes @superdesign/cli@latest create-component --project-id <id> \
         --name "NavBar" \
         --html-file .superdesign/tmp/navbar-component.html \
         --description "Main navigation bar" \
         --props '[{"name":"activeItem","type":"string","defaultValue":"home"}]'
       ```
    5. **Focus on layout components first** (NavBar, Sidebar, Footer, Header) — these appear on every page and benefit most from extraction.
    6. **Skip basic UI primitives** (Button, Input, Card) — these are too simple to warrant extraction and are better as inline HTML in drafts.
    
    Before reusing a saved logo-bearing component, apply the same invariant. If its stored/template HTML predates the selected logo or contains a substitute, update it with `update-component` before generation and update its saved version metadata. Do not preserve a wrong component merely because resume state is otherwise valid.
    
    When persistence is enabled, record the selected logo under `brandAssets.logo` and stamp every logo-bearing component record with its `logoAssetKey` per [RESUME.md](RESUME.md). A matching stamp is the warm-path proof that the component was built against that logo; missing or mismatched proof requires repair before reuse.
    
    After extraction, proceed to Step 3. The draft generation agent will automatically see these components via `buildComponentContext()` and use `<sd-component>` tags in the generated HTML.
    
    **When to skip Step 2.5:**
    
    - Brand new projects with no existing UI components
    - When the user explicitly says they don't want component extraction
    - When `extractable-components.md` doesn't exist or lists no layout components
    - When a valid resume entry already records the needed components for the same project. Do not call `list-components` merely to reconfirm saved components; use it only after a component-related command fails or affected component source changed.
    
    Step 3 — Design in Superdesign
    
    - Reuse the project id recovered from valid resume state. Otherwise create a project (IMPORTANT - MUST create project first unless a project id is already known): `npx --yes @superdesign/cli@latest create-project --title "<X>"`
    
    ### LOGO RENDER POSTCONDITION
    
    Apply this after every `create-design-draft`, `iterate-design-draft`, and `execute-flow-pages` result when the source/request requires a logo and `brandAssets.logo` is available. Do it before reporting success or asking the user to review:
    
    1. Fetch each returned draft with `get-design --output` and inspect its HTML.
    2. Count every expected logo position from the source/request. For each position, require either the selected logo's exact public URL or a reference to a saved reusable component whose `logoAssetKey` matches the selected logo. Merely passing the Brand Asset key to generation is not proof of use.
    3. Reject initials, emoji, generic icons, invented SVG marks, and text-only substitutes in those positions. Brand text may remain beside the real logo when the source design includes both.
    4. If a reused component is wrong, repair its template with `update-component` first. If the draft omitted or substituted an inline logo, make the smallest deterministic HTML correction with `get-design --output` plus `import-design-draft --into`. Keep the same draft id/version history and do not branch or spend another generation credit.
    5. Refetch the component/draft and repeat the check. Stop and report the failed postcondition if the exact logo still cannot be proven; never call the draft complete based only on successful upload or generation.
    
    This is a structural HTML/component verification, not a claim of complete visual QA. The user still reviews rendering on the canvas.
    
    - **Step 3a — PIXEL-PERFECT reproduction (ground truth) — MANDATORY ONCE PER COLD/BASELINE-REFRESH TARGET**:
      Before ANY design changes, FIRST create a draft that is a **100% pixel-perfect reproduction** of the current UI.
    
      Do not repeat this step for an unchanged target or a localized incremental source change. Apply [RESUME.md](RESUME.md) **Incremental refresh**: reproduce again only when its deterministic routing selects **Baseline refresh**, then replace the saved baseline id while preserving prior draft history.
    
      **GOAL: Pixel-to-pixel exact match.** Every element's size, color, spacing, font, border-radius, shadow must be identical to the original.
    
      ```
      npx --yes @superdesign/cli@latest create-design-draft --project-id <id> --title "Current <X>" \
        -p "Create a PIXEL-PERFECT reproduction of the current page. Match EXACTLY: all element sizes, colors, spacing, fonts, border-radius, shadows, and visual details. The reproduction must be indistinguishable from the original. Use the provided source code as the single source of truth." \
        --context-file .superdesign/design-system.md \
        --context-file src/layouts/AppLayout.tsx \
        --context-file src/components/Nav.tsx \
        --context-file src/components/Sidebar.tsx \
        --context-file src/pages/Target.tsx:45 \
        --context-file src/components/Target/SubComponent1.tsx \
        --context-file src/components/Target/SubComponent2.tsx \
        --context-file src/components/ui/Button.tsx \
        --context-file src/components/ui/Card.tsx \
        --context-file src/components/ui/Input.tsx \
        --context-file src/styles/globals.css \
        --context-file tailwind.config.ts \
        --context-file src/lib/cn.ts
      ```
    
      **Line range usage**: per **CONTEXT FILE LINE RANGES** — pass files full by default; the `Target.tsx:45` above only skips a pure data-fetching block, keeping all JSX from line 45.
    
      This step produces ONE draft with ONE -p. The -p must ONLY ask for pixel-perfect reproduction, NO design changes.
      If screenshots or other visual references were selected, append their ids as one `--reference-id <id...>` option so the reproduction model receives the actual pixels.
    
    - **Step 3b — Explore design variations using BRANCH mode — SEPARATE STEP**:
      AFTER Step 3a completes and you have a draft-id, use `iterate-design-draft` with `--mode branch` only when the user wants alternative directions to compare.
      Each -p is ONE distinct variation. Do NOT combine multiple variations into a single -p.
    
      **VARIANT COUNT RULE** (every variation spends the user's generation credits, so the count is the user's call, not yours):
      - Default: **2** variations (2 `-p` flags) unless the user specifies otherwise.
      - Generate exactly as many as the user asked for or agreed to — never invent extra variations. On the graphic path, accepting the brief's "try all three directions" recommendation counts as asking for 3 (see [GRAPHIC.md](GRAPHIC.md) Step 1).
    
      ```
      npx --yes @superdesign/cli@latest iterate-design-draft --draft-id <draft-id-from-3a> \
        -p "<variation 1: specific design change>" \
        -p "<variation 2: different design change>" \
        --mode branch \
        --user-request "<the user's verbatim message for this round>" \
        --context-file .superdesign/design-system.md \
        --context-file src/layouts/AppLayout.tsx \
        --context-file src/components/Nav.tsx \
        --context-file src/components/Sidebar.tsx \
        --context-file src/pages/Target.tsx:45 \
        --context-file src/components/ui/Button.tsx \
        --context-file src/components/ui/Card.tsx \
        --context-file src/styles/globals.css \
        --context-file tailwind.config.ts
      ```
    
      Pass the SAME context files as Step 3a to maintain consistency.
      When this iteration is driven by a user request, pass that user's verbatim message via `--user-request` (see USER REQUEST PASSING below). The device/viewport is inherited from the source draft automatically — do NOT re-specify `--device` unless you are deliberately changing it.
    
      After Step 3a and every Step 3b result, write/update `.superdesign/resume.json` per [RESUME.md](RESUME.md): project, target, baseline/active draft ids, branch description/version, extracted components, exact context bundle, and fingerprints.
    
    - Surface the `canvas` URL and invite the user in, per [SKILL.md](../SKILL.md) "Surface the canvas URL", then ask for their feedback.
    - Before further iteration, MUST read the design first: `npx --yes @superdesign/cli@latest get-design --draft-id <id> --json`. In a later turn/session, reach this through [RESUME.md](RESUME.md); do not rerun the cold steps above.
    
    Extension after approval:
    
    - If user wants to design more relevant pages or whole user journey based on a design, use execute-flow-pages: `npx --yes @superdesign/cli@latest execute-flow-pages --draft-id <draftId> --pages '[{"title":"Product Details","prompt":"Product detail page with image gallery, specs and add-to-cart"},{"title":"Checkout","prompt":"Checkout page with cart summary and payment form"}]' --context-file src/components/Foo.tsx`. Persist every returned page as its own target per [RESUME.md](RESUME.md) **Flow-page persistence**; do not replace the source target's active draft.
    - IMPORTANT: Use execute-flow-pages instead of create-design-draft to extend more pages based on an existing design — create-design-draft is only for a new base draft with no source draft (see the command contract)
    
    ## SOP: NEW TARGET IN EXISTING CODEBASE
    
    For a page/feature that does not exist yet inside a real codebase (UI TARGET ROUTING → B). The init gate (Task 1.1's six-file test), Task 1.2 (design system), Step 2 (requirements) and Step 2.5 (component extraction) run exactly as in SOP: EXISTING UI. Context collection does NOT: Task 1.1's target-page steps — reading the real render branch, recursive import tracing from the target — assume a rendered target, and a new page has none. Collect from what the new page will reuse instead:
    
    - **Shared shell/layout components** (nav, sidebar, header, footer, layout wrapper) — full render code, same as for any page.
    - **A representative existing page** as the style/structure anchor — pick the closest sibling feature (e.g. an existing list page when adding another list-like page) and trace THAT page's dependency tree (via `pages.md` or import tracing), under the usual PAYLOAD BUDGET / CONTEXT FILE LINE RANGES rules.
    - **Existing components the new page should reuse** — discover them via `components.md` / `extractable-components.md`.
    - **`design-system.md` + the globals tokens**, as on every design command.
    
    Step 3 differs — there is no Step 3a:
    
    - **Never create a "reproduction" of a page that doesn't exist.** Step 3a's job is capturing ground truth; for a new target there is none, and a fabricated "current UI" draft only corrupts the flow. Go straight to a design draft.
    - **If a related existing page is already on the canvas as a confirmed draft** (reproduced or designed earlier in this project): prefer `execute-flow-pages` from that draft — it inherits the confirmed page's style and shell, which is exactly what a sibling page should do.
    - **Otherwise**: `create-design-draft` with a normal design prompt (single `-p` describing the new page — a design prompt, not a reproduction prompt), passing `design-system.md`, the globals tokens, and the shared shell/layout + relevant component files as `--context-file` so the generated page matches the real app.
    - When the user wants alternatives, explore them with `iterate-design-draft --mode branch` per the VARIANT COUNT RULE, same as Step 3b. Once the user selects a direction, route later feedback through **ITERATION MODE ROUTING** below.
    - After the first successful draft/flow result, add this target and its exact context bundle to `.superdesign/resume.json` per [RESUME.md](RESUME.md).
    - Optional, when the user emphasizes strict visual consistency with a specific existing page: offer to reproduce that representative page first (per Step 3a) and then `execute-flow-pages` the new page from it. This costs an extra generation, so propose it and let the user decide — don't do it unasked.
    
    ## SOP: BRAND NEW PROJECT
    
    For a new target with no codebase (UI TARGET ROUTING → C).
    
    Step 1 — Requirements gathering: ask the user
    
    Step 2 — Design system setup (MUST follow the **DESIGN SYSTEM SETUP** section below):
    
    - **Pick ONE primary style source — do NOT blend two competing styles:**
      - **If the user named a reference site** ("… in the style of `<site>`", "use `<site>`'s design"): that site's extracted `design.md` is the style source (extract step below). `search-prompts` is then OPTIONAL — do NOT layer a library style prompt on top of the extracted DNA (two competing styles dilute the result).
      - **Otherwise** (no reference site) use a library style prompt:
        1. `npx --yes @superdesign/cli@latest search-prompts --tags "style"` — pick the most suitable ONLY from returned results; if nothing comes back, proceed without a library style prompt (note that to the user). Either way do not keep searching — ignore the CLI's broaden-the-search hint.
        2. Index first to confirm the slug(s) and size: `npx --yes @superdesign/cli@latest get-prompts --slugs "<slug>"`
        3. Then fetch the full body ONLY for the chosen slug(s), right before writing design-system.md: `npx --yes @superdesign/cli@latest get-prompts --slugs "<slug>" --full`
    - Extract a reference site's style (when one was named): `npx --yes @superdesign/cli@latest extract-website --url "<user-provided-url>" --design-md` (writes `.superdesign/website/<domain>/design.md`; add `--brand` for logo/colors). Read it, then decide how it flows into `design-system.md`:
      - **If a `design-system.md` already exists → ALWAYS ask the user first**. NEVER silently overwrite it.
      - If the intent is unclear, ask. If the workspace is fresh and the user clearly wants the site's look, proceed without asking. The three modes:
        - **Create from it** — `design-system.md` = the extracted site's DNA, adopted faithfully (user wants "make it look like `<site>`").
        - **Inspired by it** — blend the site's DNA with the product context + visual direction (cues from the site, but it stays the user's own brand). This is the default when unspecified.
        - **Update the existing** — merge the newly-extracted DNA into the current `design-system.md`, resolving conflicts thoughtfully (adding/refreshing a reference, or iterating on an existing system).
    - Write .superdesign/design-system.md per the chosen mode (adapted to product context + UX flows + visual direction).
    
    Step 3 — Design in Superdesign:
    
    - Create project: `npx --yes @superdesign/cli@latest create-project --title "<X>"`
    - Create initial draft (only for brand new, single -p only): `npx --yes @superdesign/cli@latest create-design-draft --project-id <id> --title "<X>" -p "<all design directions in one prompt>" --user-request "<the user's verbatim request>" --context-file .superdesign/design-system.md`
    - Surface the `canvas` URL per [SKILL.md](../SKILL.md) "Surface the canvas URL", then gather feedback and iterate.
    - Use **ITERATION MODE ROUTING** below: branch for alternatives, replace for feedback on the chosen direction.
    
    ---
    
    ## DESIGN SYSTEM SETUP
    
    Design system should provides full context across:
    
    - Product context, key pages & architecture, key features, JTBD
    - Branding & styling: color, font, spacing, shadow, layout structure, etc.
    - motion/animation patterns
    - Specific project requirements
    
    ## PROMPT RULE
    
    create-design-draft accepts ONLY ONE -p (extra -p flags are silently dropped — see the COMMAND CONTRACT). For existing UI, this single -p must be a faithful reproduction prompt — NO design changes.
    iterate-design-draft accepts MULTIPLE -p (each -p = one variation/branch) and is the ONLY way to create design variations — never pack multiple variations into one -p string.
    
    When using iterate-design-draft with multiple -p prompts:
    
    - Prompt count: follow the **VARIANT COUNT RULE** in Step 3b (default 2).
    - Each -p must describe ONE distinct direction (e.g. "conversion-focused hero", "editorial storytelling", "dense power-user layout"), and should specify what to change/explore and what to keep the same.
    - Design-system fidelity for every -p is governed by DESIGN SYSTEM FIDELITY below.
    
    **DESIGN SYSTEM FIDELITY (CRITICAL — #1 cause of bad iterations)**
    
    Without explicit constraints, the Superdesign design agent will invent random fonts (serif, decorative), random colors (pink, neon, purple gradients), and random button styles. This happens because vague prompts like "bold design" or "modern feel" give the design agent creative freedom to deviate. The design system is a hard constraint, not a suggestion: iteration prompts explore layout/structure/content direction, never visual style.
    
    To prevent this:
    
    1. **ALWAYS pass `--context-file .superdesign/design-system.md`** on EVERY create-design-draft, iterate-design-draft, and execute-flow-pages call
    2. **ALWAYS pass the globals.css tokens** on EVERY call — the whole file when under ~900 lines, else per the canonical rule in CONTEXT FILE LINE RANGES
    3. **ALWAYS append the fidelity constraint** to every -p prompt: "Use ONLY the fonts, colors, spacing, and component styles defined in the design system. Do not introduce any fonts, colors, or visual styles not in the design system."
    4. **Be explicit about what MUST stay the same** — e.g. "keep Inter as the font family, use black/white primary palette, amber/orange brand gradients only"
    
    Path carve-outs: on the no-codebase path `globals.css` is not required — do not invent one. The graphic workflow passes neither file unless the user wants on-brand output (see the HARD GATE).
    
    ## EXECUTE FLOW RULE
    
    When using execute-flow-pages:
    
    - MUST ideate the details of each page, then confirm all pages and each prompt with the user
    
    ## TOOL USE RULE
    
    Default tool while iterating design of a specific page is iterate-design-draft
    Default tool while generating new pages based on an existing confirmed page is execute-flow-pages
    Prefer iterating an existing design draft over creating new ones
    
    ### ITERATION MODE ROUTING
    
    Choose the mode from the user's intent, not from the size of the requested change:
    
    - **`replace` — creatively refine the selected direction.** Use one `-p` with `--mode replace` when the user wants the design model to interpret feedback about imagery, hierarchy, composition, layout, sections, styling, or another change requiring visual/design judgment. A change does not need to be tiny. Replace preserves the draft's version history and remains revertible; do not ask whether overwriting is okay.
    - **`branch` — explore alternatives.** Use `--mode branch` when the user explicitly asks for another direction, options, variants, comparison, experimentation, or several distinct outcomes. Multiple `-p` prompts or `--count > 1` are always branch exploration.
    - **Selection stops exploratory branching.** Phrases such as “I prefer,” “use this one,” “choose,” “continue with,” or “refine that direction” select a draft. Set that draft as active, then route subsequent feedback through **CORRECTION METHOD ROUTING**. Do not create a fresh branch merely because the feedback is substantial or arrives in a later turn.
    - **Fix defects without branching.** Route deterministic defects through **CORRECTION METHOD ROUTING** below. Use replace only when fixing the defect still requires creative or structural design judgment. Never spend a branch on correcting a defect.
    - **Ask only when intent is genuinely ambiguous.** If the user could reasonably mean either “change this draft” or “show me a separate option,” ask one concise clarification before spending generation credits. Do not ask when their language already identifies one desired result.
    
    For branch calls that return several candidates, keep the source active until the user selects one. For replace, the draft id stays the same; update its current-version metadata and keep it active.
    
    ### CORRECTION METHOD ROUTING
    
    Choose the authoring method before correcting the selected draft:
    
    - **Direct edit — exact result is knowable from the request and current HTML.** Use `get-design --output` followed by `import-design-draft --into` for precise text/link corrections, removal of unsupported copy, swapping an already-uploaded public asset URL, literal class/style fixes, exact spacing/sizing/overflow changes, malformed markup cleanup, and similarly deterministic HTML/CSS edits. Keep the same draft id; the import creates a validated, revertible version without generation credits. Follow [design-with-your-model.md](design-with-your-model.md), act on returned warnings, refetch the saved HTML/version, and ask the user to review the canvas. Do not claim visual verification from reading HTML.
    - **Model replace — desired result requires design judgment.** Use `iterate-design-draft --mode replace` for recomposition, hierarchy improvements, aesthetic refinement, responsive redesign, image-crop/art-direction choices, or feedback whose correct CSS/markup cannot be specified deterministically from the current HTML and user's words.
    - **Branch — user wants alternatives.** Use branch only under **ITERATION MODE ROUTING** above.
    
    If a request mixes exact corrections with creative redesign, include the exact constraints in one replace prompt rather than first direct-editing HTML that the model will immediately rewrite. If “make this better” is too ambiguous to choose a method, ask one concise question before spending credits.
    
    For an unchanged initialized target, "prefer" is a hard routing rule: use [RESUME.md](RESUME.md); do not repeat init reads, source discovery, component checks, project creation, or reproduction.
    
    When the user's feedback is vague ("I don't like the banner position"), ask what is bothering them and offer a couple of concrete directions before generating — a generation round spends the user's credits, so guessing at intent spends them on a coin flip. Skip the question when the ask is already concrete enough to turn into distinct `-p` variations.
    
    ## USER REQUEST PASSING
    
    When you run `create-design-draft` or `iterate-design-draft` on behalf of a user request, you SHOULD pass the user's verbatim message for that round via `--user-request "<text>"`.
    
    The same rule applies to `create-presentation` and presentation iterations.
    
    - Pass the user's ACTUAL words for this round (not your paraphrase, not the design-system-fidelity boilerplate). This is the caller-side signal the design backend uses to improve generation quality.
    - This is separate from `-p`/`--prompt`: `-p` is the directional design instruction(s) you author; `--user-request` is the raw human ask that motivated them.
    - Transparency: the text is shared with SuperDesign and stored server-side to improve generation. Keep it to the round's request; the field is capped at 16KB (truncate if longer).
    - It is optional. Omit it for agent-initiated steps that no user directly asked for (e.g. the Step 3a pixel-perfect reproduction).
    
    ## VERSION HISTORY & REVERT
    
    Every draft keeps a version history. The CLI's default output already self-discloses version anchoring (`currentVersion`/`versions` plus `help[]` hints), so discover version numbers with `get-design` rather than tracking them by hand.
    
    - **Iterate from an earlier version**: `iterate-design-draft ... --from-version <n>` starts from a specific historical version instead of the current head.
    - **Revert to an earlier version** (no generation): `npx --yes @superdesign/cli@latest revert-design-draft --draft-id <id> --to-version <n>` restores a prior version as the current head. The revert is itself reversible — the current head is snapshotted into history first — so it is always safe to try. Use `get-design` to find the version number to restore.
    
    ## CONTEXT FILE LINE RANGES — CANONICAL TRIMMING RULE
    
    **This is the single source of truth for when to trim a `--context-file`. Every other "trim" / "NEVER trim" / large-file mention in this skill defers to this rule. The threshold is ~900 lines.**
    
    `--context-file` supports an optional `:startLine:endLine` suffix to include only specific portions of a file:
    
    | Syntax                             | Meaning                               |
    | ---------------------------------- | ------------------------------------- |
    | `--context-file src/App.tsx`       | Full file (default)                   |
    | `--context-file src/App.tsx:10:50` | Lines 10-50 only (1-based, inclusive) |
    | `--context-file src/App.tsx:10`    | From line 10 to end of file           |
    
    Multiple ranges from the same file are automatically merged into a single context entry with omission markers between non-contiguous ranges.
    
    **Decision rule:**
    
    - **Under ~900 lines**: FULL file — never trim visual code (CSS, JSX/template, config, all UI/layout components, any file interleaving UI and logic). Only exception: skip a large pure-logic block, e.g. `src/pages/Dashboard.tsx:60` keeps all JSX from line 60.
    - **~900 lines or more (MANDATORY)**: line-range to what matters — the ONLY sanctioned way to "trim visual code": page/component → the render branch that actually renders; CSS → the `:root`/`.dark` token block + used selectors (for `globals.css`, prefer the token summary in `.superdesign/init/theme.md` instead); config → the relevant block.
    
    ---
    
    ## COMPONENT TEMPLATE SPEC
    
    The Petite-Vue template spec for `create-component`/`update-component` conversions (what to hardcode vs extract as props, allowed syntax, output requirements, example conversion) lives in [COMPONENTS.md](COMPONENTS.md). Read it before converting any codebase component.
    
    ---
    
    ## COMMAND CONTRACT (read `--help`, never guess)
    
    Always invoke via `npx --yes @superdesign/cli@latest`. Read flag sets off the CLI rather than from memory: the bare command lists every available command, and `<command> --help` prints its current, complete options. Do that before constructing an invocation whose exact form is not already specified by the active workflow. Canonical invocations in [RESUME.md](RESUME.md) may be used directly; do not add a `--help` round trip on every warm session unless a command rejects the documented form or you need different flags.
    
    **This section is deliberately partial.** It carries only what `--help` cannot tell you: the traps, and which command to reach for. A flag missing from here is not a flag that does not exist — it just means `--help` already documents it correctly. Never conclude an option is unavailable because it is absent below.
    
    Every command takes `--json` for the full machine payload, and `--full` expands truncated fields on the listing commands. The default output is agent-optimized TOON plus `help[]` next-step hints, and is usually the one you want. JSON-valued flags (`--pages`, `--props`, `--slots`, `--events`, `--css-imports`) take literal valid JSON — replace the values, not the brackets or keys.
    
    **Traps `--help` will not warn you about:**
    
    - `--context-file` accepts `path:startLine:endLine`, and several ranges for one file are merged into a single entry. No help text mentions this, and the whole PAYLOAD BUDGET rule depends on it.
    - `create-design-draft` takes ONE `-p`. Extra `-p` flags are silently dropped — the run reports success and every variation but the last is gone. Variations exist only through `iterate-design-draft --mode branch`; `--mode replace` is likewise a single-`-p`, no-`--count` call.
    - `extract-website` crawls server-side and takes ~60–120s. With no payload selector it defaults to `--design-md`. `--all` fetches every payload but writes no clone HTML and downloads no brand binaries, so still pass `--clone` / `--brand-assets` for those. `--brand-assets` implies `--brand`. It supersedes `extract-brand-guide`, which the command list still shows — do not use that one.
    - `create-project --device` styles only the `--template` first draft; every later draft carries its own `--device`.
    - The CLI's `init` installs skill files into the repo and `--force` overwrites them. It is NOT this skill's repo analysis — never run it for that.
    
    **Which command:**
    
    - No source draft to build on → `create-design-draft` (the Step 3a reproduction, a new target in an existing codebase, or a scratch project). Vary an existing draft → `iterate-design-draft`. Extend sibling pages from a confirmed one → `execute-flow-pages` (1-10 pages per call, each styled after the source draft).
    - A slide deck is a presentation artifact, not a normal page or graphic. Read [PRESENTATION.md](PRESENTATION.md), approve the complete outline in chat, then use `create-presentation`. Never use `create-design-draft` for initial presentation creation.
    - Before a presentation iteration, use `get-design --json` to load its stored outline and preferences. Structural replace edits pass the complete final outline through `--presentation-outline-file`; visible control changes pass `--navigation-controls`. Omit these presentation-only flags from ordinary drafts and non-structural presentation edits.
    - Resuming a project from an earlier session → use `.superdesign/resume.json` and address its saved draft id directly. If the saved draft is rejected or resume state is unavailable, `fetch-design-nodes --project-id <id>` recovers the project's draft ids as the fallback.
    - `--model`: model choice materially affects design quality, speed, and cost. Run `list-models`, choose a model that fits the task instead of always relying on the default, and briefly tell the user what you picked and why. Use different models for independent comparison directions when requested; never memorize the catalog. **Presentation exception:** follow [PRESENTATION.md](PRESENTATION.md); normal presentation creation, iteration, and visual branching omit `--model` and use the backend draft default.
    - `--device` on `iterate-design-draft` is inherited from the source draft; omit it unless you are deliberately changing the viewport. `--kind graphic` switches `create-design-draft` to the fixed-canvas branch and sticks across iterations; pair it with `--width`/`--height` (see [GRAPHIC.md](GRAPHIC.md)).
    - `execute-flow-pages --context` is a prose string; `--context-file` passes source files. They are different inputs.
    - `create-design-draft`, `iterate-design-draft`, and `execute-flow-pages` accept image pixels through `--reference-id <ids...>`. Canvas image-node ids and Brand Asset keys are valid only within their project; an unknown id fails the job instead of being ignored.
    - `upload-asset` requires explicit purpose in this workflow: `reference` for temporary canvas inputs, `brand` for reusable identity, and `content` for final imagery. Stable keys upsert and content hashes deduplicate; use the response's `nodeId`, `assetKey`, `url`, and `deduplicated` fields rather than guessing identifiers.
    - A pasted direct public image URL is an agent-side adapter, not a platform fetch: read [WEBSITE.md](WEBSITE.md), download it safely to an external temporary file, then use the same `upload-asset` command. Do not upload raw PDFs; PDF reference ingestion is deferred.
    - `get-prompts`: index with the default output first, then re-run with `--full` for the chosen slug(s) only.
    - `create-project` auto-opens the browser — see Browser Choice in [SKILL.md](../SKILL.md). Revert and `--from-version` semantics live in VERSION HISTORY & REVERT.
    
    ## EXTRACT-WEBSITE
    
    Live-site extraction (borrow a style, restyle/recombine sites, tokens, reference clones, and the pixel-recreation scope boundary) has its own reference: whenever a task involves a reference URL, read [WEBSITE.md](WEBSITE.md) and follow its recipes. Run `extract-website --help` for its flag set; the COMMAND CONTRACT above carries its gotchas.
    
    ✓ • 1m 31s

## Activity

    $ rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -First 220'; rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -Skip 220 -First 260'; rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -Skip 480 -First 320'
    import React, { useState, useEffect } from 'react';
    import logo from './assets/logo.png';
    
    // Tipos para la API de Electron
    declare global {
      interface Window {
        electronAPI: {
          getIP: () => Promise<string>;
          getNetworkInfo: () => Promise<{
            hotspotIp: string;
            hasActiveHotspotAdapter: boolean;
            wifiIp: string;
            preferredLocalIp: string;
            port: number;
            uploadPath: string;
            hotspot?: {
              supported: boolean;
              state: string;
              ssid?: string;
              password?: string;
              clients?: number;
              ip?: string;
              error?: string;
            };
          }>;
          getHotspotInfo: () => Promise<any>;
          toggleHotspot: (enable: boolean) => Promise<any>;
          getUploadPath: () => Promise<string>;
          getPrinters: () => Promise<any[]>;
          generateQR: (text: string) => Promise<string>;
          analyzeImage: (filePath: string) => Promise<any>;
          saveSale: (saleData: any) => Promise<any>;
          getCorte: () => Promise<any>;
          selectFiles: () => Promise<string[]>;
          convertOffice: (filePath: string) => Promise<any>;
          printTicket: (saleData: any, printerName?: string) => Promise<any>;
          printDocument: (jobData: any) => Promise<any>;
          getLearningModel: () => Promise<any>;
          savePriceCorrection: (correctionData: any) => Promise<any>;
          resetLearningModel: () => Promise<any>;
          getPathForFile: (file: any) => string;
          onFileReceived: (callback: (filePath: string) => void) => void;
          onTunnelUrl: (callback: (url: string) => void) => void;
          onTunnelInfo: (callback: (info: { url: string; password?: string }) => void) => void;
        }
      }
    }
    
    interface PageAnalysis {
      path: string;
      pageIndex: number;
      imagePath: string;
      esColor: boolean;
      cobertura: number;
      pctColor?: number;
      esAltaDensidadBN: boolean;
      isDocumentPage: boolean;
      // Controls
      rotation: number; // 0, 90, 180, 270 degrees
      quantity: number; // Number of copies of this specific image/page
      copiesPerPage: number; // Number of copies of each page in the print job
      colorOverride?: 'color' | 'bw' | null; // Override individual page color/BW mode
    }
    
    const App: React.FC = () => {
      // Navigation
      const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
      const [theme, setTheme] = useState<'dark' | 'light'>(() => (
        localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
      ));
    
      // Business Configuration (Saved in localStorage)
      const [costBase, setCostBase] = useState<number>(() => Number(localStorage.getItem('costBase') || '3'));
      const [costBW, setCostBW] = useState<number>(() => Number(localStorage.getItem('costBW') || '1'));
      const [costBWHigh, setCostBWHigh] = useState<number>(() => Number(localStorage.getItem('costBWHigh') || '2'));
      const [costColor, setCostColor] = useState<number>(() => Number(localStorage.getItem('costColor') || '5'));
      const [pricingMode, setPricingMode] = useState<'fixed' | 'smart'>(() => (localStorage.getItem('pricingMode') as 'fixed' | 'smart') || 'fixed');
      const [printColorMode, setPrintColorMode] = useState<'auto' | 'color' | 'bw'>(
        () => (localStorage.getItem('printColorMode') as 'auto' | 'color' | 'bw') || 'auto'
      );
    
      // Modelo de Aprendizaje Inteligente de Tarifas (Aprende de las correcciones del usuario)
      const [learningModel, setLearningModel] = useState<{
        tier1_rate: number;
        tier2_rate: number;
        tier3_rate: number;
        tier4_rate: number;
        color_rate: number;
        cost_bw_high: number;
        cost_base: number;
        tuning_factor: number;
        total_corrections: number;
      }>({
        tier1_rate: 1.00, // 1 a 50 copias (B/N): $1.00
        tier2_rate: 0.80, // 51 a 100 copias (B/N): $0.80
        tier3_rate: 0.50, // 101 a 200 copias (B/N): $0.50
        tier4_rate: 0.40, // 201+ copias (B/N): $0.40
        color_rate: 3.00,
        cost_bw_high: 2.00,
        cost_base: 0.00,
        tuning_factor: 1.00,
        total_corrections: 0
      });
    
      // Corrección manual de precios por el usuario
      const [correctedTotal, setCorrectedTotal] = useState<number | null>(null);
      const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
      const [priceCorrectionInput, setPriceCorrectionInput] = useState<string>('');
    
      // Application State
      const [connectionMode, setConnectionMode] = useState<'hotspot' | 'wifi' | 'internet'>('hotspot');
      const [hotspotStep, setHotspotStep] = useState<'wifi' | 'upload'>('wifi');
      const [hotspotInfo, setHotspotInfo] = useState<{
        supported: boolean;
        state: string;
        ssid?: string;
        password?: string;
        clients?: number;
        ip?: string;
      } | null>(null);
      const [isTogglingHotspot, setIsTogglingHotspot] = useState<boolean>(false);
      const [wifiIp, setWifiIp] = useState<string>('');
      const [hotspotIp, setHotspotIp] = useState<string>('192.168.137.1');
      const [uploadRoute, setUploadRoute] = useState<string>('/upload');
    
      // QR Codes for different modes
      const [wifiConnectQr, setWifiConnectQr] = useState<string>('');
      const [hotspotUploadQr, setHotspotUploadQr] = useState<string>('');
      const [wifiUploadQr, setWifiUploadQr] = useState<string>('');
      const [tunnelUploadQr, setTunnelUploadQr] = useState<string>('');
      const [publicUploadUrl, setPublicUploadUrl] = useState<string>('');
      const [tunnelPassword, setTunnelPassword] = useState<string>('');
    
      // Big QR modal & Toast notification
      const [showBigQrModal, setShowBigQrModal] = useState<boolean>(false);
      const [bigQrData, setBigQrData] = useState<{ title: string; subtitle: string; qr: string; helpText?: string } | null>(null);
      const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
    
      const showToast = (text: string, type: 'error' | 'success' | 'info' = 'info') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 5500);
      };
    
      const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
        const savedWidth = Number(localStorage.getItem('sidebarWidth'));
        return Number.isFinite(savedWidth) ? Math.min(380, Math.max(220, savedWidth)) : 252;
      });
      const [files, setFiles] = useState<string[]>([]);
      const [analysisResults, setAnalysisResults] = useState<PageAnalysis[]>([]);
      const [selectedPage, setSelectedPage] = useState<PageAnalysis | null>(null);
    
      // Printing Job Params
      const [printers, setPrinters] = useState<Array<{ name: string; isDefault?: boolean }>>([]);
      const [selectedPrinter, setSelectedPrinter] = useState<string>('');
      const [isLoadingPrinters, setIsLoadingPrinters] = useState<boolean>(true);
      const [paperSize, setPaperSize] = useState<string>('Carta');
      const [copies, setCopies] = useState<number>(1);
      const [imageLayout, setImageLayout] = useState<number>(1);
      const [fitOption, setFitOption] = useState<'fit' | 'fill'>('fit');
      const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
      const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
      const [analysisProgress, setAnalysisProgress] = useState<string>('');
      const [previewPage, setPreviewPage] = useState<number>(1);
    
      // Daily Summary (Corte Diario)
      const [corteSummary, setCorteSummary] = useState<any>({ total_tinta: 0, total_general: 0, num_ventas: 0 });
      const [corteSales, setCorteSales] = useState<any[]>([]);
    
      // Ticket Modal State
      const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
      const [activeTicketData, setActiveTicketData] = useState<any | null>(null);
      const [ticketQr, setTicketQr] = useState<string>('');
    
      // Save Settings to localStorage
      useEffect(() => {
        localStorage.setItem('costBase', costBase.toString());
        localStorage.setItem('costBW', costBW.toString());
        localStorage.setItem('costBWHigh', costBWHigh.toString());
        localStorage.setItem('costColor', costColor.toString());
        localStorage.setItem('pricingMode', pricingMode);
      }, [costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode]);
    
      useEffect(() => {
        localStorage.setItem('printColorMode', printColorMode);
      }, [printColorMode]);
    
      useEffect(() => {
        localStorage.setItem('theme', theme);
      }, [theme]);
    
      useEffect(() => {
        localStorage.setItem('sidebarWidth', String(sidebarWidth));
      }, [sidebarWidth]);
    
      // Cargar modelo de aprendizaje inteligente al iniciar
      useEffect(() => {
        const loadLearningModel = async () => {
          try {
            if (window.electronAPI && typeof window.electronAPI.getLearningModel === 'function') {
              const model = await window.electronAPI.getLearningModel();
              if (model && Object.keys(model).length > 0) {
                setLearningModel(prev => ({ ...prev, ...model }));
              }
            }
          } catch (e) {
            console.warn('Error al cargar modelo de aprendizaje:', e);
          }
        };
        loadLearningModel();
      }, []);
    
      const handleSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        const startX = event.clientX;
        const startWidth = sidebarWidth;
        const updateWidth = (moveEvent: PointerEvent) => {
          setSidebarWidth(Math.min(380, Math.max(220, startWidth + moveEvent.clientX - startX)));
        };
        const stopResize = () => {
          window.removeEventListener('pointermove', updateWidth);
          window.removeEventListener('pointerup', stopResize);
        };
        window.addEventListener('pointermove', updateWidth);
        window.addEventListener('pointerup', stopResize, { once: true });
      };
    
      const refreshAllQrs = async (netInfo?: any, currentHotspot?: any) => {
        try {
          const up = netInfo?.uploadPath || uploadRoute || '/upload';
          const hIp = netInfo?.hotspotIp || hotspotIp || '192.168.137.1';
          const wIp = netInfo?.wifiIp || wifiIp;
          const hs = currentHotspot || hotspotInfo;
    
          // 1. QR de subida en Hotspot directo (Sin router Wi-Fi)
          const hsUrl = `http://${hIp}:3500${up}`;
          const hsUpload = await window.electronAPI.generateQR(hsUrl);
          setHotspotUploadQr(hsUpload);
    
          // 2. QR de conexión al Wi-Fi del Hotspot (formato estándar WIFI:)
          if (hs?.ssid && hs?.password) {
            const wifiStr = `WIFI:S:${hs.ssid};T:WPA;P:${hs.password};;`;
            const wifiQr = await window.electronAPI.generateQR(wifiStr);
            setWifiConnectQr(wifiQr);
          }
    
          // 3. QR de subida en Wi-Fi Local (misma red)
          if (wIp && wIp !== 'localhost') {
            const wifiUrl = `http://${wIp}:3500${up}`;
            const wUpload = await window.electronAPI.generateQR(wifiUrl);
            setWifiUploadQr(wUpload);
          }
        } catch (e) {
          console.error('Error generating QRs:', e);
        }
      };
    
      const handleToggleHotspot = async () => {
        setIsTogglingHotspot(true);
        try {
          const shouldEnable = hotspotInfo?.state !== 'On';
          const result = await window.electronAPI.toggleHotspot(shouldEnable);
          if (result) {
            setHotspotInfo(result);
            await refreshAllQrs(null, result);
            showToast(
              shouldEnable ? 'Zona Móvil de la PC activada con éxito.' : 'Zona Móvil desactivada.',
              'success'
            );
          }
        } catch (e: any) {
          showToast('Error al cambiar estado de Zona Móvil: ' + (e.message || e), 'error');
        } finally {
          setIsTogglingHotspot(false);
        }
      };
    
      // Load Setup data on mount
      useEffect(() => {
        const setupApp = async () => {
          try {
            const netInfo = await window.electronAPI.getNetworkInfo();
            if (netInfo) {
              setWifiIp(netInfo.wifiIp || '');
              setHotspotIp(netInfo.hotspotIp || '192.168.137.1');
              setUploadRoute(netInfo.uploadPath || '/upload');
              if (netInfo.hotspot) {
                setHotspotInfo(netInfo.hotspot);
              }
              await refreshAllQrs(netInfo, netInfo.hotspot);
            }
          } catch (err) {
            console.error("Error setting up mobile import server QR:", err);
          }
    
          // Load System Printers
          try {
            setIsLoadingPrinters(true);
            let list = await window.electronAPI.getPrinters();
            if ((!Array.isArray(list) || list.length === 0)) {
              await new Promise(r => setTimeout(r, 700));
              list = await window.electronAPI.getPrinters();
            }
            if (Array.isArray(list) && list.length > 0) {
              setPrinters(list);
              const defaultP = list.find((p: any) => p.isDefault) || list[0];
              if (defaultP) setSelectedPrinter(defaultP.name);
            } else {
              console.warn('No system printers found.');
            }
          } catch (pErr) {
            console.error("Error loading system printers:", pErr);
          } finally {
            setIsLoadingPrinters(false);
          }
    
          // Load Initial Corte Diario
          fetchCorteDiario();
        };
    
        setupApp();
    
        // Listen for mobile uploaded files
        window.electronAPI.onFileReceived((filePath) => {
          setFiles(prev => prev.includes(filePath) ? prev : [...prev, filePath]);
          showToast('Nuevo archivo recibido desde el celular.', 'success');
          void analyzeFile(filePath);
        });
    
        // Listen for public tunnel URL and info from main
        window.electronAPI.onTunnelInfo((info: { url: string; password?: string }) => {
          setPublicUploadUrl(info.url);
          if (info.password) setTunnelPassword(info.password);
          window.electronAPI.generateQR(info.url)
            .then(qr => setTunnelUploadQr(qr))
            .catch(e => console.error('QR gen failed for tunnel URL', e));
        });
    
        window.electronAPI.onTunnelUrl((url: string) => {
          setPublicUploadUrl(url);
          window.electronAPI.generateQR(url)
            .then(qr => setTunnelUploadQr(qr))
            .catch(e => console.error('QR gen failed for tunnel URL', e));
        });
      }, []);
    
      // Helper functions for print preview and layout
      const getPrintItemsForPreview = () => {
        const items: { imagePath: string; rotation: number; name: string; originalPage: PageAnalysis }[] = [];
        analysisResults.forEach((analysis) => {
          const quantity = Math.max(1, analysis.quantity || 1);
          for (let i = 0; i < quantity; i++) {
            items.push({
              imagePath: analysis.imagePath,
              rotation: (analysis.rotation || 0) % 360,
              name: analysis.path.split(/[\\/]/).pop() || 'Archivo',
              originalPage: analysis
            });
          }
        });
        return items;
      };
    
      const getLayoutDimensions = (layout: number, orient: 'portrait' | 'landscape') => {
        const isLandscape = orient === 'landscape';
        switch (Number(layout)) {
          case 1:
            return { rows: 1, cols: 1 };
          case 2:
            return isLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 };
          case 3:
            return isLandscape ? { rows: 1, cols: 3 } : { rows: 3, cols: 1 };
          case 4:
            return { rows: 2, cols: 2 };
          case 5:
            return isLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
          case 7:
            return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
          case 8:
            return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
          case 9:
            return { rows: 3, cols: 3 };
          case 10:
            return isLandscape ? { rows: 2, cols: 5 } : { rows: 5, cols: 2 };
          case 35:
            return isLandscape ? { rows: 5, cols: 7 } : { rows: 7, cols: 5 };
          default: {
            const count = Number(layout) || 1;
            if (count <= 1) return { rows: 1, cols: 1 };
            const cols = isLandscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.floor(Math.sqrt(count * 0.77)) || 1;
            const rows = Math.ceil(count / cols);
            return { rows, cols };
          }
        }
      };
    
      const getPaperAspectRatio = (pSize: string, orient: 'portrait' | 'landscape') => {
        let widthPt: number, heightPt: number;
        switch (pSize) {
          case 'Carta': // 8.5 x 11 in
            widthPt = 8.5 * 72;
            heightPt = 11 * 72;
            break;
          case 'Oficio': // 8.5 x 14 in
            widthPt = 8.5 * 72;
            heightPt = 14 * 72;
            break;
          case 'Oficio México': // 8.5 x 13.4 in
            widthPt = 8.5 * 72;
            heightPt = 13.4 * 72;
            break;
          case 'Doble Carta / Tabloide': // 11 x 17 in
            widthPt = 11 * 72;
            heightPt = 17 * 72;
            break;
          default:
            widthPt = 8.5 * 72;
            heightPt = 11 * 72;
        }
        if (orient === 'landscape') {
          return heightPt / widthPt; // inverted ratio
        }
        return widthPt / heightPt;
      };
    
      const getPreviewDimensions = (pSize: string, orient: 'portrait' | 'landscape') => {
        const ratio = getPaperAspectRatio(pSize, orient);
        if (orient === 'landscape') {
          const width = 340;
          const height = Math.round(width / ratio);
          return { width, height };
        } else {
          const height = 360;
          const width = Math.round(height * ratio);
          return { width, height };
        }
      };
    
      const updateSelectedRotation = (newRot: number) => {
        if (!selectedPage) return;
        const normalized = ((newRot % 360) + 360) % 360;
        setAnalysisResults(prev => {
          if (prev.length === 0) return prev;
          return prev.map(p => {
            if (p.path === selectedPage.path && p.pageIndex === selectedPage.pageIndex) {
              return { ...p, rotation: normalized };
            }
            return p;
          });
        });
        setSelectedPage(prev => prev ? { ...prev, rotation: normalized } : null);
      };
    
      const rotateAllImages = (delta: number) => {
        setAnalysisResults(prev => {
          return prev.map(p => ({
            ...p,
            rotation: (((p.rotation || 0) + delta) % 360 + 360) % 360
          }));
        });
        setSelectedPage(prev => prev ? {
          ...prev,
          rotation: (((prev.rotation || 0) + delta) % 360 + 360) % 360
        } : null);
      };
    
      const resetAllRotations = () => {
        setAnalysisResults(prev => {
          return prev.map(p => ({ ...p, rotation: 0 }));
        });
        setSelectedPage(prev => prev ? { ...prev, rotation: 0 } : null);
      };
    
      const updateSelectedQuantity = (newQty: number) => {
        if (!selectedPage) return;
        const val = Math.max(1, newQty);
        setAnalysisResults(prev => {
          if (prev.length === 0) return prev;
          return prev.map(p => {
            if (p.path === selectedPage.path && p.pageIndex === selectedPage.pageIndex) {
              return { ...p, quantity: val };
            }
            return p;
          });
        });
        setSelectedPage(prev => prev ? { ...prev, quantity: val } : null);
      };
    
      const updatePageQuantity = (page: PageAnalysis, newQty: number) => {
        const val = Math.max(1, newQty);
        setAnalysisResults(prev => prev.map(item => (
          item.path === page.path && item.pageIndex === page.pageIndex
            ? { ...item, quantity: val }
            : item
        )));
        setSelectedPage(prev => (
          prev && prev.path === page.path && prev.pageIndex === page.pageIndex
            ? { ...prev, quantity: val }
            : prev
        ));
      };
    
      const fetchCorteDiario = async () => {
        try {
          const data = await window.electronAPI.getCorte();
          if (data) {
            setCorteSummary({
              total_tinta: data.resumen?.total_tinta || 0,
              total_general: data.resumen?.total_general || 0,
              num_ventas: data.resumen?.num_ventas || 0
            });
            setCorteSales(data.ventas || []);
          }
        } catch (e) {
          console.error("Error fetching corte:", e);
        }
      };
    
      // Analyze single selected file
      const analyzeFile = async (filePath: string) => {
        const fileName = filePath.split(/[\\/]/).pop() || 'Archivo';
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
    
        // Filter out invalid/binary executable files (e.g. PrintStudio Pro.exe)
        const validDocExts = ['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt'];
        const validImgExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'];
    
        if (!validDocExts.includes(ext) && !validImgExts.includes(ext)) {
          console.warn(`Archivo omitido (formato no soportado): ${fileName}`);
          return;
        }
    
        setIsAnalyzing(true);
        setAnalysisProgress(`Analizando ${fileName}...`);
    
        try {
          const isDoc = validDocExts.includes(ext);
    
          if (isDoc) {
            const response = await window.electronAPI.convertOffice(filePath);
            if (response.status === 'success') {
              const newPages = response.pages.map((p: any, idx: number) => ({
                path: filePath,
                pageIndex: idx,
                imagePath: p.image_path,
                esColor: p.esColor,
                cobertura: p.cobertura,
                pctColor: p.pctColor,
                esAltaDensidadBN: p.esAltaDensidadBN,
                isDocumentPage: true,
                // Initialize new print control properties
                rotation: 0,
                quantity: 1,
                copiesPerPage: 1
              }));
    
              setAnalysisResults(prev => {
                const updated = [...prev, ...newPages];
                // Select first analyzed page by default if none selected
                if (updated.length > 0 && !selectedPage) {
                  setSelectedPage(updated[0]);
                }
                return updated;
              });
            } else {
              console.error("Error converting document:", response.message);
              showToast(`No se pudo procesar ${fileName}: ${response.message || 'Error de conversión'}`, 'error');
            }
          } else {
            // Handle images (.png, .jpg, .webp, .bmp, etc)
            const result = await window.electronAPI.analyzeImage(filePath);
            const newPage: PageAnalysis = {
              path: filePath,
              pageIndex: 0,
              imagePath: result.image_path,
              esColor: result.esColor,
              cobertura: result.cobertura,
              pctColor: result.pctColor,
              esAltaDensidadBN: result.esAltaDensidadBN,
              isDocumentPage: false,
              // Initialize new print control properties
              rotation: 0,
              quantity: 1,
              copiesPerPage: 1
            };
    
            setAnalysisResults(prev => {
              const updated = [...prev, newPage];
              if (!selectedPage) {
                setSelectedPage(newPage);
              }
              return updated;
            });
          }
        } catch (err: any) {
          console.error("Error analyzing file:", err);
          showToast(`Error al procesar ${fileName}: ${err?.message || err}`, 'error');
        } finally {
          setIsAnalyzing(false);
          setAnalysisProgress('');
        }
      };
    
      const handleSelectFiles = async () => {
        const selected = (await window.electronAPI.selectFiles()) || [];
        if (selected.length > 0) {
          setFiles(prev => {
            const newFiles = [...prev];
            selected.forEach(s => {
              if (!newFiles.includes(s)) newFiles.push(s);
            });
            return newFiles;
          });
    
          for (const f of selected) {
            await analyzeFile(f);
          }
        }
      };
    
      const handleDropFiles = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        const paths: string[] = [];
        for (const file of droppedFiles) {
          let p = '';
          if (window.electronAPI?.getPathForFile) {
            try {
              p = window.electronAPI.getPathForFile(file);
            } catch (e) {
              console.warn('Error en getPathForFile:', e);
            }
          }
          if (!p && (file as any).path) {
            p = (file as any).path;
          }
          if (p) paths.push(p);
        }
        if (paths.length === 0) {
          showToast('No se pudieron leer las rutas de los archivos arrastrados. Haz clic en la zona para seleccionarlos.', 'error');
          return;
        }
        setFiles(prev => Array.from(new Set([...prev, ...paths])));
        for (const filePath of paths) {
          await analyzeFile(filePath);
        }
      };
    
      const handleClearAll = () => {
        setFiles([]);
        setAnalysisResults([]);
        setSelectedPage(null);
        setCopies(1);
      };
    
      const isPageColor = (page: PageAnalysis): boolean => {
        if (page.colorOverride === 'color') return true;
        if (page.colorOverride === 'bw') return false;
        if (printColorMode === 'color') return true;
        if (printColorMode === 'bw') return false;
        return Boolean(page.esColor);
      };
    
      const togglePageColor = (page: PageAnalysis) => {
        const currentIsColor = isPageColor(page);
        const newOverride: 'color' | 'bw' = currentIsColor ? 'bw' : 'color';
        setAnalysisResults(prev => prev.map(p => {
          if (p.path === page.path && p.pageIndex === page.pageIndex) {
            return { ...p, colorOverride: newOverride };
          }
          return p;
        }));
        if (selectedPage?.path === page.path && selectedPage?.pageIndex === page.pageIndex) {
          setSelectedPage(prev => prev ? { ...prev, colorOverride: newOverride } : null);
        }
        if (correctedTotal !== null) setCorrectedTotal(null);
      };
    
      // Escalas por volumen para Blanco y Negro (SOLO B/N):
      // 1 a 50 copias: $1.00
      // 51 a 100 copias: $0.80
      // 101 a 200 copias: $0.50
      // 201+ copias: $0.40
      const getBwVolumeTier = (totalBw: number): { rate: number; label: string; range: string } => {
        const r1 = learningModel.tier1_rate ?? 1.00;
        const r2 = learningModel.tier2_rate ?? 0.80;
        const r3 = learningModel.tier3_rate ?? 0.50;
        const r4 = learningModel.tier4_rate ?? 0.40;
    
        if (totalBw <= 50) return { rate: r1, label: `1 - 50 copias ($${r1.toFixed(2)})`, range: '1-50' };
        if (totalBw <= 100) return { rate: r2, label: `51 - 100 copias ($${r2.toFixed(2)})`, range: '51-100' };
        if (totalBw <= 200) return { rate: r3, label: `101 - 200 copias ($${r3.toFixed(2)})`, range: '101-200' };
        return { rate: r4, label: `201+ copias ($${r4.toFixed(2)})`, range: '201+' };
      };
    
      const totalBwImpressions = analysisResults.reduce(
        (sum, p) => (!isPageColor(p) ? sum + (p.quantity || 1) * copies : sum),
        0
      );
      const totalColorImpressions = analysisResults.reduce(
        (sum, p) => (isPageColor(p) ? sum + (p.quantity || 1) * copies : sum),
        0
      );
    
      const bwTier = getBwVolumeTier(totalBwImpressions);
    
      const getPageUnitCost = (result: PageAnalysis) => {
        const pageColor = isPageColor(result);
        // Para B/N se aplica la tarifa por volumen activa
        const currentBwRate = bwTier.rate;
        const currentCostColor = (costColor || learningModel.color_rate || 3.00) * (learningModel.tuning_factor || 1.0);
    
        if (pricingMode === 'fixed') {
          if (pageColor) {
            return currentCostColor;
          }
          return result.esAltaDensidadBN ? Math.max(currentBwRate * 1.5, costBWHigh) : currentBwRate;
        }
    
        // Modo Inteligente (cobertura)
        const clamp = (value: number) => Math.min(1, Math.max(0, value));
        if (pageColor) {
          const colorShare = clamp((result.pctColor ?? (result.esColor ? 100 : 0)) / 100);
          const effectiveColorCoverage = result.cobertura * colorShare;
          const coverageFactor = clamp(effectiveColorCoverage / 30);
          return currentBwRate + (currentCostColor - currentBwRate) * coverageFactor;
        }
    
        const densityFactor = clamp((result.cobertura - 15) / 45);
        const bwHighRate = Math.max(currentBwRate * 1.5, costBWHigh);
        return currentBwRate + (bwHighRate - currentBwRate) * densityFactor;
      };
    
      // Cost calculator
      const calculateCosts = () => {
        let subtotalTinta = 0;
    
        analysisResults.forEach(res => {
          const cost = getPageUnitCost(res);
          const qty = Math.max(1, res.quantity || 1);
          subtotalTinta += cost * qty;
        });
    
        const subtotalTintaConCopias = subtotalTinta * copies;
        const baseFee = analysisResults.length > 0 ? costBase : 0;
        const calculatedTotal = subtotalTintaConCopias + baseFee;
        const total = correctedTotal !== null ? correctedTotal : calculatedTotal;
    
        return {
          subtotalTinta: subtotalTintaConCopias,
          baseFee,
          calculatedTotal,
          total,
          isCorrected: correctedTotal !== null,
          totalBwImpressions,
          totalColorImpressions,
          bwTier
        };
      };
    
      const costs = calculateCosts();
    
      const handleApplyPriceCorrection = async () => {
        const newPrice = parseFloat(priceCorrectionInput);
        if (isNaN(newPrice) || newPrice < 0) {
          showToast('Por favor escribe un precio válido', 'error');
          return;
        }
    
        setCorrectedTotal(newPrice);
        setIsEditingPrice(false);
    
        try {
          const correctionData = {
            archivo: analysisResults[0]?.path ? analysisResults[0].path.split(/[\\/]/).pop() : 'Trabajo',
            total_paginas: analysisResults.length,
            total_copias: copies,
            copias_bn: totalBwImpressions,
            copias_color: totalColorImpressions,
            cobertura_promedio: analysisResults.reduce((acc, p) => acc + p.cobertura, 0) / (analysisResults.length || 1),
            precio_calculado: costs.calculatedTotal,
            precio_corregido: newPrice,
            costo_fijo: costs.baseFee,
            detalles: {
              printColorMode,
              paperSize,
              copies,
              pages: analysisResults.length
            }
          };
    
          if (window.electronAPI && typeof window.electronAPI.savePriceCorrection === 'function') {
            const res = await window.electronAPI.savePriceCorrection(correctionData);
            if (res && res.success) {
              setLearningModel(res.model);
              showToast(`🧠 El sistema aprendió de tu corrección ($${newPrice.toFixed(2)} vs $${costs.calculatedTotal.toFixed(2)}) y ajustó las tarifas futuras`, 'success');
            }
          }
        } catch (e) {
          console.error('Error al guardar corrección de precio:', e);
        }
    ✓ • 6.48s

## Activity

    $ rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -Skip 800 -First 360'; rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -Skip 1160 -First 420'
      };
    
      const handleResetLearning = async () => {
        try {
          if (window.electronAPI && typeof window.electronAPI.resetLearningModel === 'function') {
            const defaults = await window.electronAPI.resetLearningModel();
            setLearningModel(defaults);
            showToast('Tarifas aprendidas restablecidas a valores de fábrica', 'info');
          }
        } catch (e) {
          console.error('Error al restablecer aprendizaje:', e);
        }
      };
    
      // Save Sale & Generate Ticket
      const handlePrintAndRegister = async () => {
        if (analysisResults.length === 0) return;
    
        try {
          // Prepare items for print composer based on analysisResults and user quantities
          let printItems = [];
    
          // If we have analyzed pages (from documents or images), use them
          if (analysisResults.length > 0) {
            for (const analysis of analysisResults) {
              // Add the item multiple times based on its quantity (per-image copies)
              const itemQuantity = analysis.quantity || 1;
              const isPageBw = !isPageColor(analysis);
              for (let i = 0; i < itemQuantity; i++) {
                printItems.push({
                  path: analysis.path,
                  imagePath: analysis.imagePath,
                  // Add rotation if specified
                  rotation: analysis.rotation || 0,
                  isBW: isPageBw,
                  esColor: !isPageBw
                });
              }
            }
          } else {
            // Fallback - should not happen if we have analysisResults
            printItems = [{ path: '', imagePath: '', rotation: 0, isBW: false, esColor: true }];
          }
    
          // Prepare job data for print-document
          const jobData = {
            printer: selectedPrinter,
            // When using pages array, we don't need single filePath
            pages: printItems,
            copies: copies, // Job-level copies (copies of entire print job)
            paperSize: paperSize,
            imageLayout: imageLayout, // Layout selection (1, 2, 3, 4, 5, 7, 8, 9, 10, 35)
            isColorPrint: printColorMode === 'color' ||
                          (printColorMode === 'auto' && analysisResults.some(r => isPageColor(r))),
            fitOption: fitOption, // 'fit' or 'fill'
            orientation: orientation // 'portrait' or 'landscape'
          };
    
          // Show printing status
          setAnalysisProgress('Enviando trabajo a la impresora...');
          setIsAnalyzing(true);
    
          // Send to printer
          const printResult = await window.electronAPI.printDocument(jobData);
    
          setIsAnalyzing(false);
          setAnalysisProgress('');
    
          if (!printResult.success) {
            throw new Error(printResult.message || 'Error desconocido al imprimir');
          }
    
          // If print succeeded, save sale and generate ticket
          // Tomar primer archivo como identificador principal o resumen
          const mainFile = files[0].split(/[\\/]/).pop() || 'Varios';
          const { rows: printRows, cols: printCols } = getLayoutDimensions(imageLayout, orientation);
          const pagesPerSheet = printRows * printCols;
          const sheetsPerSet = Math.max(1, Math.ceil(printItems.length / pagesPerSheet));
          const totalPages = sheetsPerSet * copies;
    
          // Desglose de páginas para guardar (using original analysis results, not expanded)
          const desgloses = analysisResults.map((r, i) => ({
            pagina: i + 1,
            esColor: r.esColor,
            cobertura: r.cobertura,
            esAltaDensidadBN: r.esAltaDensidadBN
          }));
    
          const saleData = {
            archivo: files.length > 1 ? `${mainFile} (+${files.length - 1} más)` : mainFile,
            paginas: totalPages,
            copias: copies, // Job-level copies
            costo_tinta: costs.subtotalTinta,
            costo_fijo: costs.baseFee,
            total: costs.total,
            tipo_impresion: pricingMode === 'smart' ? 'Tarifa Inteligente' : 'Tarifa Fija',
            detalles: desgloses
          };
    
          const result = await window.electronAPI.saveSale(saleData);
    
          // Asignar ID retornado por SQLite para el ticket
          const completedSale = { ...saleData, id: result.lastInsertRowid };
    
          // Generar código QR para el ticket
          const qrData = JSON.stringify({
            id: completedSale.id,
            total: completedSale.total.toFixed(2),
            fecha: new Date().toLocaleString()
          });
          const qrDataURL = await window.electronAPI.generateQR(qrData);
    
          setTicketQr(qrDataURL);
          setActiveTicketData(completedSale);
          setShowTicketModal(true);
    
          // Recargar el historial diario
          fetchCorteDiario();
    
          // Limpiar el espacio de trabajo para la siguiente venta
          handleClearAll();
    
        } catch (e) {
          setIsAnalyzing(false);
          setAnalysisProgress('');
          console.error(e);
          alert('Error al imprimir: ' + (e.message || 'Error desconocido'));
        }
      };
    
      const handlePhysicalPrint = async () => {
        if (!activeTicketData) return;
        if (!selectedPrinter) {
          alert('Por favor, seleccione una impresora.');
          return;
        }
        try {
          const result = await window.electronAPI.printTicket(activeTicketData, selectedPrinter);
          if (!result?.success) {
            throw new Error(result?.reason || 'La impresora rechazó el ticket.');
          }
          alert(`Ticket enviado a la impresora "${selectedPrinter}".`);
        } catch (e) {
          console.error(e);
          alert('No se pudo imprimir el ticket físicamente (revisa tu impresora).');
        }
      };
    
      // Re-imprimir ticket histórico
      const handlePrintHistoryTicket = async (sale: any) => {
        let parsedDetalles = [];
        try {
          parsedDetalles = typeof sale.detalles === 'string' ? JSON.parse(sale.detalles) : sale.detalles;
        } catch (e) {}
    
        const completedSale = {
          id: sale.id,
          archivo: sale.archivo,
          paginas: sale.paginas,
          copias: sale.copias,
          costo_tinta: sale.costo_tinta,
          costo_fijo: sale.costo_fijo,
          total: sale.total,
          detalles: parsedDetalles
        };
    
        const qrData = JSON.stringify({
          id: completedSale.id,
          total: completedSale.total.toFixed(2),
          fecha: new Date(sale.fecha).toLocaleString()
        });
        const qrDataURL = await window.electronAPI.generateQR(qrData);
    
        setTicketQr(qrDataURL);
        setActiveTicketData(completedSale);
        setShowTicketModal(true);
      };
    
      const renderScanTab = () => {
        const printItems = getPrintItemsForPreview();
        const { rows: rowsPerPage, cols: colsPerPage } = getLayoutDimensions(imageLayout, orientation);
        const cellsPerPage = rowsPerPage * colsPerPage;
        const totalPages = Math.max(1, Math.ceil(printItems.length / cellsPerPage));
        const activePreviewPage = Math.min(previewPage, totalPages);
    
        // Slice items for current preview page
        const startIndex = (activePreviewPage - 1) * cellsPerPage;
        const itemsOnThisPage = printItems.slice(startIndex, startIndex + cellsPerPage);
        const previewDims = getPreviewDimensions(paperSize, orientation);
    
        // Physical sheets calculation
        const sheetsPerSet = Math.max(1, Math.ceil(printItems.length / cellsPerPage));
        const totalSheets = analysisResults.length === 0 ? 0 : sheetsPerSet * copies;
    
        return (
          <div className="workspace">
            <div className="workspace-left">
              {/* Upload Zone */}
              <div
                className="dropzone"
                onClick={handleSelectFiles}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropFiles}
              >
                <div className="dropzone-icon">📁</div>
                <div className="dropzone-text">Cargar Documentos o Imágenes</div>
                <div className="dropzone-subtext">Soporta PDF, Word, Excel, PowerPoint y todo tipo de imágenes</div>
              </div>
    
              {/* Scanned Pages Grid */}
              <div className="grid-container">
                <div className="grid-title">
                  <span>ARCHIVOS / PÁGINAS ({analysisResults.length})</span>
                  {analysisResults.length > 0 && (
                    <button className="clear-btn" onClick={handleClearAll}>Limpiar Todo</button>
                  )}
                </div>
    
                {isAnalyzing && (
                  <div className="loading-panel">
                    <div className="spinner"></div>
                    <div style={{fontWeight: 600, fontSize: '14px'}}>{analysisProgress}</div>
                    <div style={{color: 'var(--text-secondary)', fontSize: '12px'}}>Procesando páginas y detectando cobertura...</div>
                  </div>
                )}
    
                {!isAnalyzing && analysisResults.length === 0 && (
                  <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '13px'}}>
                    Ningún archivo cargado todavía. Usa el botón de arriba o escanea el QR desde tu móvil para subir archivos.
                  </div>
                )}
    
                {!isAnalyzing && analysisResults.length > 0 && (
                  <div className="previews-grid">
                    {analysisResults.map((page, index) => {
                      const isSelected = selectedPage?.path === page.path && selectedPage?.pageIndex === page.pageIndex;
                      const name = page.path.split(/[\\/]/).pop() || 'Archivo';
    
                      const pageIsColor = isPageColor(page);
                      let badge = (
                        <span
                          className={`tile-badge ${pageIsColor ? 'badge-color' : (page.esAltaDensidadBN ? 'badge-bw-high' : 'badge-bw')}`}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onClick={(event) => {
                            event.stopPropagation();
                            togglePageColor(page);
                          }}
                          title="Haz clic para alternar entre Color y Blanco/Negro"
                        >
                          {pageIsColor
                            ? `🎨 Color · ${page.cobertura.toFixed(1)}%`
                            : (page.esAltaDensidadBN ? `⚫ B/N Alta · ${page.cobertura.toFixed(1)}%` : `⚫ B/N · ${page.cobertura.toFixed(1)}%`)}
                        </span>
                      );
    
                      return (
                        <div
                          key={`${page.path}-${page.pageIndex}`}
                          className={`page-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedPage(page)}
                        >
                          <div className="tile-header">
                            <div className="tile-name" title={name}>
                              <span className="tile-file-icon">▧</span>
                              {page.isDocumentPage ? `Pág. ${page.pageIndex + 1} - ` : ''}{name}
                              {page.isDocumentPage && <span className="tile-page-count">({page.pageIndex + 1} pág.)</span>}
                            </div>
                            <div className="tile-copy-control">
                              <span>Copias:</span>
                              <button
                                type="button"
                                className="tile-copy-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedPage(page);
                                  updatePageQuantity(page, Math.max(1, (page.quantity || 1) - 1));
                                }}
                              >−</button>
                              <span>{page.quantity || 1}</span>
                              <button
                                type="button"
                                className="tile-copy-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  updatePageQuantity(page, (page.quantity || 1) + 1);
                                  setSelectedPage({ ...page, quantity: (page.quantity || 1) + 1 });
                                }}
                              >+</button>
                            </div>
                          </div>
                          <div className="tile-thumb-container">
                            <img
                              src={page.imagePath}
                              alt={`Page ${index}`}
                              className="tile-thumb"
                              style={{
                                transform: `rotate(${page.rotation || 0}deg)`,
                                filter: pageIsColor ? 'none' : 'grayscale(100%) contrast(105%)',
                                transition: 'transform 0.2s ease, filter 0.25s ease'
                              }}
                            />
                          </div>
                          <div className="tile-info">
                            <div className="tile-type">{page.isDocumentPage ? 'Documento' : 'Imagen'}</div>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', marginTop: '3px', flexWrap: 'wrap' }}>
                              {badge}
                              {(page.rotation || 0) > 0 && (
                                <span className="tile-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}>
                                  ↻ {page.rotation}°
                                </span>
                              )}
                            </div>
                            <div className="tile-price">
                              ${getPageUnitCost(page).toFixed(2)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="tile-remove"
                            onClick={(event) => {
                              event.stopPropagation();
                              setAnalysisResults(current => current.filter(item => (
                                item.path !== page.path || item.pageIndex !== page.pageIndex
                              )));
                              setSelectedPage(current => (
                                current && current.path === page.path && current.pageIndex === page.pageIndex
                                  ? null
                                  : current
                              ));
                            }}
                            aria-label={`Eliminar ${name}`}
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
    
            <div className="workspace-right">
              {/* Paper Viewport */}
              <div className="canvas-area">
                {printItems.length === 0 ? (
                  <div className="paper-empty">
                    <div className="paper-empty-icon">📄</div>
                    <div>Visualizador de Página</div>
                    <div style={{fontSize: '12px', opacity: 0.7}}>Selecciona o carga imágenes para ver la vista previa exacta</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', height: '100%', justifyContent: 'center' }}>
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '13px', background: 'rgba(0,0,0,0.4)', padding: '4px 14px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                          disabled={activePreviewPage <= 1}
                          style={{ background: 'none', border: 'none', color: activePreviewPage <= 1 ? '#555' : '#fff', cursor: activePreviewPage <= 1 ? 'default' : 'pointer', fontSize: '14px', padding: '0 4px' }}
                        >◀</button>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Página {activePreviewPage} de {totalPages}</span>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(p => Math.min(totalPages, p + 1))}
                          disabled={activePreviewPage >= totalPages}
                          style={{ background: 'none', border: 'none', color: activePreviewPage >= totalPages ? '#555' : '#fff', cursor: activePreviewPage >= totalPages ? 'default' : 'pointer', fontSize: '14px', padding: '0 4px' }}
                        >▶</button>
                      </div>
                    )}
    
                    {/* Paper sheet */}
                    <div
                      className="paper"
                      style={{
                        width: `${previewDims.width}px`,
                        height: `${previewDims.height}px`,
                        padding: '12px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        className="preview-grid"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${colsPerPage}, 1fr)`,
                          gridTemplateRows: `repeat(${rowsPerPage}, 1fr)`,
                          gap: '4px',
                          width: '100%',
                          height: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        {itemsOnThisPage.map((item, index) => {
                          const rot = (item.rotation || 0) % 360;
                          const isRot90 = (rot === 90 || rot === 270);
                          const cellWidthPx = Math.max(10, Math.floor((previewDims.width - 24 - (colsPerPage - 1) * 4) / colsPerPage));
                          const cellHeightPx = Math.max(10, Math.floor((previewDims.height - 24 - (rowsPerPage - 1) * 4) / rowsPerPage));
    
                          return (
                            <div
                              key={index}
                              className="preview-cell"
                              style={{
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                border: '1px dashed rgba(0, 0, 0, 0.12)',
                                borderRadius: '2px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div
                                style={{
                                  width: isRot90 ? `${cellHeightPx}px` : '100%',
                                  height: isRot90 ? `${cellWidthPx}px` : '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transform: `rotate(${rot}deg)`,
                                  transformOrigin: 'center center',
                                  flexShrink: 0
                                }}
                              >
                                <img
                                  src={item.imagePath}
                                  alt={`Preview ${index}`}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: fitOption === 'fill' ? 'cover' : 'contain',
                                    filter: isPageColor(item) ? 'none' : 'grayscale(100%) contrast(105%)',
                                    transition: 'filter 0.25s ease'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
    
                        {/* Empty layout slots: remaining spaces shown empty without duplicate images */}
                        {Array.from({ length: cellsPerPage - itemsOnThisPage.length }).map((_, emptyIdx) => (
                          <div
                            key={`empty-${emptyIdx}`}
                            className="preview-cell empty"
                            style={{
                              backgroundColor: 'white',
                              border: '1px dashed rgba(0, 0, 0, 0.1)',
                              borderRadius: '2px',
                              boxSizing: 'border-box'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
    
              {/* Pricing Panel */}
              <div className="cost-panel">
                <div className="cost-row">
                  <span>Impresora de Destino:</span>
                  <span className="cost-row highlight" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedPrinter || 'Sin seleccionar'}>
                    {selectedPrinter || 'Sin seleccionar'}
                  </span>
                </div>
    
                <div className="cost-row">
                  <span>Hojas totales a imprimir:</span>
                  <span className="cost-row highlight">
                    {analysisResults.length === 0
                      ? '0 hojas'
                      : `${totalSheets} ${totalSheets === 1 ? 'hoja' : 'hojas'} (${sheetsPerSet} ${sheetsPerSet === 1 ? 'juego' : 'juegos'} x ${copies})`}
                  </span>
                </div>
    
                <div className="cost-row">
                  <span>Modo tarifa:</span>
                  <span className="cost-row highlight" style={{color: pricingMode === 'smart' ? 'var(--primary)' : 'white'}}>
                    {pricingMode === 'smart' ? 'Tarifa Inteligente' : 'Tarifa Fija'}
                  </span>
                </div>
    
                {totalBwImpressions > 0 && (
                  <div className="cost-row" style={{ color: '#38bdf8', fontSize: '11px', background: 'rgba(56, 189, 248, 0.1)', padding: '5px 8px', borderRadius: '4px', marginTop: '2px' }}>
                    <span>🏷️ Escala B/N ({totalBwImpressions} copias):</span>
                    <span style={{ fontWeight: 700 }}>${bwTier.rate.toFixed(2)}/copia ({bwTier.range})</span>
                  </div>
                )}
    
                <div className="cost-divider"></div>
    
                <div className="cost-row">
                  <span>Subtotal Tinta:</span>
                  <span>${costs.subtotalTinta.toFixed(2)}</span>
                </div>
    
                <div className="cost-row">
                  <span>Cargo Base de Impresión:</span>
                  <span>${costs.baseFee.toFixed(2)}</span>
                </div>
    
                <div className="cost-divider"></div>
    
                <div className="cost-total-row" style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="cost-total-label">TOTAL A COBRAR:</span>
                    {correctedTotal !== null && (
                      <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>
                        Sugerido: ${costs.calculatedTotal.toFixed(2)} (Ajustado)
                      </span>
                    )}
                  </div>
    
                  {isEditingPrice ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>$</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="input-text"
                        style={{ width: '85px', fontSize: '16px', fontWeight: 700, padding: '4px 6px', textAlign: 'right' }}
                        value={priceCorrectionInput}
                        onChange={(e) => setPriceCorrectionInput(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="button button-success"
                        style={{ padding: '5px 8px', fontSize: '12px' }}
                        onClick={handleApplyPriceCorrection}
                        title="Guardar corrección y enseñar a la IA"
                      >
                        ✓ Guardar
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ padding: '5px 8px', fontSize: '12px' }}
                        onClick={() => setIsEditingPrice(false)}
                        title="Cancelar edición"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="cost-total-value">
                        ${costs.total.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="button button-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                        onClick={() => {
                          setPriceCorrectionInput(costs.total.toFixed(2));
                          setIsEditingPrice(true);
                        }}
                        title="Corregir precio si fue erróneo (el programa aprenderá para futuras ocasiones)"
                      >
                        ✏️ Corregir
                      </button>
                      {correctedTotal !== null && (
                        <button
                          type="button"
                          className="button button-secondary"
                          style={{ padding: '3px 6px', fontSize: '11px', color: '#f87171' }}
                          onClick={() => {
                            setCorrectedTotal(null);
                            setPriceCorrectionInput('');
                          }}
                          title="Restablecer precio calculado originalmente"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  )}
                </div>
    
                <button
                  className="button button-success"
                  style={{marginTop: '8px', fontSize: '15px'}}
                  disabled={analysisResults.length === 0}
                  onClick={handlePrintAndRegister}
                >
                  💵 COBRAR E IMPRIMIR
                </button>
              </div>
            </div>
          </div>
        );
      };
    
      const renderHistoryTab = () => {
        return (
          <div className="history-panel">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Ventas Registradas</span>
                <span className="stat-value primary">{corteSummary.num_ventas}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Ingresos de Tinta/Hojas</span>
                <span className="stat-value success">${corteSummary.total_tinta?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Caja Total (con Cargo Base)</span>
                <span className="stat-value success" style={{color: 'var(--success)', textShadow: '0 0 10px var(--success-glow)'}}>
                  ${corteSummary.total_general?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
    
            <div className="table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Archivo / Trabajo</th>
                    <th>Páginas</th>
                    <th>Copias</th>
                    <th>Costo Tinta</th>
                    <th>Cargo Base</th>
                    <th>Total</th>
                    <th>Fecha / Hora</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {corteSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{textAlign: 'center', padding: '30px', color: 'var(--text-secondary)'}}>
                        No hay ventas registradas el día de hoy.
                      </td>
                    </tr>
                  ) : (
                    corteSales.map((sale) => (
                      <tr key={sale.id}>
                        <td>#{sale.id}</td>
                        <td>
                          <div className="table-file-name" title={sale.archivo}>{sale.archivo}</div>
                        </td>
                        <td>{sale.paginas}</td>
                        <td>{sale.copias} x</td>
                        <td>${sale.costo_tinta.toFixed(2)}</td>
                        <td>${sale.costo_fijo.toFixed(2)}</td>
                        <td style={{fontWeight: 'bold', color: 'var(--success)'}}>${sale.total.toFixed(2)}</td>
                        <td className="table-date">{new Date(sale.fecha).toLocaleTimeString()}</td>
                        <td>
                          <span className="action-link" onClick={() => handlePrintHistoryTicket(sale)}>Ver Ticket</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      };
    
      return (
        <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
          {/* Sidebar Controls */}
          <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
            <div className="brand-section">
              <img src={logo} alt="PrintStudio Pro" className="brand-image" style={{width:48, height:48, borderRadius:8, marginRight:10}} />
              <div style={{display:'flex', flexDirection:'column'}}>
                <span className="brand-name">PrintStudio Pro</span>
                <span style={{fontSize:11, color:'var(--text-secondary)'}}>Sistema Inteligente de Impresión</span>
              </div>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>
    
            <div className="sidebar-group">
              <span className="sidebar-title">CONFIGURACIÓN TRABAJO</span>
    
              <div>
                <label className="field-label">Impresora Seleccionada</label>
                <select
                  className="input-select"
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  disabled={isLoadingPrinters || printers.length === 0}
                >
                  {isLoadingPrinters ? (
                    <option value="">Cargando impresoras...</option>
                  ) : printers.length === 0 ? (
                    <option value="">No se encontraron impresoras</option>
                  ) : (
                    printers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} {p.isDefault ? '(Predeterminada)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
    
              <div>
                <label className="field-label">Tamaño del Papel</label>
                <select className="input-select" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                  <option>Carta</option>
                  <option>Oficio</option>
                  <option>Oficio México</option>
                  <option>Doble Carta / Tabloide</option>
                </select>
              </div>
    
              <div>
                <label className="field-label">Copias de cada Página (Juegos)</label>
                <div className="input-row wheel-control" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="input-text"
                    min={1}
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    onWheel={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 1 : -1;
                      setCopies(Math.max(1, copies + delta));
                    }}
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => setCopies(c => c + 1)}
                      title="Aumentar copias"
                    >▲</button>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      disabled={copies <= 1}
                      onClick={() => setCopies(c => Math.max(1, c - 1))}
                      title="Disminuir copias"
                    >▼</button>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Escribe o usa el scroll del mouse
                </div>
              </div>
    
              {/* Orientation Selection */}
              <div>
                <label className="field-label">Orientación del Papel</label>
                <select
                  className="input-select"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
                  }}
                >
                  <option value="portrait">Vertical (Retrato)</option>
                  <option value="landscape">Horizontal (Paisaje)</option>
                </select>
              </div>
    ✓ • 4.54s

## Activity

    $ rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -Skip 1580 -First 500'; rtk pwsh -Command 'Get-Content "src/App.tsx" | Select-Object -Skip 2080 -First 420'
    
              {/* Layout Selection */}
              <div>
                <label className="field-label">Diseño de Página (Fotos por hoja)</label>
                <select
                  className="input-select"
                  value={imageLayout}
                  onChange={(e) => {
                    setImageLayout(parseInt(e.target.value));
                    setPreviewPage(1);
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const layouts = [1, 2, 3, 4, 5, 7, 8, 9, 10, 35];
                    const currentIndex = layouts.indexOf(imageLayout);
                    let newIndex = currentIndex;
                    if (e.deltaY < 0) {
                      newIndex = (currentIndex - 1 + layouts.length) % layouts.length;
                    } else if (e.deltaY > 0) {
                      newIndex = (currentIndex + 1) % layouts.length;
                    }
                    setImageLayout(layouts[newIndex]);
                    setPreviewPage(1);
                  }}
                >
                  <option value={1}>Página completa (1)</option>
                  <option value={2}>5 x 7 pulg. (2)</option>
                  <option value={3}>3 fotos por página (3)</option>
                  <option value={4}>3.5 x 5 pulg. (4)</option>
                  <option value={5}>5 fotos por página (5)</option>
                  <option value={7}>7 fotos por página (7)</option>
                  <option value={8}>8 fotos por página (8)</option>
                  <option value={9}>Billetera (9)</option>
                  <option value={10}>10 fotos por página (10)</option>
                  <option value={35}>Hoja de contactos (35)</option>
                </select>
              </div>
    
              {/* Fit or Fill */}
              <div>
                <label className="field-label">Ajuste en la celda</label>
                <select className="input-select" value={fitOption} onChange={(e) => setFitOption(e.target.value as 'fit' | 'fill')}>
                  <option value="fit">Ajustar (completa sin recortar)</option>
                  <option value="fill">Rellenar celda (sin bordes)</option>
                </select>
              </div>
    
              <div className="print-mode-control">
                <label className="field-label">Modo de impresión</label>
                <div className="print-mode-buttons" role="group" aria-label="Modo de impresión">
                  <button
                    type="button"
                    className={`print-mode-button ${printColorMode === 'auto' ? 'active' : ''}`}
                    onClick={() => setPrintColorMode('auto')}
                    title="Detectar automáticamente si cada archivo es color o blanco y negro"
                  >
                    Automático
                  </button>
                  <button
                    type="button"
                    className={`print-mode-button color ${printColorMode === 'color' ? 'active' : ''}`}
                    onClick={() => setPrintColorMode('color')}
                    title="Imprimir usando color"
                  >
                    🎨 Color
                  </button>
                  <button
                    type="button"
                    className={`print-mode-button bw ${printColorMode === 'bw' ? 'active' : ''}`}
                    onClick={() => setPrintColorMode('bw')}
                    title="Imprimir en blanco y negro"
                  >
                    ⚫ B/N
                  </button>
                </div>
                <div className="print-mode-help">
                  {printColorMode === 'auto'
                    ? 'Usa el análisis de cada imagen'
                    : printColorMode === 'color'
                      ? 'Forzado a impresión a color'
                      : 'Forzado a blanco y negro'}
                </div>
              </div>
    
              {/* Per-Image Rotation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="field-label" style={{ marginBottom: 0 }}>Rotación de Imagen</label>
                  {analysisResults.length > 0 && (
                    <>
                      <span
                        onClick={() => rotateAllImages(90)}
                        style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        title="Rotar todas las imágenes 90°"
                      >
                        Rotar todas
                      </span>
                      <span
                        onClick={() => resetAllRotations()}
                        style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', marginLeft: '8px' }}
                        title="Restablecer rotación de todas las imágenes a 0°"
                      >
                        Reset todas
                      </span>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    disabled={!selectedPage}
                    onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) + 90)}
                    title="Girar 90°"
                  >
                    🔄 90°
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    disabled={!selectedPage}
                    onClick={() => updateSelectedRotation(0)}
                    title="Restablecer rotación a 0°"
                  >
                    ⤾ 0°
                  </button>
                  <select
                    className="input-select"
                    style={{ flex: 1 }}
                    value={(selectedPage?.rotation || 0) % 360}
                    disabled={!selectedPage}
                    onChange={(e) => updateSelectedRotation(parseInt(e.target.value) || 0)}
                    onWheel={(e) => {
                      if (!selectedPage) return;
                      e.stopPropagation();
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 90 : -90;
                      updateSelectedRotation((selectedPage.rotation || 0) + delta);
                    }}
                  >
                    <option value={0}>0° (Normal)</option>
                    <option value={90}>90° (Derecha)</option>
                    <option value={180}>180° (Invertido)</option>
                    <option value={270}>270° (Izquierda)</option>
                  </select>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  {selectedPage ? `Giro actual: ${selectedPage.rotation || 0}°` : 'Selecciona una imagen'}
                </div>
              </div>
    
              {/* Per-Image Quantity */}
              <div>
                <label className="field-label">Cantidad de esta Imagen</label>
                <div className="input-row wheel-control" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="input-text"
                    min={1}
                    value={selectedPage ? (selectedPage.quantity || 1) : 1}
                    disabled={!selectedPage}
                    onChange={(e) => updateSelectedQuantity(parseInt(e.target.value) || 1)}
                    onWheel={(e) => {
                      if (!selectedPage) return;
                      e.stopPropagation();
                      e.preventDefault();
                      const delta = e.deltaY < 0 ? 1 : -1;
                      updateSelectedQuantity((selectedPage.quantity || 1) + delta);
                    }}
                    style={{ flex: 1 }}
                  />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      disabled={!selectedPage}
                      onClick={() => updateSelectedQuantity((selectedPage?.quantity || 1) + 1)}
                      title="Aumentar cantidad"
                    >▲</button>
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      disabled={!selectedPage || (selectedPage?.quantity || 1) <= 1}
                      onClick={() => updateSelectedQuantity((selectedPage?.quantity || 1) - 1)}
                      title="Disminuir cantidad"
                    >▼</button>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Escribe o usa el scroll del mouse
                </div>
              </div>
            </div>
    
            <div className="sidebar-group">
              <span className="sidebar-title">PRECIOS Y TARIFAS</span>
    
              <div className="input-row">
                <div className="input-col">
                  <label className="field-label">Cargo Base ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.5"
                    value={costBase}
                    onChange={(e) => setCostBase(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div className="input-col">
                  <label className="field-label">Pág. B/N ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.1"
                    value={costBW}
                    onChange={(e) => setCostBW(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
    
              <div className="input-row">
                <div className="input-col">
                  <label className="field-label">B/N Alta Dens ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.5"
                    value={costBWHigh}
                    onChange={(e) => setCostBWHigh(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
                <div className="input-col">
                  <label className="field-label">Pág. Color ($)</label>
                  <input
                    type="number"
                    className="input-text"
                    min={0}
                    step="0.5"
                    value={costColor}
                    onChange={(e) => setCostColor(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>
    
              <div>
                <label className="field-label">Modelo de Cobro</label>
                <select className="input-select" value={pricingMode} onChange={(e) => setPricingMode(e.target.value as 'fixed' | 'smart')}>
                  <option value="fixed">Tarifa Fija (Estándar)</option>
                  <option value="smart">Tarifa Inteligente (Por Cobertura)</option>
                </select>
                <span style={{fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', lineHeight: '1.3'}}>
                  {pricingMode === 'fixed'
                    ? 'Se cobra precio fijo por color o B/N sin importar cuánta tinta se use.'
                    : 'Calcula una tarifa gradual con cobertura de tinta y porcentaje real de color.'
                  }
                </span>
              </div>
    
              <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    🧠 Escala B/N por Volumen
                  </span>
                  <span style={{ fontSize: '9.5px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 5px', borderRadius: '4px' }}>
                    {learningModel.total_corrections || 0} aprendidas
                  </span>
                </div>
    
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '10.5px' }}>
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>1 - 50 copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier1_rate ?? 1.00).toFixed(2)}</div>
                  </div>
    
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>51 - 100 copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier2_rate ?? 0.80).toFixed(2)}</div>
                  </div>
    
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>101 - 200 copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier3_rate ?? 0.50).toFixed(2)}</div>
                  </div>
    
                  <div style={{
                    padding: '5px 6px',
                    background: totalBwImpressions >= 201 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: totalBwImpressions >= 201 ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px'
                  }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9.5px' }}>201+ copias</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>${(learningModel.tier4_rate ?? 0.40).toFixed(2)}</div>
                  </div>
                </div>
    
                {(learningModel.total_corrections || 0) > 0 && (
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ marginTop: '8px', width: '100%', padding: '4px', fontSize: '10px' }}
                    onClick={handleResetLearning}
                    title="Restablecer aprendizaje a tarifas originales"
                  >
                    ↺ Restablecer Aprendizaje IA
                  </button>
                )}
              </div>
            </div>
    
            {/* Multi-Mode Mobile Import Section */}
            <div className="qr-section">
              <span className="qr-title">📱 Importar desde Celular</span>
    
              {/* Mode Selector */}
              <div className="qr-mode-tabs" role="tablist">
                <button
                  type="button"
                  className={`qr-mode-tab ${connectionMode === 'hotspot' ? 'active' : ''}`}
                  onClick={() => setConnectionMode('hotspot')}
                  title="Envía archivos directamente sin necesidad de red Wi-Fi externa o internet"
                >
                  📶 Sin Wi-Fi
                </button>
                <button
                  type="button"
                  className={`qr-mode-tab ${connectionMode === 'wifi' ? 'active' : ''}`}
                  onClick={() => setConnectionMode('wifi')}
                  title="Celular y PC conectados a la misma red Wi-Fi local"
                >
                  🌐 Wi-Fi Local
                </button>
                <button
                  type="button"
                  className={`qr-mode-tab ${connectionMode === 'internet' ? 'active' : ''}`}
                  onClick={() => setConnectionMode('internet')}
                  title="Conexión remota por datos móviles (4G/5G) vía Internet"
                >
                  ☁️ Datos
                </button>
              </div>
    
              {/* MODO 1: HOTSPOT DIRECTO (SIN RED WI-FI) */}
              {connectionMode === 'hotspot' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <div className="hotspot-status-box">
                    <div className="hotspot-badge-row">
                      <span>Punto de Acceso PC:</span>
                      <span className={`hotspot-badge ${hotspotInfo?.state === 'On' ? 'on' : 'off'}`}>
                        {hotspotInfo?.state === 'On' ? '● ACTIVA' : '○ INACTIVA'}
                      </span>
                    </div>
    
                    {hotspotInfo?.state === 'On' && hotspotInfo.ssid && (
                      <div style={{ fontSize: '9.5px', color: '#cbd5e1', lineHeight: '1.3' }}>
                        <div><strong>Red:</strong> {hotspotInfo.ssid}</div>
                        {hotspotInfo.password && <div><strong>Contraseña:</strong> {hotspotInfo.password}</div>}
                      </div>
                    )}
    
                    <button
                      type="button"
                      className="hotspot-toggle-btn"
                      onClick={handleToggleHotspot}
                      disabled={isTogglingHotspot}
                    >
                      {isTogglingHotspot
                        ? 'Cambiando estado...'
                        : hotspotInfo?.state === 'On'
                          ? 'Desactivar Zona Móvil'
                          : '⚡ Activar Zona Móvil de esta PC'}
                    </button>
                  </div>
    
                  {/* Paso 1 vs Paso 2 */}
                  <div className="hotspot-step-tabs">
                    <button
                      type="button"
                      className={`hotspot-step-btn ${hotspotStep === 'wifi' ? 'active' : ''}`}
                      onClick={() => setHotspotStep('wifi')}
                    >
                      1. Conectar Wi-Fi
                    </button>
                    <button
                      type="button"
                      className={`hotspot-step-btn ${hotspotStep === 'upload' ? 'active' : ''}`}
                      onClick={() => setHotspotStep('upload')}
                    >
                      2. Subir Archivos
                    </button>
                  </div>
    
                  {hotspotStep === 'wifi' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        className="qr-image-wrapper"
                        onClick={() => {
                          if (wifiConnectQr) {
                            setBigQrData({
                              title: 'Paso 1: Conectar al Wi-Fi de la PC',
                              subtitle: `Escanea con la cámara de tu teléfono para conectarte automáticamente a la red "${hotspotInfo?.ssid || 'de la PC'}". No requiere internet ni router externo.`,
                              qr: wifiConnectQr,
                              helpText: hotspotInfo?.password ? `Contraseña de red: ${hotspotInfo.password}` : undefined
                            });
                            setShowBigQrModal(true);
                          }
                        }}
                      >
                        {wifiConnectQr ? (
                          <img src={wifiConnectQr} className="qr-image" alt="QR Conectar Wi-Fi" />
                        ) : (
                          <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)' }}>
                            Activa la Zona Móvil
                          </div>
                        )}
                      </div>
                      <p className="qr-instructions">
                        <strong>Paso 1:</strong> Escanea para conectar el celular al Wi-Fi de la PC.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        className="qr-image-wrapper"
                        onClick={() => {
                          if (hotspotUploadQr) {
                            setBigQrData({
                              title: 'Paso 2: Subir Archivos a la PC',
                              subtitle: 'Abre la página web de subida en tu teléfono móvil para enviar tus fotos o documentos a imprimir.',
                              qr: hotspotUploadQr,
                              helpText: `Enlace directo: http://${hotspotIp}:3500${uploadRoute}`
                            });
                            setShowBigQrModal(true);
                          }
                        }}
                      >
                        {hotspotUploadQr ? (
                          <img src={hotspotUploadQr} className="qr-image" alt="QR Subir Archivos Hotspot" />
                        ) : (
                          <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}></div>
                        )}
                      </div>
                      <p className="qr-instructions">
                        <strong>Paso 2:</strong> Escanea para abrir la web y enviar archivos.
                      </p>
                    </div>
                  )}
                </div>
              )}
    
              {/* MODO 2: MISMA RED WI-FI LOCAL */}
              {connectionMode === 'wifi' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  <div
                    className="qr-image-wrapper"
                    onClick={() => {
                      if (wifiUploadQr) {
                        setBigQrData({
                          title: 'Subir desde la Misma Red Wi-Fi',
                          subtitle: 'Celular y computadora deben estar conectados a la misma red Wi-Fi o módem.',
                          qr: wifiUploadQr,
                          helpText: `Enlace local: http://${wifiIp || 'localhost'}:3500${uploadRoute}`
                        });
                        setShowBigQrModal(true);
                      }
                    }}
                  >
                    {wifiUploadQr ? (
                      <img src={wifiUploadQr} className="qr-image" alt="QR Wi-Fi Local" />
                    ) : (
                      <div style={{ width: 124, height: 124, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)' }}>
                        Sin Wi-Fi detectado
                      </div>
                    )}
                  </div>
                  <p className="qr-instructions">
                    Escanea si tu celular y esta PC están en el <strong>mismo Wi-Fi</strong>.
                  </p>
                  <span className="qr-highlight-text">
                    IP: {wifiIp || 'No conectada'}
                  </span>
                </div>
              )}
    
              {/* MODO 3: INTERNET / DATOS MÓVILES */}
              {connectionMode === 'internet' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  <div
                    className="qr-image-wrapper"
                    onClick={() => {
                      if (tunnelUploadQr) {
                        setBigQrData({
                          title: 'Subir por Datos Móviles / Internet',
                          subtitle: 'Para clientes con datos móviles (4G/5G).',
                          qr: tunnelUploadQr,
                          helpText: tunnelPassword ? `Si la página solicita contraseña o IP, escribe: ${tunnelPassword}` : publicUploadUrl
                        });
                        setShowBigQrModal(true);
                      }
                    }}
                  >
                    {tunnelUploadQr ? (
                      <img src={tunnelUploadQr} className="qr-image" alt="QR Internet Túnel" />
                    ) : (
                      <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', padding: 8 }}>
                        Generando túnel público...
                      </div>
                    )}
                  </div>
                  <p className="qr-instructions">
                    Escanea desde cualquier red o datos móviles 4G/5G.
                  </p>
                  {tunnelPassword && (
                    <div style={{ fontSize: '9px', background: 'rgba(99,102,241,0.15)', padding: '3px 6px', borderRadius: '4px', color: '#c7d2fe', textAlign: 'center' }}>
                      Contraseña túnel: <strong>{tunnelPassword}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div
            className="sidebar-resizer"
            onPointerDown={handleSidebarResize}
            role="separator"
            aria-label="Redimensionar panel lateral"
            title="Arrastra para cambiar el ancho del panel"
          />
    
          {/* Main Panel Area */}
          <div className="main-content">
            <div className="header-nav">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scan')}
                >
                  🖥️ Escáner y Precios
                </button>
                <button
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('history');
                    fetchCorteDiario(); // Refrescar corte al entrar
                  }}
                >
                  📊 Corte Diario y Reporte
                </button>
              </div>
    
              <div className="server-status">
                <div className="status-dot"></div>
                <span>Servidor Móvil Activo (Puerto 3500)</span>
              </div>
            </div>
    
            {activeTab === 'scan' ? renderScanTab() : renderHistoryTab()}
          </div>
    
          {/* Ticket Modal popup */}
          {showTicketModal && activeTicketData && (
            <div className="modal-backdrop" onClick={() => setShowTicketModal(false)}>
              <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ticket-header">
                  <h2>COMPROBANTE</h2>
                  <p>YARS Smart Printer Pro</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
    
                <div className="ticket-divider"></div>
    
                <div className="ticket-body">
                  <div className="ticket-row bold">
                    <span>CONCEPTO</span>
                    <span>VALOR</span>
                  </div>
                  <div className="ticket-row">
                    <span style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {activeTicketData.archivo}
                    </span>
                    <span>#{activeTicketData.id}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Total de Hojas:</span>
                    <span>{activeTicketData.paginas}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Copias:</span>
                    <span>{activeTicketData.copias} x</span>
                  </div>
                  <div className="ticket-row">
                    <span>Subtotal Tinta:</span>
                    <span>${activeTicketData.costo_tinta.toFixed(2)}</span>
                  </div>
                  <div className="ticket-row">
                    <span>Cargo Servicio Base:</span>
                    <span>${activeTicketData.costo_fijo.toFixed(2)}</span>
                  </div>
    
                  <div className="ticket-divider"></div>
    
                  <div className="ticket-row total-row">
                    <span>TOTAL:</span>
                    <span>${activeTicketData.total.toFixed(2)}</span>
                  </div>
                </div>
    
                <div className="ticket-divider"></div>
    
                <div className="ticket-qr">
                  <p style={{fontSize: '10px', color: '#4b5563', fontWeight: 600}}>Escanea para ver detalles en la base de datos</p>
                  {ticketQr && <img src={ticketQr} alt="Ticket QR" />}
                </div>
    
                <div className="ticket-footer">
                  <p>¡Gracias por su preferencia en nuestra Papelería!</p>
                </div>
    
                <div className="ticket-actions">
                  <button
                    className="button button-primary"
                    style={{flex: 1, padding: '10px', fontSize: '13px'}}
                    onClick={handlePhysicalPrint}
                  >
                    🖨️ IMPRIMIR TICKET
                  </button>
                  <button
                    className="button button-secondary"
                    style={{flex: 1, padding: '10px', fontSize: '13px'}}
                    onClick={() => setShowTicketModal(false)}
                  >
                    CERRAR
                  </button>
                </div>
              </div>
            </div>
          )}
    
          {/* Big QR Modal for Counter Customers */}
          {showBigQrModal && bigQrData && (
            <div className="modal-backdrop" onClick={() => setShowBigQrModal(false)}>
              <div className="big-qr-container" onClick={(e) => e.stopPropagation()}>
                <div className="big-qr-title">{bigQrData.title}</div>
                <div className="big-qr-subtitle">{bigQrData.subtitle}</div>
                <img src={bigQrData.qr} alt="Código QR Grande" className="big-qr-img" />
                {bigQrData.helpText && (
                  <div className="big-qr-note">
                    {bigQrData.helpText}
                  </div>
                )}
                <button
                  type="button"
                  className="button button-primary"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={() => setShowBigQrModal(false)}
                >
                  Cerrar Vista Grande
                </button>
              </div>
            </div>
          )}
    
          {/* Floating Toast Notification */}
          {toastMessage && (
            <div className={`toast-banner ${toastMessage.type}`}>
              <span>{toastMessage.type === 'error' ? '⚠️' : toastMessage.type === 'success' ? '✅' : 'ℹ️'}</span>
              <span>{toastMessage.text}</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 8, fontSize: 14 }}
                onClick={() => setToastMessage(null)}
              >×</button>
            </div>
          )}
        </div>
      );
    };
    
    export default App;
    ✓ • 4.45s

## Activity

    $ rtk pwsh -Command 'Get-Content "database.js" | Select-Object -First 260'; rtk pwsh -Command 'Get-Content "index.js" | Select-Object -First 260'; rtk pwsh -Command 'Get-Content "index.js" | Select-Object -Skip 260 -First 320'; rtk pwsh -Command 'Get-Content "server.js" | Select-Object -First 220'
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    class GestorDB {
        constructor(userDataPath) {
            const dbDir = path.join(userDataPath, 'data');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            this.db = new Database(path.join(dbDir, 'yars_pro.db'));
            this._init();
        }
    
        _init() {
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS ventas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    archivo TEXT,
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    paginas INTEGER,
                    copias INTEGER,
                    costo_tinta REAL,
                    costo_fijo REAL,
                    total REAL,
                    tipo_impresion TEXT, -- Tinta, Laser, BN
                    detalles TEXT -- JSON con desglose por página
                );
    
                CREATE TABLE IF NOT EXISTS correcciones_precios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    archivo TEXT,
                    total_paginas INTEGER,
                    total_copias INTEGER,
                    copias_bn INTEGER,
                    copias_color INTEGER,
                    cobertura_promedio REAL,
                    precio_calculado REAL,
                    precio_corregido REAL,
                    diferencia REAL,
                    ratio REAL,
                    detalles TEXT
                );
    
                CREATE TABLE IF NOT EXISTS modelo_aprendizaje (
                    clave TEXT PRIMARY KEY,
                    valor REAL,
                    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
    
            // Valores por defecto para el modelo de aprendizaje (Escalas solicitadas por el usuario)
            const defaults = {
                tier1_rate: 1.00, // 1 a 50 copias B/N: $1.00
                tier2_rate: 0.80, // 51 a 100 copias B/N: $0.80
                tier3_rate: 0.50, // 101 a 200 copias B/N: $0.50
                tier4_rate: 0.40, // 201+ copias B/N: $0.40
                color_rate: 3.00,
                color_high_rate: 5.00,
                cost_bw_high: 2.00,
                cost_base: 0.00,
                tuning_factor: 1.00,
                total_corrections: 0
            };
    
            const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM modelo_aprendizaje');
            if (checkStmt.get().count === 0) {
                const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)');
                for (const [k, v] of Object.entries(defaults)) {
                    insertStmt.run(k, v);
                }
            }
        }
    
        registrarVenta(datos) {
            const stmt = this.db.prepare(`
                INSERT INTO ventas (archivo, paginas, copias, costo_tinta, costo_fijo, total, tipo_impresion, detalles)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            return stmt.run(
                datos.archivo || 'Sin archivo',
                datos.paginas || 1,
                datos.copias || 1,
                datos.costo_tinta || 0,
                datos.costo_fijo || 0,
                datos.total || 0,
                datos.tipo_impresion || 'Estándar',
                JSON.stringify(datos.detalles || [])
            );
        }
    
        obtenerCorteDiario() {
            const rows = this.db.prepare(`
                SELECT
                    SUM(costo_tinta) as total_tinta,
                    SUM(total) as total_general,
                    COUNT(*) as num_ventas
                FROM ventas
                WHERE date(fecha, 'localtime') = date('now', 'localtime')
            `).get();
            return rows || { total_tinta: 0, total_general: 0, num_ventas: 0 };
        }
    
        obtenerDetalleVentasHoy() {
            return this.db.prepare(`
                SELECT id, archivo, fecha, paginas, copias, costo_tinta, costo_fijo, total, tipo_impresion, detalles
                FROM ventas
                WHERE date(fecha, 'localtime') = date('now', 'localtime')
                ORDER BY fecha DESC
            `).all();
        }
    
        obtenerModeloAprendizaje() {
            const rows = this.db.prepare('SELECT clave, valor FROM modelo_aprendizaje').all();
            const model = {};
            for (const row of rows) {
                model[row.clave] = row.valor;
            }
            return model;
        }
    
        guardarCorreccion(datos) {
            const precioCalculado = Math.max(0.01, parseFloat(datos.precio_calculado) || 0);
            const precioCorregido = Math.max(0, parseFloat(datos.precio_corregido) || 0);
            const diferencia = precioCorregido - precioCalculado;
            const ratio = precioCalculado > 0 ? (precioCorregido / precioCalculado) : 1;
            const copiasBn = parseInt(datos.copias_bn) || 0;
            const copiasColor = parseInt(datos.copias_color) || 0;
            const baseFee = parseFloat(datos.costo_fijo) || 0;
    
            // 1. Registrar corrección histórica
            const insertHist = this.db.prepare(`
                INSERT INTO correcciones_precios (
                    archivo, total_paginas, total_copias, copias_bn, copias_color,
                    cobertura_promedio, precio_calculado, precio_corregido, diferencia, ratio, detalles
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            insertHist.run(
                datos.archivo || 'Corrección manual',
                datos.total_paginas || 1,
                datos.total_copias || 1,
                copiasBn,
                copiasColor,
                datos.cobertura_promedio || 0,
                precioCalculado,
                precioCorregido,
                diferencia,
                ratio,
                JSON.stringify(datos.detalles || {})
            );
    
            // 2. Motor de aprendizaje adaptativo (Actualización Bayesiana / Suavizado Exponencial)
            const currentModel = this.obtenerModeloAprendizaje();
            const alpha = 0.25; // Tasa de aprendizaje
    
            const updateKey = (key, newVal) => {
                const rounded = Math.round(newVal * 100) / 100;
                this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)').run(key, rounded);
                currentModel[key] = rounded;
            };
    
            // Caso A: Solo copias en Blanco y Negro
            if (copiasBn > 0 && copiasColor === 0) {
                const observedUnitRate = Math.max(0.05, (precioCorregido - baseFee) / copiasBn);
                if (copiasBn <= 50) {
                    const current = currentModel.tier1_rate ?? 1.00;
                    updateKey('tier1_rate', (1 - alpha) * current + alpha * observedUnitRate);
                } else if (copiasBn <= 100) {
                    const current = currentModel.tier2_rate ?? 0.80;
                    updateKey('tier2_rate', (1 - alpha) * current + alpha * observedUnitRate);
                } else if (copiasBn <= 200) {
                    const current = currentModel.tier3_rate ?? 0.50;
                    updateKey('tier3_rate', (1 - alpha) * current + alpha * observedUnitRate);
                } else {
                    const current = currentModel.tier4_rate ?? 0.40;
                    updateKey('tier4_rate', (1 - alpha) * current + alpha * observedUnitRate);
                }
            }
            // Caso B: Solo Color
            else if (copiasColor > 0 && copiasBn === 0) {
                const observedColorRate = Math.max(0.5, (precioCorregido - baseFee) / copiasColor);
                const current = currentModel.color_rate ?? 3.00;
                updateKey('color_rate', (1 - alpha) * current + alpha * observedColorRate);
            }
            // Caso C: Mixto (B/N y Color)
            else if (copiasBn > 0 || copiasColor > 0) {
                const currentTuning = currentModel.tuning_factor ?? 1.00;
                const targetTuning = Math.max(0.5, Math.min(2.0, currentTuning * ratio));
                updateKey('tuning_factor', (1 - alpha) * currentTuning + alpha * targetTuning);
            }
    
            // Incrementar contador de correcciones aprendidas
            const totalCorr = (currentModel.total_corrections || 0) + 1;
            updateKey('total_corrections', totalCorr);
    
            return {
                success: true,
                model: currentModel,
                diferencia,
                ratio
            };
        }
    
        restablecerAprendizaje() {
            const defaults = {
                tier1_rate: 1.00,
                tier2_rate: 0.80,
                tier3_rate: 0.50,
                tier4_rate: 0.40,
                color_rate: 3.00,
                color_high_rate: 5.00,
                cost_bw_high: 2.00,
                cost_base: 0.00,
                tuning_factor: 1.00,
                total_corrections: 0
            };
    
            const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)');
            for (const [k, v] of Object.entries(defaults)) {
                insertStmt.run(k, v);
            }
            return defaults;
        }
    }
    
    module.exports = GestorDB;
    const { app, BrowserWindow, ipcMain, dialog } = require('electron');
    const path = require('path');
    const fs = require('fs');
    const os = require('os');
    const qrcode = require('qrcode');
    const { execFile } = require('child_process');
    
    const GestorDB = require('./database');
    const AnalizadorColor = require('./analysis');
    const startRemoteServer = require('./server');
    const localtunnel = require('localtunnel');
    const crypto = require('crypto');
    const generateTicketHTML = require('./ticket_generator');
    
    let hotspotManager;
    try {
        hotspotManager = require('./hotspot_manager');
    } catch (e) {
        console.error('No se pudo cargar hotspot_manager:', e);
        hotspotManager = {
            getHotspotInfo: async () => ({ supported: false, state: 'Off', error: e.message }),
            setHotspotState: async () => ({ success: false, error: e.message })
        };
    }
    
    let mainWindow;
    let db;
    let analizador = new AnalizadorColor();
    let remoteServer;
    let localUploadPath = '';
    const SERVER_PORT = 3500;
    
    function getNetworkDetails() {
        const interfaces = os.networkInterfaces();
        let hotspotIp = null;
        let wifiIp = null;
        let lanIp = null;
        let fallbackIp = null;
    
        for (const devName in interfaces) {
            const lowerName = devName.toLowerCase();
            // Excluir adaptadores virtuales, VPNs y túneles (Cloudflare WARP, Hyper-V, WSL, Docker, etc.)
            if (/warp|cloudflare|tailscale|zerotier|vpn|tap|tun|wireguard|vethernet|hyper-v|virtualbox|vmware|wsl|docker/i.test(lowerName)) {
                continue;
            }
    
            const iface = interfaces[devName];
            for (const alias of iface) {
                if (alias.family !== 'IPv4' || alias.internal || alias.address === '127.0.0.1') continue;
                // Excluir máscaras de host único (/32) típicas de VPN
                if (alias.netmask === '255.255.255.255') continue;
    
                // Detectar si pertenece a la subred de Windows Hotspot (192.168.137.x)
                if (alias.address.startsWith('192.168.137.') || /local area connection\*|wi-fi direct/i.test(lowerName)) {
                    hotspotIp = alias.address;
                    continue;
                }
    
                // Adaptador Wi-Fi físico
                if (/wi-fi|wifi|wlan|wireless/i.test(lowerName)) {
                    wifiIp = alias.address;
                    continue;
                }
    
                // Adaptador Ethernet / Cable
                if (/ethernet|eth|en/i.test(lowerName)) {
                    lanIp = alias.address;
                    continue;
                }
    
                if (!fallbackIp) fallbackIp = alias.address;
            }
        }
    
        const preferred = wifiIp || lanIp || hotspotIp || fallbackIp || 'localhost';
        return {
            hotspotIp: hotspotIp || '192.168.137.1',
            hasActiveHotspotAdapter: Boolean(hotspotIp),
            wifiIp: wifiIp || lanIp || fallbackIp || 'localhost',
            preferredLocalIp: preferred
        };
    }
    
    function createWindow() {
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 850,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
            },
            title: "PrintStudio Pro"
        });
    
        const isDev = !app.isPackaged;
        if (isDev) {
            mainWindow.loadURL('http://localhost:5173');
        } else {
            mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
        }
    }
    
    app.whenReady().then(() => {
        db = new GestorDB(app.getPath('userData'));
        createWindow();
    
        // Iniciar servidor remoto y directorios
        const uploadDir = path.join(app.getPath('userData'), 'uploads');
        const tempDir = path.join(app.getPath('userData'), 'temp');
    
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
        // Limpieza de archivos temporales anteriores al iniciar
        try {
            const files = fs.readdirSync(tempDir);
            for (const file of files) {
                const filePath = path.join(tempDir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (e) {
            console.error("Error al limpiar temporal:", e);
        }
    
        // Generar token efímero para la subida
        const token = crypto.randomBytes(8).toString('hex');
        localUploadPath = `/upload/${token}`;
    
        remoteServer = startRemoteServer(SERVER_PORT, uploadDir, app.getPath('userData'), (filePath) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('file-received', filePath);
            }
        }, token);
    
        // Iniciar túnel opcional para datos móviles
        (async () => {
            try {
                const tunnel = await localtunnel({ port: SERVER_PORT });
                const publicUrl = `${tunnel.url}${localUploadPath}`;
    
                // Obtener IP pública para informar contraseña del túnel si es necesario
                let externalIp = '';
                try {
                    const https = require('https');
                    https.get('https://api.ipify.org', (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            externalIp = data.trim();
                            if (mainWindow && !mainWindow.isDestroyed()) {
                                mainWindow.webContents.send('tunnel-info', { url: publicUrl, password: externalIp });
                            }
                        });
                    }).on('error', () => {});
                } catch (err) {}
    
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('tunnel-url', publicUrl);
                    mainWindow.webContents.send('tunnel-info', { url: publicUrl, password: externalIp });
                }
                tunnel.on('close', () => console.log('Localtunnel cerrado'));
            } catch (e) {
                console.warn('No se pudo abrir túnel localtunnel (normal sin internet):', e.message);
            }
        })();
    
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
    
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
    
    // Helper para encontrar Python en Windows
    function getPythonCommand() {
        const candidates = [
            'C:\\Python314\\python.exe',
            path.join(process.env.LOCALAPPDATA || '', 'Programs\\Python\\Python312\\python.exe'),
            path.join(process.env.LOCALAPPDATA || '', 'Programs\\Python\\Python313\\python.exe'),
            'python',
            'py'
        ];
        for (const candidate of candidates) {
            try {
                if (candidate.includes('\\') && fs.existsSync(candidate)) {
                    return candidate;
                }
            } catch (e) {}
        }
        return 'python';
    }
    
    // IPC Handlers
    ipcMain.handle('get-printers', async () => {
        try {
            if (mainWindow && mainWindow.webContents) {
                return await mainWindow.webContents.getPrintersAsync();
            }
            return [];
        } catch (err) {
            console.error("Error al obtener impresoras:", err);
            return [];
        }
    });
    
    ipcMain.handle('get-ip', async () => {
        return getNetworkDetails().preferredLocalIp;
    });
    
    ipcMain.handle('get-network-info', async () => {
        const net = getNetworkDetails();
        const hs = await hotspotManager.getHotspotInfo();
        return {
            ...net,
            hotspotInfo: hs,
            localUploadPath
        };
    });
    
    ipcMain.handle('get-hotspot-info', async () => {
        return await hotspotManager.getHotspotInfo();
    });
    
    ipcMain.handle('toggle-hotspot', async (event, enable) => {
        return await hotspotManager.setHotspotState(enable);
    });
    
    ipcMain.handle('get-upload-path', async () => localUploadPath);
    
    ipcMain.handle('generate-qr', async (event, text) => {
        return await qrcode.toDataURL(text, {
            margin: 2,
            errorCorrectionLevel: 'M',
            width: 320
        });
    });
    
    // Puente de conversión y análisis para documentos Office y PDF
    ipcMain.handle('convert-office', async (event, filePath) => {
        return new Promise((resolve) => {
            try {
                const pythonPath = getPythonCommand();
                let scriptPath = path.join(__dirname, 'office_bridge.py');
                if (app.isPackaged) {
                    const unpackedPath = path.join(__dirname, 'office_bridge.py').replace('app.asar', 'app.asar.unpacked');
                    if (fs.existsSync(unpackedPath)) {
                        scriptPath = unpackedPath;
                    }
                }
                const userDataPath = app.getPath('userData');
                const tempDir = path.join(userDataPath, 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
    
                execFile(pythonPath, [scriptPath, filePath, tempDir], {
                    timeout: 180000,
                    maxBuffer: 50 * 1024 * 1024,
                    windowsHide: true
                }, (error, stdout, stderr) => {
                    if (error && !stdout) {
                        console.error(`Error de ejecución en convert-office: ${error.message}`);
                        return resolve({ status: 'error', message: error.message || stderr });
                    }
                    try {
                        const match = stdout.match(/\{[\s\S]*\}/);
                        if (match) {
                            const result = JSON.parse(match[0]);
                            if (result.status === 'success' && Array.isArray(result.pages)) {
                                result.pages = result.pages.map(page => {
                                    let targetImg = page.image_path;
                                    if (!targetImg.startsWith(userDataPath)) {
                                        const fallbackName = `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
                                        const dest = path.join(tempDir, fallbackName);
                                        try {
                                            fs.copyFileSync(targetImg, dest);
                                            targetImg = dest;
                                        } catch (e) {}
                                    }
                                    let rel = path.relative(userDataPath, targetImg).replace(/\\/g, '/');
                                    const encoded = rel.split('/').map(encodeURIComponent).join('/');
                                    return {
                                        ...page,
                                        image_path: `http://localhost:${SERVER_PORT}/local-files/${encoded}`
                                    };
                                });
                            }
                            return resolve(result);
                        } else {
                            return resolve({
                                status: 'error',
                                message: 'No se obtuvo respuesta JSON del procesador de documentos. ' + (stdout || stderr || '')
                            });
                        }
                    } catch (e) {
                        console.error('Error al procesar salida JSON en convert-office:', e);
                        return resolve({ status: 'error', message: e.message });
                    }
                });
            } catch (err) {
                console.error('Error inesperado en convert-office:', err);
                return resolve({ status: 'error', message: err.message });
            }
        });
    });
    
    ipcMain.handle('analyze-image', async (event, filePath) => {
        try {
            const userDataPath = app.getPath('userData');
            const tempDir = path.join(userDataPath, 'temp');
    
            let targetPath = filePath;
    
            if (!filePath.startsWith(userDataPath)) {
                const ext = path.extname(filePath);
                const safeBase = path.basename(filePath, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
                const fileName = `img_${Date.now()}_${safeBase}${ext}`;
                targetPath = path.join(tempDir, fileName);
                fs.copyFileSync(filePath, targetPath);
            }
    
            const result = await analizador.analizar(targetPath);
    
            let relativePath = path.relative(userDataPath, targetPath).replace(/\\/g, '/');
            const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
            const localUrl = `http://localhost:${SERVER_PORT}/local-files/${encodedPath}`;
    
            return {
                ...result,
                image_path: localUrl
            };
        } catch (err) {
            console.error("Error en analyze-image handler:", err);
            throw err;
        }
    });
    
    ipcMain.handle('save-sale', async (event, saleData) => {
        return db.registrarVenta(saleData);
    });
    
    // IPC Handlers para el Sistema de Aprendizaje de Tarifas
    ipcMain.handle('get-learning-model', async () => {
        return db.obtenerModeloAprendizaje();
    });
    
    ipcMain.handle('save-price-correction', async (event, correctionData) => {
        return db.guardarCorreccion(correctionData);
    });
    
    ipcMain.handle('reset-learning-model', async () => {
        return db.restablecerAprendizaje();
    });
    
    ipcMain.handle('get-corte', async () => {
        const resumen = db.obtenerCorteDiario();
        const ventas = db.obtenerDetalleVentasHoy();
        return { resumen, ventas };
    });
    
    ipcMain.handle('select-files', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Imágenes y Documentos', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] }
            ]
        });
        return result.filePaths;
    });
    
    // Print Ticket Handler
    ipcMain.handle('print-ticket', async (event, saleData, printerName) => {
        return new Promise(async (resolve, reject) => {
            let workerWindow = null;
            let printTimeout = null;
            try {
                const html = await generateTicketHTML(saleData);
    
                workerWindow = new BrowserWindow({
                    show: false,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });
    
                const cleanup = () => {
                    if (printTimeout) clearTimeout(printTimeout);
                    if (workerWindow) {
                        try { workerWindow.close(); } catch (e) {}
                        workerWindow = null;
                    }
                };
    
                printTimeout = setTimeout(() => {
                    cleanup();
                    resolve({ success: false, reason: 'Tiempo de espera agotado al imprimir ticket' });
                }, 30000);
    
                workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    
                workerWindow.webContents.on('did-finish-load', () => {
                    const printOptions = {
                        silent: true,
                        printBackground: true
                    };
                    if (printerName) {
                        printOptions.deviceName = printerName;
                    }
                    workerWindow.webContents.print(printOptions, (success, failureReason) => {
                        cleanup();
                        if (success) {
                            resolve({ success: true });
                        } else {
                            console.warn("Fallo impresión silenciosa de ticket:", failureReason);
                            resolve({ success: false, reason: failureReason });
                        }
                    });
                });
            } catch (err) {
                if (printTimeout) clearTimeout(printTimeout);
                if (workerWindow) {
                    try { workerWindow.close(); } catch (e) {}
                }
                console.error("Error printing ticket:", err);
                reject(err);
            }
        });
    });
    
    // Print Document Handler
    ipcMain.handle('print-document', async (event, jobData) => {
        return new Promise(async (resolve, reject) => {
            let workerWindow = null;
            let printTimeout = null;
            try {
                const html = generatePrintHTML(jobData);
    
                workerWindow = new BrowserWindow({
                    show: false,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });
    
                const cleanup = () => {
                    if (printTimeout) clearTimeout(printTimeout);
                    if (workerWindow) {
                        try { workerWindow.close(); } catch (e) {}
                        workerWindow = null;
                    }
                };
    
                printTimeout = setTimeout(() => {
                    cleanup();
                    resolve({ success: false, reason: 'Tiempo de espera agotado al imprimir documento' });
                }, 60000);
    
                workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    
                workerWindow.webContents.on('did-finish-load', () => {
                    const printOptions = {
                        silent: true,
                        printBackground: true,
                        color: jobData.isColorPrint !== false
                    };
                    if (jobData.printer) {
                        printOptions.deviceName = jobData.printer;
                    }
                    workerWindow.webContents.print(printOptions, (success, failureReason) => {
                        cleanup();
                        if (success) {
                            resolve({ success: true });
                        } else {
                            console.warn("Silent printing failed, trying standard dialog:", failureReason);
                            resolve({ success: false, reason: failureReason });
                        }
                    });
                });
            } catch (err) {
                if (printTimeout) clearTimeout(printTimeout);
                if (workerWindow) {
                    try { workerWindow.close(); } catch (e) {}
                }
                console.error("Error printing document:", err);
                reject(err);
            }
        });
    });
    
    function generatePrintHTML(jobData) {
        const { copies, paperSize, imageLayout, fitOption, orientation } = jobData;
        const pages = Array.isArray(jobData.pages) ? jobData.pages : [];
        let widthPt, heightPt;
        switch (paperSize) {
            case 'Carta': // US Letter: 8.5 x 11 inches
                widthPt = 8.5 * 72;
                heightPt = 11 * 72;
                break;
            case 'Oficio': // US Legal: 8.5 x 14 inches
                widthPt = 8.5 * 72;
                heightPt = 14 * 72;
                break;
            case 'Oficio México': // Oficio México: 8.5 x 13.4 inches
                widthPt = 8.5 * 72;
                heightPt = 13.4 * 72;
                break;
            case 'Doble Carta / Tabloide': // Tabloid: 11 x 17 inches
                widthPt = 11 * 72;
                heightPt = 17 * 72;
                break;
            default:
                widthPt = 8.5 * 72;
                heightPt = 11 * 72;
        }
    
        if (orientation === 'landscape') {
            const temp = widthPt;
            widthPt = heightPt;
            heightPt = temp;
        }
    
        const widthIn = widthPt / 72;
        const heightIn = heightPt / 72;
    
        const { rows, cols } = getLayoutDimensions(imageLayout, orientation);
    
        const marginIn = 0.25;
        const usableWidthIn = widthIn - 2 * marginIn;
        const usableHeightIn = heightIn - 2 * marginIn;
    
        const cellWidthIn = usableWidthIn / cols;
        const cellHeightIn = usableHeightIn / rows;
    
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    @page {
                        size: ${widthIn}in ${heightIn}in;
                        margin: 0;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        width: ${widthIn}in;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page {
                        position: relative;
                        width: ${widthIn}in;
                        height: ${heightIn}in;
                        padding: ${marginIn}in;
                        page-break-after: always;
                        break-after: page;
                        overflow: hidden;
                    }
                    .page:last-child {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(${cols}, 1fr);
                        grid-template-rows: repeat(${rows}, 1fr);
    const express = require('express');
    const multer = require('multer');
    const path = require('path');
    const cors = require('cors');
    const fs = require('fs');
    
    function startRemoteServer(port, uploadDir, userDataDir, onFileReceived, allowedToken) {
        const app = express();
        app.use(cors());
    
        // Servir archivos locales con cabeceras permisivas para previsualización
        app.use('/local-files', (req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            next();
        }, express.static(userDataDir));
    
        // Almacenamiento seguro: sanitiza nombres para evitar caracteres problemáticos en URLs
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname).toLowerCase();
                const base = path.basename(file.originalname, ext)
                    .replace(/[^a-zA-Z0-9_-]/g, '_')
                    .substring(0, 60);
                cb(null, `${Date.now()}-${base || 'archivo'}${ext}`);
            }
        });
    
        const upload = multer({
            storage: storage,
            limits: {
                fileSize: 100 * 1024 * 1024, // Ampliado a 100MB por archivo
                files: 20 // Hasta 20 archivos por lote
            },
            fileFilter: (req, file, cb) => {
                const allowedExts = [
                    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
                    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.heic', '.heif'
                ];
                const ext = path.extname(file.originalname).toLowerCase();
                const isImage = file.mimetype && file.mimetype.startsWith('image/');
                const isPdf = file.mimetype === 'application/pdf';
                const isOffice = [
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                ].includes(file.mimetype);
    
                if (allowedExts.includes(ext) || isImage || isPdf || isOffice) {
                    cb(null, true);
                } else {
                    cb(new Error(`Tipo de archivo no permitido (${ext || file.mimetype}). Solo se permiten documentos PDF, Word, Excel, PowerPoint o imágenes JPG, PNG, WebP, etc.`), false);
                }
            }
        });
    
        // Endpoint de verificación de conectividad para el móvil
        app.get('/ping', (req, res) => {
            res.json({ status: 'ok', server: 'PrintStudio Pro', timestamp: Date.now() });
        });
    
        // Helper to send the upload page
        const serveUploadPage = (req, res) => {
            const uploadRoute = allowedToken ? `/upload/${allowedToken}` : '/upload';
            const htmlPath = path.join(__dirname, 'upload_client.html');
            try {
                if (fs.existsSync(htmlPath)) {
                    let html = fs.readFileSync(htmlPath, 'utf8');
                    const configScript = `<script>window.__UPLOAD_ROUTE__ = "${uploadRoute}"; window.__SERVER_PORT__ = ${port};</script>`;
                    html = html.replace('</head>', `${configScript}</head>`);
                    return res.send(html);
                }
            } catch (e) {
                console.error('Error reading upload_client.html:', e);
            }
            res.status(500).send('Error al cargar la página de subida de PrintStudio Pro.');
        };
    
        app.get('/', serveUploadPage);
        app.get('/upload', serveUploadPage);
        if (allowedToken) {
            app.get(`/upload/${allowedToken}`, serveUploadPage);
        }
    
        // Rutas de subida
        const uploadRoute = allowedToken ? `/upload/${allowedToken}` : '/upload';
    
        const handleUploadPost = (req, res) => {
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    onFileReceived(file.path);
                });
                res.status(200).send('Archivos enviados con éxito. Se están procesando en la estación de impresión.');
            } else {
                res.status(400).send('No se seleccionaron archivos válidos.');
            }
        };
    
        app.post(uploadRoute, upload.array('files'), handleUploadPost);
        if (allowedToken) {
            app.post('/upload', upload.array('files'), handleUploadPost);
        }
    
        // Manejo de errores para multer
        app.use((err, req, res, next) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).send('El archivo es demasiado grande. Límite: 100 MB por archivo.');
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).send('Demasiados archivos. Límite: 20 archivos por envío.');
                }
            }
            if (err.message) {
                return res.status(400).send(err.message);
            }
            next(err);
        });
    
        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`Servidor remoto escuchando en el puerto ${port} (0.0.0.0)`);
        });
        server.on('error', (error) => {
            console.error(`Error iniciando servidor remoto en el puerto ${port}:`, error);
        });
        return server;
    }
    
    module.exports = startRemoteServer;
    ✓ • 8.42s

## Activity

    $ rtk pwsh -Command 'Get-Content "index.js" | Select-Object -Skip 500 -First 260'; rtk pwsh -Command 'Get-Content "src/index.css" | Select-Object -First 180'; rtk pwsh -Command 'Get-Content "preload.js"'
        const { copies, paperSize, imageLayout, fitOption, orientation } = jobData;
        const pages = Array.isArray(jobData.pages) ? jobData.pages : [];
        let widthPt, heightPt;
        switch (paperSize) {
            case 'Carta': // US Letter: 8.5 x 11 inches
                widthPt = 8.5 * 72;
                heightPt = 11 * 72;
                break;
            case 'Oficio': // US Legal: 8.5 x 14 inches
                widthPt = 8.5 * 72;
                heightPt = 14 * 72;
                break;
            case 'Oficio México': // Oficio México: 8.5 x 13.4 inches
                widthPt = 8.5 * 72;
                heightPt = 13.4 * 72;
                break;
            case 'Doble Carta / Tabloide': // Tabloid: 11 x 17 inches
                widthPt = 11 * 72;
                heightPt = 17 * 72;
                break;
            default:
                widthPt = 8.5 * 72;
                heightPt = 11 * 72;
        }
    
        if (orientation === 'landscape') {
            const temp = widthPt;
            widthPt = heightPt;
            heightPt = temp;
        }
    
        const widthIn = widthPt / 72;
        const heightIn = heightPt / 72;
    
        const { rows, cols } = getLayoutDimensions(imageLayout, orientation);
    
        const marginIn = 0.25;
        const usableWidthIn = widthIn - 2 * marginIn;
        const usableHeightIn = heightIn - 2 * marginIn;
    
        const cellWidthIn = usableWidthIn / cols;
        const cellHeightIn = usableHeightIn / rows;
    
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    @page {
                        size: ${widthIn}in ${heightIn}in;
                        margin: 0;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        width: ${widthIn}in;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page {
                        position: relative;
                        width: ${widthIn}in;
                        height: ${heightIn}in;
                        padding: ${marginIn}in;
                        page-break-after: always;
                        break-after: page;
                        overflow: hidden;
                    }
                    .page:last-child {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(${cols}, 1fr);
                        grid-template-rows: repeat(${rows}, 1fr);
                        gap: 4px;
                        width: 100%;
                        height: 100%;
                    }
                    .cell {
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
            </head>
            <body>
        `;
    
        const photosPerPage = rows * cols;
        const totalPages = Math.max(1, Math.ceil(pages.length / photosPerPage));
        const numCopies = Math.max(1, parseInt(copies) || 1);
    
        for (let c = 0; c < numCopies; c++) {
            for (let p = 0; p < totalPages; p++) {
                html += `<div class="page"><div class="grid">`;
    
                for (let i = 0; i < photosPerPage; i++) {
                    const index = p * photosPerPage + i;
                    if (index < pages.length) {
                        const page = pages[index];
                        const rot = (page.rotation || 0) % 360;
                        const isRot90 = (rot === 90 || rot === 270);
                        // Determinar si esta página se imprime en B/N para aplicar filtro idéntico al renderizado en pantalla
                        const isPageBw = page.isBW === true || jobData.isColorPrint === false || (jobData.isColorPrint === 'auto' && !page.esColor);
                        const filterStyle = isPageBw ? 'filter: grayscale(100%) contrast(105%); -webkit-filter: grayscale(100%) contrast(105%);' : '';
                        html += `
                            <div class="cell">
                                <div style="${isRot90 ? `width: ${cellHeightIn}in; height: ${cellWidthIn}in;` : 'width: 100%; height: 100%;'} display: flex; align-items: center; justify-content: center; transform: rotate(${rot}deg); transform-origin: center center; flex-shrink: 0;">
                                    <img src="${page.imagePath}" alt="Page ${index}" style="max-width: 100%; max-height: 100%; width: 100%; height: 100%; object-fit: ${fitOption === 'fill' ? 'cover' : 'contain'}; ${filterStyle}" />
                                </div>
                            </div>
                        `;
                    } else {
                        html += `<div class="cell"></div>`;
                    }
                }
    
                html += `</div></div>`;
            }
        }
    
        html += `
            </body>
            </html>
        `;
    
        return html;
    }
    
    function getLayoutDimensions(imageLayout, orientation) {
        const isLandscape = orientation === 'landscape';
        switch (Number(imageLayout)) {
            case 1:
                return { rows: 1, cols: 1 };
            case 2:
                return isLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 };
            case 3:
                return isLandscape ? { rows: 1, cols: 3 } : { rows: 3, cols: 1 };
            case 4:
                return { rows: 2, cols: 2 };
            case 5:
                return isLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
            case 7:
                return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
            case 8:
                return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
            case 9:
                return { rows: 3, cols: 3 };
            case 10:
                return isLandscape ? { rows: 2, cols: 5 } : { rows: 5, cols: 2 };
            case 35:
                return isLandscape ? { rows: 5, cols: 7 } : { rows: 7, cols: 5 };
            default:
                const count = Number(imageLayout) || 1;
                if (count <= 1) return { rows: 1, cols: 1 };
                const cols = isLandscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.floor(Math.sqrt(count * 0.77)) || 1;
                const rows = Math.ceil(count / cols);
                return { rows, cols };
        }
    }
    :root {
      --bg-dark: #0b0f19;
      --bg-card: #151c2c;
      --bg-sidebar: #111827;
      --border-color: rgba(255, 255, 255, 0.08);
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-glow: rgba(99, 102, 241, 0.3);
      --success: #10b981;
      --success-hover: #059669;
      --success-glow: rgba(16, 185, 129, 0.2);
      --warning: #f59e0b;
      --danger: #ef4444;
      --danger-glow: rgba(239, 68, 68, 0.2);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      margin: 0;
      font-family: 'Outfit', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-primary);
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Custom Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .app-container {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: var(--bg-dark);
    }
    
    .sidebar-resizer {
      width: 7px;
      flex: 0 0 7px;
      margin-left: -4px;
      margin-right: -3px;
      z-index: 20;
      cursor: col-resize;
      background: transparent;
      transition: background-color 0.15s ease;
    }
    
    .sidebar-resizer:hover,
    .sidebar-resizer:active {
      background: rgba(99, 102, 241, 0.65);
    }
    
    .theme-toggle {
      margin-left: auto;
      width: 28px;
      height: 28px;
      border: 1px solid var(--border-color);
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 15px;
      line-height: 1;
    }
    
    .theme-toggle:hover {
      border-color: var(--primary);
      background: var(--primary-glow);
    }
    
    .app-container.light-theme {
      --bg-dark: #eef2f7;
      --bg-card: #ffffff;
      --bg-sidebar: #f8fafc;
      --border-color: rgba(15, 23, 42, 0.14);
      --text-primary: #172033;
      --text-secondary: #64748b;
      background: var(--bg-dark);
      color: var(--text-primary);
    }
    
    .app-container.light-theme .sidebar,
    .app-container.light-theme .main-content {
      background: var(--bg-dark);
    }
    
    .app-container.light-theme .sidebar {
      background: var(--bg-sidebar);
    }
    
    .app-container.light-theme .input-select option,
    .app-container.light-theme .input-select optgroup {
      background: #ffffff;
      color: #172033;
    }
    
    .app-container.light-theme .page-tile,
    .app-container.light-theme .cost-panel,
    .app-container.light-theme .loading-panel {
      background: #ffffff;
    }
    
    .app-container.light-theme .grid-title {
      background: var(--bg-dark);
    }
    
    .app-container.light-theme .canvas-area {
      background: #dfe6ef;
    }
    
    .app-container.light-theme .server-status {
      background-color: rgba(16, 185, 129, 0.1);
    }
    
    /* Sidebar Styling */
    .sidebar {
      width: 320px;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      flex-shrink: 0;
      z-index: 10;
    }
    
    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .brand-logo {
      font-size: 24px;
      color: var(--primary);
      filter: drop-shadow(0 0 8px var(--primary-glow));
    }
    
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #fff 30%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .sidebar-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-secondary);
    const { contextBridge, ipcRenderer, webUtils } = require('electron');
    
    contextBridge.exposeInMainWorld('electronAPI', {
        getIP: () => ipcRenderer.invoke('get-ip'),
        getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
        getHotspotInfo: () => ipcRenderer.invoke('get-hotspot-info'),
        toggleHotspot: (enable) => ipcRenderer.invoke('toggle-hotspot', enable),
        getUploadPath: () => ipcRenderer.invoke('get-upload-path'),
        getPrinters: () => ipcRenderer.invoke('get-printers'),
        generateQR: (text) => ipcRenderer.invoke('generate-qr', text),
        analyzeImage: (filePath) => ipcRenderer.invoke('analyze-image', filePath),
        saveSale: (saleData) => ipcRenderer.invoke('save-sale', saleData),
        getCorte: () => ipcRenderer.invoke('get-corte'),
        selectFiles: () => ipcRenderer.invoke('select-files'),
        convertOffice: (filePath) => ipcRenderer.invoke('convert-office', filePath),
        printTicket: (saleData, printerName) => ipcRenderer.invoke('print-ticket', saleData, printerName),
        printDocument: (jobData) => ipcRenderer.invoke('print-document', jobData),
        getLearningModel: () => ipcRenderer.invoke('get-learning-model'),
        savePriceCorrection: (correctionData) => ipcRenderer.invoke('save-price-correction', correctionData),
        resetLearningModel: () => ipcRenderer.invoke('reset-learning-model'),
        getPathForFile: (file) => {
            try {
                if (webUtils && typeof webUtils.getPathForFile === 'function') {
                    return webUtils.getPathForFile(file);
                }
            } catch (e) {
                console.warn('webUtils.getPathForFile error:', e);
            }
            return file.path || '';
        },
        onFileReceived: (callback) => ipcRenderer.on('file-received', (event, filePath) => callback(filePath)),
        // Tunnel URL emitter from main (when localtunnel becomes available)
        onTunnelUrl: (callback) => ipcRenderer.on('tunnel-url', (event, url) => callback(url)),
        onTunnelInfo: (callback) => ipcRenderer.on('tunnel-info', (event, info) => callback(info))
    });
    ✓ • 6.10s

## Assistant

Ya encontré dos problemas funcionales concretos que explican parte de lo que percibes: el precio fijo de B/N y color se muestra editable, pero el cálculo realmente estaba usando casi siempre las tarifas del modelo aprendido; además, la interfaz esperaba `uploadPath` mientras el proceso principal devolvía `localUploadPath`, lo que podía generar enlaces QR incompletos. Voy a corregir eso junto con un motor de precios separado, un flujo de corrección estable y una previsualización más manipulable, conservando todos los controles existentes.

## Activity

    $ rtk pwsh -Command 'Get-Content -Raw "tsconfig.json"; Get-Content -Raw "vite.config.ts"; git diff -- src/App.tsx index.js database.js src/index.css | Select-Object -First 220'
    Get-Content: Cannot find path 'C:\Users\yahel\YARS_Smart_Printer_Pro\tsconfig.json' because it does not exist.
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    
    export default defineConfig({
      plugins: [react()],
      base: './',
      server: {
        port: 5173,
        strictPort: true,
      },
      build: {
        outDir: 'dist',
      },
    });
    
    warning: in the working copy of 'database.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'index.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'src/App.tsx', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'src/index.css', LF will be replaced by CRLF the next time Git touches it
    diff --git a/database.js b/database.js
    index 42a1b4c..4fefa20 100644
    --- a/database.js
    +++ b/database.js
    @@ -25,8 +25,52 @@ class GestorDB {
                     total REAL,
                     tipo_impresion TEXT, -- Tinta, Laser, BN
                     detalles TEXT -- JSON con desglose por página
    -            )
    +            );
    +
    +            CREATE TABLE IF NOT EXISTS correcciones_precios (
    +                id INTEGER PRIMARY KEY AUTOINCREMENT,
    +                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    +                archivo TEXT,
    +                total_paginas INTEGER,
    +                total_copias INTEGER,
    +                copias_bn INTEGER,
    +                copias_color INTEGER,
    +                cobertura_promedio REAL,
    +                precio_calculado REAL,
    +                precio_corregido REAL,
    +                diferencia REAL,
    +                ratio REAL,
    +                detalles TEXT
    +            );
    +
    +            CREATE TABLE IF NOT EXISTS modelo_aprendizaje (
    +                clave TEXT PRIMARY KEY,
    +                valor REAL,
    +                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    +            );
             `);
    +
    +        // Valores por defecto para el modelo de aprendizaje (Escalas solicitadas por el usuario)
    +        const defaults = {
    +            tier1_rate: 1.00, // 1 a 50 copias B/N: $1.00
    +            tier2_rate: 0.80, // 51 a 100 copias B/N: $0.80
    +            tier3_rate: 0.50, // 101 a 200 copias B/N: $0.50
    +            tier4_rate: 0.40, // 201+ copias B/N: $0.40
    +            color_rate: 3.00,
    +            color_high_rate: 5.00,
    +            cost_bw_high: 2.00,
    +            cost_base: 0.00,
    +            tuning_factor: 1.00,
    +            total_corrections: 0
    +        };
    +
    +        const checkStmt = this.db.prepare('SELECT COUNT(*) as count FROM modelo_aprendizaje');
    +        if (checkStmt.get().count === 0) {
    +            const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)');
    +            for (const [k, v] of Object.entries(defaults)) {
    +                insertStmt.run(k, v);
    +            }
    +        }
         }
    
         registrarVenta(datos) {
    @@ -35,38 +79,148 @@ class GestorDB {
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             `);
             return stmt.run(
    -            datos.archivo,
    -            datos.paginas,
    -            datos.copias,
    -            datos.costo_tinta,
    -            datos.costo_fijo,
    -            datos.total,
    -            datos.tipo_impresion,
    -            JSON.stringify(datos.detalles)
    +            datos.archivo || 'Sin archivo',
    +            datos.paginas || 1,
    +            datos.copias || 1,
    +            datos.costo_tinta || 0,
    +            datos.costo_fijo || 0,
    +            datos.total || 0,
    +            datos.tipo_impresion || 'Estándar',
    +            JSON.stringify(datos.detalles || [])
             );
         }
    
         obtenerCorteDiario() {
    -        const hoy = new Date().toISOString().split('T')[0];
             const rows = this.db.prepare(`
                 SELECT
                     SUM(costo_tinta) as total_tinta,
                     SUM(total) as total_general,
                     COUNT(*) as num_ventas
                 FROM ventas
    -            WHERE date(fecha) = ?
    -        `).get(hoy);
    -        return rows;
    +            WHERE date(fecha, 'localtime') = date('now', 'localtime')
    +        `).get();
    +        return rows || { total_tinta: 0, total_general: 0, num_ventas: 0 };
         }
    
         obtenerDetalleVentasHoy() {
    -        const hoy = new Date().toISOString().split('T')[0];
             return this.db.prepare(`
                 SELECT id, archivo, fecha, paginas, copias, costo_tinta, costo_fijo, total, tipo_impresion, detalles
                 FROM ventas
    -            WHERE date(fecha) = ?
    +            WHERE date(fecha, 'localtime') = date('now', 'localtime')
                 ORDER BY fecha DESC
    -        `).all(hoy);
    +        `).all();
    +    }
    +
    +    obtenerModeloAprendizaje() {
    +        const rows = this.db.prepare('SELECT clave, valor FROM modelo_aprendizaje').all();
    +        const model = {};
    +        for (const row of rows) {
    +            model[row.clave] = row.valor;
    +        }
    +        return model;
    +    }
    +
    +    guardarCorreccion(datos) {
    +        const precioCalculado = Math.max(0.01, parseFloat(datos.precio_calculado) || 0);
    +        const precioCorregido = Math.max(0, parseFloat(datos.precio_corregido) || 0);
    +        const diferencia = precioCorregido - precioCalculado;
    +        const ratio = precioCalculado > 0 ? (precioCorregido / precioCalculado) : 1;
    +        const copiasBn = parseInt(datos.copias_bn) || 0;
    +        const copiasColor = parseInt(datos.copias_color) || 0;
    +        const baseFee = parseFloat(datos.costo_fijo) || 0;
    +
    +        // 1. Registrar corrección histórica
    +        const insertHist = this.db.prepare(`
    +            INSERT INTO correcciones_precios (
    +                archivo, total_paginas, total_copias, copias_bn, copias_color,
    +                cobertura_promedio, precio_calculado, precio_corregido, diferencia, ratio, detalles
    +            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    +        `);
    +        insertHist.run(
    +            datos.archivo || 'Corrección manual',
    +            datos.total_paginas || 1,
    +            datos.total_copias || 1,
    +            copiasBn,
    +            copiasColor,
    +            datos.cobertura_promedio || 0,
    +            precioCalculado,
    +            precioCorregido,
    +            diferencia,
    +            ratio,
    +            JSON.stringify(datos.detalles || {})
    +        );
    +
    +        // 2. Motor de aprendizaje adaptativo (Actualización Bayesiana / Suavizado Exponencial)
    +        const currentModel = this.obtenerModeloAprendizaje();
    +        const alpha = 0.25; // Tasa de aprendizaje
    +
    +        const updateKey = (key, newVal) => {
    +            const rounded = Math.round(newVal * 100) / 100;
    +            this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)').run(key, rounded);
    +            currentModel[key] = rounded;
    +        };
    +
    +        // Caso A: Solo copias en Blanco y Negro
    +        if (copiasBn > 0 && copiasColor === 0) {
    +            const observedUnitRate = Math.max(0.05, (precioCorregido - baseFee) / copiasBn);
    +            if (copiasBn <= 50) {
    +                const current = currentModel.tier1_rate ?? 1.00;
    +                updateKey('tier1_rate', (1 - alpha) * current + alpha * observedUnitRate);
    +            } else if (copiasBn <= 100) {
    +                const current = currentModel.tier2_rate ?? 0.80;
    +                updateKey('tier2_rate', (1 - alpha) * current + alpha * observedUnitRate);
    +            } else if (copiasBn <= 200) {
    +                const current = currentModel.tier3_rate ?? 0.50;
    +                updateKey('tier3_rate', (1 - alpha) * current + alpha * observedUnitRate);
    +            } else {
    +                const current = currentModel.tier4_rate ?? 0.40;
    +                updateKey('tier4_rate', (1 - alpha) * current + alpha * observedUnitRate);
    +            }
    +        }
    +        // Caso B: Solo Color
    +        else if (copiasColor > 0 && copiasBn === 0) {
    +            const observedColorRate = Math.max(0.5, (precioCorregido - baseFee) / copiasColor);
    +            const current = currentModel.color_rate ?? 3.00;
    +            updateKey('color_rate', (1 - alpha) * current + alpha * observedColorRate);
    +        }
    +        // Caso C: Mixto (B/N y Color)
    +        else if (copiasBn > 0 || copiasColor > 0) {
    +            const currentTuning = currentModel.tuning_factor ?? 1.00;
    +            const targetTuning = Math.max(0.5, Math.min(2.0, currentTuning * ratio));
    +            updateKey('tuning_factor', (1 - alpha) * currentTuning + alpha * targetTuning);
    +        }
    +
    +        // Incrementar contador de correcciones aprendidas
    +        const totalCorr = (currentModel.total_corrections || 0) + 1;
    +        updateKey('total_corrections', totalCorr);
    +
    +        return {
    +            success: true,
    +            model: currentModel,
    +            diferencia,
    +            ratio
    +        };
    +    }
    +
    +    restablecerAprendizaje() {
    +        const defaults = {
    +            tier1_rate: 1.00,
    +            tier2_rate: 0.80,
    +            tier3_rate: 0.50,
    +            tier4_rate: 0.40,
    +            color_rate: 3.00,
    +            color_high_rate: 5.00,
    +            cost_bw_high: 2.00,
    +            cost_base: 0.00,
    +            tuning_factor: 1.00,
    +            total_corrections: 0
    +        };
    +
    +        const insertStmt = this.db.prepare('INSERT OR REPLACE INTO modelo_aprendizaje (clave, valor) VALUES (?, ?)');
    +        for (const [k, v] of Object.entries(defaults)) {
    +            insertStmt.run(k, v);
    +        }
    +        return defaults;
         }
    ✓ • 3.15s

## Activity

    file changes: Completed · 6 changes
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\.superdesign\init\components.md
    # Shared UI components
    
    The project currently keeps page-specific JSX in `src/App.tsx` rather than a component directory. Reusable patterns are CSS classes and inline controls:
    
    - Button: `.button`, `.button-primary`, `.button-secondary`, `.button-success`
    - Input/select: `.input-text`, `.input-select`
    - Card: `.cost-panel`, `.page-tile`, `.stat-card`, `.qr-section`
    - Tabs: `.tabs`, `.tab-btn`, `.qr-mode-tabs`, `.qr-mode-tab`
    - Modal: `.modal-backdrop`, `.ticket-modal`, `.big-qr-container`
    
    Full implementation is in `src/App.tsx` and `src/index.css`.
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\.superdesign\init\extractable-components.md
    # Extractable components
    
    ## AppSidebar
    
    - Source: `src/App.tsx`
    - Category: layout
    - Description: Brand, printer/job controls, pricing controls, and phone upload modes.
    - Extractable props: active theme, selected printer, print settings, pricing model, connection mode.
    
    ## PrintSheetPreview
    
    - Source: `src/App.tsx`
    - Category: basic
    - Description: Paper sheet preview with layout cells, rotation, fit/fill, page navigation, and grayscale rendering.
    - Extractable props: pages, paper size, orientation, layout, fit option, current page.
    
    ## PricingPanel
    
    - Source: `src/App.tsx`
    - Category: basic
    - Description: Impression summary, wholesale B/N tier, total, manual correction, and print action.
    - Extractable props: costs, selected printer, correction state, callbacks.
    
    ## MobileImportPanel
    
    - Source: `src/App.tsx`
    - Category: basic
    - Description: Hotspot, local Wi-Fi, and Internet QR upload flows.
    - Extractable props: connection mode, QR data, hotspot state, tunnel state.
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\.superdesign\init\layouts.md
    # Layouts
    
    ## AppShell
    
    - Source: `src/App.tsx`
    - Description: Full-height Electron workstation with a resizable control sidebar, header tabs, scan workspace, history workspace, QR modal, ticket modal, and toast notifications.
    - Implementation: the root `App` JSX composes `.sidebar`, `.sidebar-resizer`, `.main-content`, `.workspace`, `.modal-backdrop`, and `.toast-banner`.
    
    ## Workstation
    
    - Source: `src/index.css`
    - Description: Vanilla CSS grid/flex styling for the sidebar, upload list, paper viewport, pricing card, history table, and mobile responsive breakpoint.
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\.superdesign\init\pages.md
    # Page dependency tree
    
    ## `/` — Print workstation
    
    - `src/App.tsx`
      - `src/assets/logo.png`
      - `src/index.css` via `src/main.tsx`
      - Electron APIs exposed by `preload.js`
      - `index.js` IPC handlers for network, QR, conversion, analysis, pricing, database, and printing
      - `server.js` mobile upload server
      - `database.js` sales and learning model
    
    The scan view and history view are local render branches selected by `activeTab`.
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\.superdesign\init\routes.md
    # Routes
    
    This is a single-window Electron application with no client-side router.
    
    - `/` — `src/App.tsx`, Electron renderer shell.
    - Scan tab — document/image intake, page controls, live print sheet preview, pricing, QR upload.
    - History tab — daily report and ticket reprint.
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\.superdesign\init\theme.md
    # PrintStudio Pro UI context
    
    Framework: React 18 + Vite; CSS: vanilla `src/index.css`; component library: custom CSS and JSX.
    
    ## Tokens
    
    - Background: `--bg-dark #0b0f19`, sidebar `#111827`, card `#151c2c`
    - Text: primary `#f3f4f6`, secondary `#9ca3af`
    - Accent: primary `#6366f1`, success `#10b981`, warning `#f59e0b`, danger `#ef4444`
    - Radius: 6-12px; shadows: dark elevated panels; font: Outfit/Segoe UI/Roboto
    - Layout: fixed viewport shell, resizable 220-380px sidebar, responsive stacked workspace below 900px
    
    ## Raw source
    
    See `src/index.css` for the complete theme and component styles.

## Activity

    file changes: Completed · 2 changes
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\src\domain\layout.ts
    export type Orientation = 'portrait' | 'landscape';
    
    export function getLayoutDimensions(layout: number, orientation: Orientation) {
      const landscape = orientation === 'landscape';
      const fixed: Record<number, [number, number]> = {
        1: [1, 1], 2: landscape ? [1, 2] : [2, 1], 3: landscape ? [1, 3] : [3, 1],
        4: [2, 2], 5: landscape ? [2, 3] : [3, 2], 7: landscape ? [2, 4] : [4, 2],
        8: landscape ? [2, 4] : [4, 2], 9: [3, 3], 10: landscape ? [2, 5] : [5, 2],
        35: landscape ? [5, 7] : [7, 5]
      };
      const pair = fixed[Number(layout)];
      if (pair) return { rows: pair[0], cols: pair[1] };
      const count = Math.max(1, Number(layout) || 1);
      const cols = landscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.max(1, Math.floor(Math.sqrt(count * 0.77)));
      return { rows: Math.ceil(count / cols), cols };
    }
    
    export function getPaperAspectRatio(paperSize: string, orientation: Orientation) {
      const sizes: Record<string, [number, number]> = {
        Carta: [8.5, 11], Oficio: [8.5, 14], 'Oficio México': [8.5, 13.4], 'Doble Carta / Tabloide': [11, 17]
      };
      const [width, height] = sizes[paperSize] || sizes.Carta;
      return orientation === 'landscape' ? height / width : width / height;
    }
    Add: C:\Users\yahel\YARS_Smart_Printer_Pro\src\domain\pricing.ts
    export type PricingMode = 'fixed' | 'smart';
    
    export interface PricingPage {
      esColor: boolean;
      cobertura: number;
      pctColor?: number;
      esAltaDensidadBN: boolean;
      quantity?: number;
      colorOverride?: 'color' | 'bw' | null;
    }
    
    export interface PricingModel {
      tier1_rate: number; tier2_rate: number; tier3_rate: number; tier4_rate: number;
      color_rate: number; cost_bw_high: number; tuning_factor: number;
    }
    
    export interface PricingConfig {
      costBase: number; costBW: number; costBWHigh: number; costColor: number;
      pricingMode: PricingMode; printColorMode: 'auto' | 'color' | 'bw'; copies: number;
    }
    
    export function isColorPage(page: PricingPage, mode: PricingConfig['printColorMode']) {
      if (page.colorOverride === 'color') return true;
      if (page.colorOverride === 'bw') return false;
      if (mode === 'color') return true;
      if (mode === 'bw') return false;
      return Boolean(page.esColor);
    }
    
    export function getBwVolumeTier(total: number, model: PricingModel) {
      if (total <= 50) return { rate: model.tier1_rate ?? 1, label: '1 - 50 copias', range: '1-50' };
      if (total <= 100) return { rate: model.tier2_rate ?? 0.8, label: '51 - 100 copias', range: '51-100' };
      if (total <= 200) return { rate: model.tier3_rate ?? 0.5, label: '101 - 200 copias', range: '101-200' };
      return { rate: model.tier4_rate ?? 0.4, label: '201+ copias', range: '201+' };
    }
    
    export function calculatePrintCosts(pages: PricingPage[], config: PricingConfig, model: PricingModel) {
      const copies = Math.max(1, config.copies || 1);
      const totalBw = pages.reduce((sum, page) => sum + (!isColorPage(page, config.printColorMode) ? Math.max(1, page.quantity || 1) * copies : 0), 0);
      const totalColor = pages.reduce((sum, page) => sum + (isColorPage(page, config.printColorMode) ? Math.max(1, page.quantity || 1) * copies : 0), 0);
      const tier = getBwVolumeTier(totalBw, model);
      const learnedFactor = Math.max(0.5, Math.min(2, model.tuning_factor || 1));
      const bwRate = Math.max(0, config.costBW || tier.rate) * learnedFactor;
      const colorRate = Math.max(0, config.costColor || model.color_rate || 3) * learnedFactor;
      let subtotal = 0;
      pages.forEach(page => {
        const color = isColorPage(page, config.printColorMode);
        const quantity = Math.max(1, page.quantity || 1) * copies;
        if (config.pricingMode === 'fixed') {
          subtotal += (color ? colorRate : (page.esAltaDensidadBN ? Math.max(config.costBWHigh, tier.rate * 1.5) : bwRate)) * quantity;
          return;
        }
        const clamp = (value: number) => Math.min(1, Math.max(0, value));
        if (color) {
          const colorShare = clamp((page.pctColor ?? (page.esColor ? 100 : 0)) / 100);
          const coverage = clamp((page.cobertura * colorShare) / 30);
          subtotal += (tier.rate + (colorRate - tier.rate) * coverage) * quantity;
        } else {
          const density = clamp((page.cobertura - 15) / 45);
          const high = Math.max(tier.rate * 1.5, config.costBWHigh);
          subtotal += (tier.rate + (high - tier.rate) * density) * quantity;
        }
      });
      const baseFee = pages.length ? Math.max(0, config.costBase) : 0;
      return { subtotalTinta: subtotal, baseFee, calculatedTotal: subtotal + baseFee, totalBwImpressions: totalBw, totalColorImpressions: totalColor, bwTier: { ...tier, rate: tier.rate } };
    }

## Activity

    $ rtk rg -n "getLayoutDimensions|getPaperAspectRatio|getBwVolumeTier|const totalBwImpressions|const getPageUnitCost|const calculateCosts|handleApplyPriceCorrection|refreshAllQrs|localUploadPath|uploadPath" src/App.tsx index.js
    index.js:30:let localUploadPath = '';
    index.js:133:    localUploadPath = `/upload/${token}`;
    index.js:145:            const publicUrl = `${tunnel.url}${localUploadPath}`;
    index.js:224:        localUploadPath
    index.js:236:ipcMain.handle('get-upload-path', async () => localUploadPath);
    index.js:535:    const { rows, cols } = getLayoutDimensions(imageLayout, orientation);
    index.js:638:function getLayoutDimensions(imageLayout, orientation) {
    src/App.tsx:15:        uploadPath: string;
    src/App.tsx:227:  const refreshAllQrs = async (netInfo?: any, currentHotspot?: any) => {
    src/App.tsx:229:      const up = netInfo?.uploadPath || uploadRoute || '/upload';
    src/App.tsx:264:        await refreshAllQrs(null, result);
    src/App.tsx:285:          setUploadRoute(netInfo.uploadPath || '/upload');
    src/App.tsx:289:          await refreshAllQrs(netInfo, netInfo.hotspot);
    src/App.tsx:363:  const getLayoutDimensions = (layout: number, orient: 'portrait' | 'landscape') => {
    src/App.tsx:396:  const getPaperAspectRatio = (pSize: string, orient: 'portrait' | 'landscape') => {
    src/App.tsx:426:    const ratio = getPaperAspectRatio(pSize, orient);
    src/App.tsx:683:  const getBwVolumeTier = (totalBw: number): { rate: number; label: string; range: string } => {
    src/App.tsx:695:  const totalBwImpressions = analysisResults.reduce(
    src/App.tsx:704:  const bwTier = getBwVolumeTier(totalBwImpressions);
    src/App.tsx:706:  const getPageUnitCost = (result: PageAnalysis) => {
    src/App.tsx:734:  const calculateCosts = () => {
    src/App.tsx:762:  const handleApplyPriceCorrection = async () => {
    src/App.tsx:876:      const { rows: printRows, cols: printCols } = getLayoutDimensions(imageLayout, orientation);
    src/App.tsx:981:    const { rows: rowsPerPage, cols: colsPerPage } = getLayoutDimensions(imageLayout, orientation);
    src/App.tsx:1336:                    onClick={handleApplyPriceCorrection}
    ✓ • 902ms

## Activity

    file changes: Completed · 1 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\App.tsx
    @@ -2,2 +2,4 @@
     import logo from './assets/logo.png';
    +import { getLayoutDimensions, getPaperAspectRatio } from './domain/layout';
    +import { calculatePrintCosts, getBwVolumeTier, isColorPage } from './domain/pricing';
     
    @@ -360,64 +362,2 @@
         return items;
    -  };
    -
    -  const getLayoutDimensions = (layout: number, orient: 'portrait' | 'landscape') => {
    -    const isLandscape = orient === 'landscape';
    -    switch (Number(layout)) {
    -      case 1:
    -        return { rows: 1, cols: 1 };
    -      case 2:
    -        return isLandscape ? { rows: 1, cols: 2 } : { rows: 2, cols: 1 };
    -      case 3:
    -        return isLandscape ? { rows: 1, cols: 3 } : { rows: 3, cols: 1 };
    -      case 4:
    -        return { rows: 2, cols: 2 };
    -      case 5:
    -        return isLandscape ? { rows: 2, cols: 3 } : { rows: 3, cols: 2 };
    -      case 7:
    -        return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
    -      case 8:
    -        return isLandscape ? { rows: 2, cols: 4 } : { rows: 4, cols: 2 };
    -      case 9:
    -        return { rows: 3, cols: 3 };
    -      case 10:
    -        return isLandscape ? { rows: 2, cols: 5 } : { rows: 5, cols: 2 };
    -      case 35:
    -        return isLandscape ? { rows: 5, cols: 7 } : { rows: 7, cols: 5 };
    -      default: {
    -        const count = Number(layout) || 1;
    -        if (count <= 1) return { rows: 1, cols: 1 };
    -        const cols = isLandscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.floor(Math.sqrt(count * 0.77)) || 1;
    -        const rows = Math.ceil(count / cols);
    -        return { rows, cols };
    -      }
    -    }
    -  };
    -
    -  const getPaperAspectRatio = (pSize: string, orient: 'portrait' | 'landscape') => {
    -    let widthPt: number, heightPt: number;
    -    switch (pSize) {
    -      case 'Carta': // 8.5 x 11 in
    -        widthPt = 8.5 * 72;
    -        heightPt = 11 * 72;
    -        break;
    -      case 'Oficio': // 8.5 x 14 in
    -        widthPt = 8.5 * 72;
    -        heightPt = 14 * 72;
    -        break;
    -      case 'Oficio México': // 8.5 x 13.4 in
    -        widthPt = 8.5 * 72;
    -        heightPt = 13.4 * 72;
    -        break;
    -      case 'Doble Carta / Tabloide': // 11 x 17 in
    -        widthPt = 11 * 72;
    -        heightPt = 17 * 72;
    -        break;
    -      default:
    -        widthPt = 8.5 * 72;
    -        heightPt = 11 * 72;
    -    }
    -    if (orient === 'landscape') {
    -      return heightPt / widthPt; // inverted ratio
    -    }
    -    return widthPt / heightPt;
       };

## Activity

    file changes: Completed · 1 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\App.tsx
    @@ -595,7 +595,3 @@
       const isPageColor = (page: PageAnalysis): boolean => {
    -    if (page.colorOverride === 'color') return true;
    -    if (page.colorOverride === 'bw') return false;
    -    if (printColorMode === 'color') return true;
    -    if (printColorMode === 'bw') return false;
    -    return Boolean(page.esColor);
    +    return isColorPage(page, printColorMode);
       };
    @@ -622,80 +618,17 @@
       // 201+ copias: $0.40
    -  const getBwVolumeTier = (totalBw: number): { rate: number; label: string; range: string } => {
    -    const r1 = learningModel.tier1_rate ?? 1.00;
    -    const r2 = learningModel.tier2_rate ?? 0.80;
    -    const r3 = learningModel.tier3_rate ?? 0.50;
    -    const r4 = learningModel.tier4_rate ?? 0.40;
    -
    -    if (totalBw <= 50) return { rate: r1, label: `1 - 50 copias ($${r1.toFixed(2)})`, range: '1-50' };
    -    if (totalBw <= 100) return { rate: r2, label: `51 - 100 copias ($${r2.toFixed(2)})`, range: '51-100' };
    -    if (totalBw <= 200) return { rate: r3, label: `101 - 200 copias ($${r3.toFixed(2)})`, range: '101-200' };
    -    return { rate: r4, label: `201+ copias ($${r4.toFixed(2)})`, range: '201+' };
    -  };
    -
    -  const totalBwImpressions = analysisResults.reduce(
    -    (sum, p) => (!isPageColor(p) ? sum + (p.quantity || 1) * copies : sum),
    -    0
    -  );
    -  const totalColorImpressions = analysisResults.reduce(
    -    (sum, p) => (isPageColor(p) ? sum + (p.quantity || 1) * copies : sum),
    -    0
    -  );
    -
    -  const bwTier = getBwVolumeTier(totalBwImpressions);
    -
    -  const getPageUnitCost = (result: PageAnalysis) => {
    -    const pageColor = isPageColor(result);
    -    // Para B/N se aplica la tarifa por volumen activa
    -    const currentBwRate = bwTier.rate;
    -    const currentCostColor = (costColor || learningModel.color_rate || 3.00) * (learningModel.tuning_factor || 1.0);
    -
    -    if (pricingMode === 'fixed') {
    -      if (pageColor) {
    -        return currentCostColor;
    -      }
    -      return result.esAltaDensidadBN ? Math.max(currentBwRate * 1.5, costBWHigh) : currentBwRate;
    -    }
    -
    -    // Modo Inteligente (cobertura)
    -    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    -    if (pageColor) {
    -      const colorShare = clamp((result.pctColor ?? (result.esColor ? 100 : 0)) / 100);
    -      const effectiveColorCoverage = result.cobertura * colorShare;
    -      const coverageFactor = clamp(effectiveColorCoverage / 30);
    -      return currentBwRate + (currentCostColor - currentBwRate) * coverageFactor;
    -    }
    -
    -    const densityFactor = clamp((result.cobertura - 15) / 45);
    -    const bwHighRate = Math.max(currentBwRate * 1.5, costBWHigh);
    -    return currentBwRate + (bwHighRate - currentBwRate) * densityFactor;
    +  const costsBase = calculatePrintCosts(analysisResults, {
    +    costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode, copies
    +  }, learningModel);
    +  const costs = {
    +    ...costsBase,
    +    total: correctedTotal !== null ? correctedTotal : costsBase.calculatedTotal,
    +    isCorrected: correctedTotal !== null
       };
    -
    -  // Cost calculator
    -  const calculateCosts = () => {
    -    let subtotalTinta = 0;
    -    
    -    analysisResults.forEach(res => {
    -      const cost = getPageUnitCost(res);
    -      const qty = Math.max(1, res.quantity || 1);
    -      subtotalTinta += cost * qty;
    -    });
    -
    -    const subtotalTintaConCopias = subtotalTinta * copies;
    -    const baseFee = analysisResults.length > 0 ? costBase : 0;
    -    const calculatedTotal = subtotalTintaConCopias + baseFee;
    -    const total = correctedTotal !== null ? correctedTotal : calculatedTotal;
    -
    -    return {
    -      subtotalTinta: subtotalTintaConCopias,
    -      baseFee,
    -      calculatedTotal,
    -      total,
    -      isCorrected: correctedTotal !== null,
    -      totalBwImpressions,
    -      totalColorImpressions,
    -      bwTier
    -    };
    +  const { totalBwImpressions, totalColorImpressions, bwTier } = costsBase;
    +  const getPageUnitCost = (page: PageAnalysis) => {
    +    const single = calculatePrintCosts([{ ...page, quantity: 1 }], {
    +      costBase: 0, costBW, costBWHigh, costColor, pricingMode, printColorMode, copies: 1
    +    }, learningModel);
    +    return single.subtotalTinta;
       };
    -
    -  const costs = calculateCosts();
     

## Activity

    file changes: Completed · 2 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\App.tsx
    @@ -3,3 +3,3 @@
     import { getLayoutDimensions, getPaperAspectRatio } from './domain/layout';
    -import { calculatePrintCosts, getBwVolumeTier, isColorPage } from './domain/pricing';
    +import { calculatePrintCosts, isColorPage } from './domain/pricing';
     
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\domain\pricing.ts
    @@ -42,3 +42,5 @@
       const learnedFactor = Math.max(0.5, Math.min(2, model.tuning_factor || 1));
    -  const bwRate = Math.max(0, config.costBW || tier.rate) * learnedFactor;
    +  // `costBW` is the configurable base price; the model keeps the relative
    +  // wholesale curve (1-50, 51-100, 101-200, 201+) instead of losing it.
    +  const bwRate = Math.max(0, config.costBW || 1) * tier.rate * learnedFactor;
       const colorRate = Math.max(0, config.costColor || model.color_rate || 3) * learnedFactor;
    @@ -49,3 +51,3 @@
         if (config.pricingMode === 'fixed') {
    -      subtotal += (color ? colorRate : (page.esAltaDensidadBN ? Math.max(config.costBWHigh, tier.rate * 1.5) : bwRate)) * quantity;
    +      subtotal += (color ? colorRate : (page.esAltaDensidadBN ? Math.max(config.costBWHigh, bwRate * 1.5) : bwRate)) * quantity;
           return;
    @@ -59,3 +61,3 @@
           const density = clamp((page.cobertura - 15) / 45);
    -      const high = Math.max(tier.rate * 1.5, config.costBWHigh);
    +      const high = Math.max(bwRate * 1.5, config.costBWHigh);
           subtotal += (tier.rate + (high - tier.rate) * density) * quantity;

## Activity

    file changes: Completed · 1 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\domain\pricing.ts
    @@ -58,3 +58,3 @@
           const coverage = clamp((page.cobertura * colorShare) / 30);
    -      subtotal += (tier.rate + (colorRate - tier.rate) * coverage) * quantity;
    +      subtotal += (bwRate + (colorRate - bwRate) * coverage) * quantity;
         } else {
    @@ -62,3 +62,3 @@
           const high = Math.max(bwRate * 1.5, config.costBWHigh);
    -      subtotal += (tier.rate + (high - tier.rate) * density) * quantity;
    +      subtotal += (bwRate + (high - bwRate) * density) * quantity;
         }

## Activity

    file changes: Completed · 2 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\database.js
    @@ -154,3 +154,9 @@
             const currentModel = this.obtenerModeloAprendizaje();
    -        const alpha = 0.25; // Tasa de aprendizaje
    +        const alpha = 0.18; // Suavizado conservador: evita que una corrección aislada distorsione las tarifas.
    +        let correctionDetails = {};
    +        try {
    +            correctionDetails = typeof datos.detalles === 'string' ? JSON.parse(datos.detalles) : (datos.detalles || {});
    +        } catch (e) {}
    +        const baseBwRate = Math.max(0.05, parseFloat(correctionDetails.costBW) || 1);
    +        const baseColorRate = Math.max(0.05, parseFloat(correctionDetails.costColor) || 3);
     
    @@ -164,3 +170,3 @@
             if (copiasBn > 0 && copiasColor === 0) {
    -            const observedUnitRate = Math.max(0.05, (precioCorregido - baseFee) / copiasBn);
    +            const observedUnitRate = Math.min(4, Math.max(0.05, ((precioCorregido - baseFee) / copiasBn) / baseBwRate));
                 if (copiasBn <= 50) {
    @@ -181,3 +187,3 @@
             else if (copiasColor > 0 && copiasBn === 0) {
    -            const observedColorRate = Math.max(0.5, (precioCorregido - baseFee) / copiasColor);
    +            const observedColorRate = Math.min(4, Math.max(0.05, ((precioCorregido - baseFee) / copiasColor) / baseColorRate));
                 const current = currentModel.color_rate ?? 3.00;
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\App.tsx
    @@ -659,3 +659,5 @@
               copies,
    -          pages: analysisResults.length
    +          pages: analysisResults.length,
    +          costBW,
    +          costColor
             }

## Activity

    file changes: Completed · 1 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\index.js
    @@ -223,2 +223,5 @@
             hotspotInfo: hs,
    +        // Keep both names for renderer compatibility with older builds.
    +        hotspot: hs,
    +        uploadPath: localUploadPath,
             localUploadPath
    @@ -473,3 +476,4 @@
                         printBackground: true,
    -                    color: jobData.isColorPrint !== false
    +                    color: jobData.isColorPrint !== false,
    +                    pageSize: getPaperSizeMicrons(jobData.paperSize, jobData.orientation)
                     };
    @@ -637,2 +641,15 @@
     
    +function getPaperSizeMicrons(paperSize, orientation) {
    +    const sizes = {
    +        'Carta': [215900, 279400],
    +        'Oficio': [215900, 355600],
    +        'Oficio México': [215900, 340360],
    +        'Doble Carta / Tabloide': [279400, 431800]
    +    };
    +    const [width, height] = sizes[paperSize] || sizes['Carta'];
    +    return orientation === 'landscape'
    +        ? { width: height, height: width }
    +        : { width, height };
    +}
    +
     function getLayoutDimensions(imageLayout, orientation) {

## Activity

    file changes: Completed · 1 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\App.tsx
    @@ -165,2 +165,3 @@
       const [previewPage, setPreviewPage] = useState<number>(1);
    +  const [previewZoom, setPreviewZoom] = useState<number>(1);
     
    @@ -1018,2 +1019,14 @@
               <div className="canvas-area">
    +            <div className="preview-toolbar" aria-label="Herramientas de previsualización">
    +              <div className="preview-toolbar-title"><span className="toolbar-dot"></span>Vista de impresión</div>
    +              <div className="preview-toolbar-actions">
    +                <button type="button" onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) - 90)} disabled={!selectedPage} title="Girar a la izquierda">↶</button>
    +                <button type="button" onClick={() => updateSelectedRotation((selectedPage?.rotation || 0) + 90)} disabled={!selectedPage} title="Girar a la derecha">↷</button>
    +                <span className="toolbar-divider" />
    +                <button type="button" onClick={() => setPreviewZoom(z => Math.max(0.75, +(z - 0.1).toFixed(2)))} title="Alejar">−</button>
    +                <span className="zoom-label">{Math.round(previewZoom * 100)}%</span>
    +                <button type="button" onClick={() => setPreviewZoom(z => Math.min(1.35, +(z + 0.1).toFixed(2)))} title="Acercar">+</button>
    +                <button type="button" onClick={() => setPreviewZoom(1)} title="Restablecer zoom">↺</button>
    +              </div>
    +            </div>
                 {printItems.length === 0 ? (
    @@ -1051,3 +1064,4 @@
                         padding: '12px',
    -                    boxSizing: 'border-box'
    +                    boxSizing: 'border-box',
    +                    transform: `scale(${previewZoom})`
                       }}
    @@ -1075,3 +1089,5 @@
                               key={index}
    -                          className="preview-cell"
    +                          className={`preview-cell ${selectedPage?.path === item.originalPage.path && selectedPage?.pageIndex === item.originalPage.pageIndex ? 'selected' : ''}`}
    +                          onClick={() => setSelectedPage(item.originalPage)}
    +                          title="Selecciona esta imagen para editarla"
                               style={{

## Activity

    file changes: Completed · 1 changes
    Update { move_path: None }: C:\Users\yahel\YARS_Smart_Printer_Pro\src\index.css
    @@ -1307,2 +1307,48 @@
     
    +/* Professional print-workstation refinements */
    +.canvas-area {
    +  background: radial-gradient(circle at 50% 45%, rgba(99,102,241,.08), transparent 48%), #0b1220;
    +  border-color: rgba(148,163,184,.18);
    +  padding: 54px 22px 22px;
    +}
    +
    +.preview-toolbar {
    +  position: absolute;
    +  top: 12px;
    +  left: 14px;
    +  right: 14px;
    +  min-height: 34px;
    +  display: flex;
    +  align-items: center;
    +  justify-content: space-between;
    +  gap: 12px;
    +  padding: 5px 8px 5px 12px;
    +  border: 1px solid rgba(148,163,184,.18);
    +  border-radius: 9px;
    +  background: rgba(15,23,42,.78);
    +  backdrop-filter: blur(12px);
    +  color: #cbd5e1;
    +  z-index: 8;
    +}
    +
    +.preview-toolbar-title { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .02em; }
    +.toolbar-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,.75); }
    +.preview-toolbar-actions { display: flex; align-items: center; gap: 3px; }
    +.preview-toolbar-actions button { width: 25px; height: 24px; border: 1px solid transparent; border-radius: 5px; background: transparent; color: #cbd5e1; cursor: pointer; font: inherit; font-size: 14px; }
    +.preview-toolbar-actions button:hover:not(:disabled) { background: rgba(99,102,241,.22); border-color: rgba(129,140,248,.45); color: #fff; }
    +.preview-toolbar-actions button:disabled { opacity: .35; cursor: not-allowed; }
    +.toolbar-divider { width: 1px; height: 17px; margin: 0 5px; background: rgba(148,163,184,.24); }
    +.zoom-label { min-width: 39px; text-align: center; color: #94a3b8; font-size: 10px; font-variant-numeric: tabular-nums; }
    +.paper { transform-origin: center center; box-shadow: 0 24px 55px rgba(0,0,0,.42), 0 0 0 1px rgba(15,23,42,.35); }
    +.preview-cell { cursor: pointer; transition: box-shadow .15s ease, border-color .15s ease; }
    +.preview-cell:hover { border-color: #6366f1 !important; box-shadow: inset 0 0 0 2px rgba(99,102,241,.25); }
    +.preview-cell.selected { border: 2px solid #6366f1 !important; box-shadow: inset 0 0 0 2px rgba(129,140,248,.25); }
    +.cost-panel { box-shadow: 0 12px 28px rgba(0,0,0,.14); border-color: rgba(148,163,184,.18); }
    +.button:focus-visible, .input-text:focus-visible, .input-select:focus-visible, .tab-btn:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; }
    +
    +@media (max-width: 900px) {
    +  .preview-toolbar { top: 8px; left: 8px; right: 8px; }
    +  .canvas-area { padding: 48px 10px 10px; min-height: 420px; }
    +}
    +
     .cost-row {
    @@ -1607,2 +1653 @@
     }
    -

## Assistant

La primera capa ya quedó separada: el cálculo de precios y las dimensiones de diseño ya no viven mezclados dentro de la pantalla principal. También añadí selección directa de imágenes desde la hoja, rotación tipo barra de herramientas, zoom y realce de la celda seleccionada; esto mantiene los controles existentes y hace la interacción más parecida a un editor de documentos. Ahora voy a compilar y corregir cualquier incompatibilidad real de TypeScript/Electron antes de seguir.

## Activity

    $ rtk node --check index.js; rtk node --check database.js; rtk npm run build
    > vite build && electron-builder
    ✘ [ERROR] Cannot read directory "..": Access is denied.
    ✘ [ERROR] Could not resolve "C:\\Users\\yahel\\YARS_Smart_Printer_Pro\\vite.config.ts"
    failed to load config from C:\Users\yahel\YARS_Smart_Printer_Pro\vite.config.ts
    error during build:
    Error: Build failed with 2 errors:
    error: Cannot read directory "..": Access is denied.
    error: Could not resolve "C:\\Users\\yahel\\YARS_Smart_Printer_Pro\\vite.config.ts"
        at failureErrorWithLog (C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:1472:15)
        at C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:945:25
        at runOnEndCallbacks (C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:1315:45)
        at buildResponseToResult (C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:943:7)
        at C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:970:16
        at responseCallbacks.<computed> (C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:622:9)
        at handleIncomingPacket (C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:677:12)
        at Socket.readFromStdout (C:\Users\yahel\YARS_Smart_Printer_Pro\node_modules\esbuild\lib\main.js:600:7)
        at Socket.emit (node:events:508:20)
        at addChunk (node:internal/streams/readable:564:12)
    ✗ (1) • 18.77s

## Assistant

La validación sintáctica del proceso principal no reportó errores, pero la compilación de Vite fue bloqueada por el entorno administrado (`Access is denied` al resolver `vite.config.ts`), no por el código. Voy a repetir únicamente la compilación con permisos ampliados para distinguir un bloqueo del entorno de un error real del proyecto y confirmar el artefacto generado.

## Activity

    $ rtk pwsh -Command 'Get-Process | Where-Object { $_.ProcessName -match "node|electron|7z" } | Select-Object ProcessName,Id,CPU,StartTime; Get-ChildItem "build" -File -ErrorAction SilentlyContinue | Select-Object Name,Length,LastWriteTime; Get-ChildItem "dist" -File -ErrorAction SilentlyContinue | Select-Object Name,Length,LastWriteTime'
    
    ProcessName    Id  CPU StartTime
    -----------    --  --- ---------
    node        15452 0.19 10/1/2026 6:52:13 PM
    node        26260 2.72 10/2/2026 1:00:08 AM
    node        26312 8.64 10/2/2026 1:00:15 AM
    node_repl   19232 0.06 10/1/2026 6:52:12 PM
    
    
    
    
    
    
    
    
    ✓ • 2.94s

## Assistant

La compilación ya avanzó fuera del bloqueo inicial y ahora está en el empaquetado; el proceso sigue activo, así que todavía no voy a reportar un `.exe` como terminado. Mientras finaliza, confirmé que no hay un fallo inmediato de sintaxis en `index.js` ni en `database.js`.

## Activity

    $ rtk npx vite build
    vite v5.4.21 building for production...
    transforming...
    ✓ 34 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                   0.42 kB │ gzip:  0.29 kB
    dist/assets/logo-D2CtCtYA.png   391.21 kB
    dist/assets/index-Bq9Ft6nM.css   23.82 kB │ gzip:  5.44 kB
    dist/assets/index-ExfKbqgv.js   193.48 kB │ gzip: 59.70 kB
    ✓ built in 1.74s
    The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
    ✓ • 15.41s

## Activity

    $ rtk pwsh -Command 'Get-Process -Id 95924 -ErrorAction SilentlyContinue; Get-Process | Where-Object { $_.ProcessName -match "electron-builder|node|7z" } | Select-Object ProcessName,Id,CPU,StartTime; Get-ChildItem "build" -File -ErrorAction SilentlyContinue | Select-Object FullName,Length,LastWriteTime'; rtk git diff --stat; rtk git status --short
    
    ProcessName    Id    CPU StartTime
    -----------    --    --- ---------
    7za         12640 128.19 10/2/2026 1:01:22 AM
    node        15452   0.19 10/1/2026 6:52:13 PM
    node        26260   2.72 10/2/2026 1:00:08 AM
    node        26312  10.81 10/2/2026 1:00:15 AM
    node_repl   19232   0.06 10/1/2026 6:52:12 PM
    
    
    
    
    
    
    
    
    PROJECT_MEMORIES_PRINTSTUDIO_PRO.md   |   83 +++
     analysis.js                           |   31 +-
     build/builder-debug.yml               |  206 +++++-
     build/win-unpacked/resources/app.asar |  Bin 22971373 -> 23020371 bytes
     database.js                           |  192 +++++-
     dist/assets/index-CXpJmU4s.css        |    1 -
     dist/index.html                       |    4 +-
     index.js                              |  435 +++++++++----
     office_bridge.py                      |   81 ++-
     package.json                          |   15 +-
     preload.js                            |   22 +-
     server.js                             |   69 +-
     src/App.tsx                           | 1132 ++++++++++++++++++++++++++++-----
     src/index.css                         |  788 +++++++++++++++++++++++
     upload_client.html                    |   20 +-
     15 files changed, 2685 insertions(+), 394 deletions(-)
    warning: unable to access 'C:\Users\yahel/.config/git/ignore': Permission denied
    warning: unable to access 'C:\Users\yahel/.config/git/ignore': Permission denied
    warning: could not open directory 'tmpj3mskaf2/': Permission denied
     M PROJECT_MEMORIES_PRINTSTUDIO_PRO.md
     M analysis.js
     M build/builder-debug.yml
     M build/win-unpacked/resources/app.asar
     M database.js
     D dist/assets/index-CXpJmU4s.css
     M dist/index.html
     M index.js
     M office_bridge.py
     M package.json
     M preload.js
     M server.js
     M src/App.tsx
     M src/index.css
     M upload_client.html
    ?? .claude/
    ?? .superdesign/
    ?? 75908b3f-9d43-443b-b510-f9d05d34bf35.jpg
    ?? 76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.ico
    ?? 76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.png
    ?? "WhatsApp Image 2026-09-04 at 5.03.09 PM.jpeg"
    ?? codex-session-01a0acc4-f7c7-70e0-b766-074536f93329.md
    ?? docs/
    ?? hotspot_manager.js
    ?? src/domain/
    ✓ • 9.15s

## Activity

    $ rtk pwsh -Command 'Get-Process -Id 12640 -ErrorAction SilentlyContinue | Select-Object ProcessName,Id,CPU,StartTime; Get-ChildItem "build" -Force -ErrorAction SilentlyContinue | Select-Object Name,Length,LastWriteTime'
    
    ProcessName    Id    CPU StartTime
    -----------    --    --- ---------
    7za         12640 193.89 10/2/2026 1:01:22 AM
    
    
    
    
    
    
    
    
    
    ✓ • 2.97s

## Activity

    $ rtk node --check index.js; rtk node --check database.js; rtk rg -n "uploadPath|hotspotInfo|pageSize|getPaperSizeMicrons|calculatePrintCosts|preview-toolbar|costBW" src/App.tsx index.js database.js src/domain src/index.css
    48 matches in 5 files:
    
    database.js:160:const baseBwRate = Math.max(0.05, parseFloat(correctionDetails.costBW) || 1);
    index.js:223:hotspotInfo: hs,
    index.js:226:uploadPath: localUploadPath,
    index.js:478:pageSize: getPaperSizeMicrons(jobData.paperSize, jobData.orientation)
    index.js:642:function getPaperSizeMicrons(paperSize, orientation) {
    src/App.tsx:4:import { calculatePrintCosts, isColorPage } from './domain/pricing';
    src/App.tsx:17:uploadPath: string;
    src/App.tsx:76:const [costBW, setCostBW] = useState<number>(() => Number(localStorage.getIte...
    src/App.tsx:77:const [costBWHigh, setCostBWHigh] = useState<number>(() => Number(localStorag...
    src/App.tsx:115:const [hotspotInfo, setHotspotInfo] = useState<{
    src/App.tsx:180:localStorage.setItem('costBW', costBW.toString());
    src/App.tsx:181:localStorage.setItem('costBWHigh', costBWHigh.toString());
    src/App.tsx:184:}, [costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode]);
    src/App.tsx:232:const up = netInfo?.uploadPath || uploadRoute || '/upload';
    src/App.tsx:235:const hs = currentHotspot || hotspotInfo;
    src/App.tsx:263:const shouldEnable = hotspotInfo?.state !== 'On';
    src/App.tsx:288:setUploadRoute(netInfo.uploadPath || '/upload');
    src/App.tsx:620:const costsBase = calculatePrintCosts(analysisResults, {
    src/App.tsx:621:costBase, costBW, costBWHigh, costColor, pricingMode, printColorMode, copies
    src/App.tsx:630:const single = calculatePrintCosts([{ ...page, quantity: 1 }], {
    src/App.tsx:631:costBase: 0, costBW, costBWHigh, costColor, pricingMode, printColorMode, copi...
    src/App.tsx:662:costBW,
    src/App.tsx:1020:<div className="preview-toolbar" aria-label="Herramientas de previsualización">
    src/App.tsx:1021:<div className="preview-toolbar-title"><span className="toolbar-dot"></span>V...
    src/App.tsx:1022:<div className="preview-toolbar-actions">
    src/App.tsx:1693:value={costBW}
    src/App.tsx:1707:value={costBWHigh}
    src/App.tsx:1842:<span className={`hotspot-badge ${hotspotInfo?.state === 'On' ? 'on' : 'off'}`}>
    src/App.tsx:1843:{hotspotInfo?.state === 'On' ? '● ACTIVA' : '○ INACTIVA'}
    src/App.tsx:1847:{hotspotInfo?.state === 'On' && hotspotInfo.ssid && (
      +5 more in src/App.tsx
    src/domain\pricing.ts:18:costBase: number; costBW: number; costBWHigh: number; costColor: number;
    src/domain\pricing.ts:37:export function calculatePrintCosts(pages: PricingPage[], config: PricingConf...
    src/domain\pricing.ts:43:// `costBW` is the configurable base price; the model keeps the relative
    src/domain\pricing.ts:45:const bwRate = Math.max(0, config.costBW || 1) * tier.rate * learnedFactor;
    src/domain\pricing.ts:52:subtotal += (color ? colorRate : (page.esAltaDensidadBN ? Math.max(config.cos...
    src/domain\pricing.ts:62:const high = Math.max(bwRate * 1.5, config.costBWHigh);
    src/index.css:1315:.preview-toolbar {
    src/index.css:1334:.preview-toolbar-title { display: flex; align-items: center; gap: 8px; font-s...
    src/index.css:1336:.preview-toolbar-actions { display: flex; align-items: center; gap: 3px; }
    src/index.css:1337:.preview-toolbar-actions button { width: 25px; height: 24px; border: 1px soli...
    src/index.css:1338:.preview-toolbar-actions button:hover:not(:disabled) { background: rgba(99,10...
    src/index.css:1339:.preview-toolbar-actions button:disabled { opacity: .35; cursor: not-allowed; }
    src/index.css:1350:.preview-toolbar { top: 8px; left: 8px; right: 8px; }
    ✓ • 2.55s

## Assistant

La compilación de la interfaz ya pasó correctamente con Vite, incluyendo los nuevos módulos de precios y layout. También quedó corregido el tamaño físico enviado a Electron (`pageSize`) para que papel/orientación coincidan con la previsualización; el empaquetado Windows sigue trabajando en segundo plano y esperaré a que confirme o falle antes de mencionar un ejecutable.

## Activity

    $ rtk node -e "const start=require('./server'); const fs=require('fs'); const path=require('path'); const os=require('os'); const dir=fs.mkdtempSync(path.join(os.tmpdir(),'printstudio-')); const server=start(3597,dir,dir,()=>{},'test-token'); fetch('http://127.0.0.1:3597/upload/test-token').then(async r=>{console.log('qr-upload-route',r.status,(await r.text()).includes('PrintStudio')); server.close();}).catch(e=>{console.error(e);server.close();process.exit(1);});"
    Servidor remoto escuchando en el puerto 3597 (0.0.0.0)
    qr-upload-route 200 true
    ✓ • 2.20s

## Activity

    $ rtk pwsh -Command 'Get-Process -Id 12640 -ErrorAction SilentlyContinue | Select-Object ProcessName,Id,CPU,StartTime; Get-ChildItem "build" -Force -ErrorAction SilentlyContinue | Select-Object Name,Length,LastWriteTime'
    
    Name                                     Length   LastWriteTime
    ----                                     ------   -------------
    win-unpacked                                      10/2/2026 1:01:21 AM
    builder-debug.yml                        7583     9/17/2026 6:10:18 PM
    builder-effective-config.yaml            371      5/28/2026 2:12:29 AM
    PrintStudio Pro 1.0.0.exe                86252306 10/2/2026 1:04:33 AM
    PrintStudio Pro Setup 1.0.0.exe          86571237 10/2/2026 1:04:42 AM
    PrintStudio Pro Setup 1.0.0.exe.blockmap 91475    9/17/2026 6:10:18 PM
    printstudio_pro-1.0.0-x64.nsis.7z        85643974 10/2/2026 1:04:27 AM
    YARS_Smart_Printer_Pro 1.0.0.exe         86134001 8/26/2026 8:15:03 PM
    
    ✓ • 2.73s

## Activity

    $ rtk npm run build
    > vite build && electron-builder
    vite v5.4.21 building for production...
    transforming...
    ✓ 34 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                   0.42 kB │ gzip:  0.29 kB
    dist/assets/logo-D2CtCtYA.png   391.21 kB
    dist/assets/index-Bq9Ft6nM.css   23.82 kB │ gzip:  5.44 kB
    dist/assets/index-ExfKbqgv.js   193.48 kB │ gzip: 59.70 kB
    ✓ built in 2.29s
      • electron-builder  version=24.13.3 os=10.0.26340
      • loaded configuration  file=package.json ("build" field)
      • rebuilding native dependencies  dependencies=better-sqlite3@12.9.0 platform=win32 arch=x64
      • install prebuilt binary  name=better-sqlite3 version=12.9.0 platform=win32 arch=x64 napi=
      • packaging       platform=win32 arch=x64 electron=31.7.7 appOutDir=build\win-unpacked
      • building        target=portable file=build\PrintStudio Pro 1.0.0.exe archs=x64
      • building        target=nsis file=build\PrintStudio Pro Setup 1.0.0.exe archs=x64 oneClick=false perMachine=false
      • building block map  blockMapFile=build\PrintStudio Pro Setup 1.0.0.exe.blockmap
    The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
    ✓ • 4m 45s

## Assistant

El empaquetado terminó correctamente: Vite, Electron Builder, portable y NSIS generaron nuevos artefactos. Además probé el endpoint QR local tokenizado y devolvió `200` con la página de subida, así que el flujo de enlace funciona en la estación; para acceso desde otra red, el modo Datos sigue dependiendo de que LocalTunnel consiga abrirse, y ahora el enlace tokenizado se entrega de forma consistente al renderer.

## Activity

    $ rtk pwsh -Command 'Get-Item "build\PrintStudio Pro 1.0.0.exe","build\PrintStudio Pro Setup 1.0.0.exe" | Select-Object FullName,Length,LastWriteTime; git diff --check; git status --short | Select-Object -First 80'
    
    warning: in the working copy of 'analysis.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/builder-debug.yml', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/win-unpacked/LICENSE.electron.txt', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/win-unpacked/LICENSES.chromium.html', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/win-unpacked/resources/app.asar.unpacked/node_modules/@img/sharp-win32-x64/versions.json', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/win-unpacked/resources/app.asar.unpacked/node_modules/pdf-to-printer/LICENSE', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/win-unpacked/resources/app.asar.unpacked/node_modules/pdf-to-printer/dist/bundle.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'build/win-unpacked/resources/app.asar.unpacked/node_modules/pdf-to-printer/package.json', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'database.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'index.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'office_bridge.py', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'preload.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'server.js', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'src/App.tsx', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'src/index.css', LF will be replaced by CRLF the next time Git touches it
    warning: in the working copy of 'upload_client.html', LF will be replaced by CRLF the next time Git touches it
    PROJECT_MEMORIES_PRINTSTUDIO_PRO.md:162: new blank line at EOF.
    index.js:146: trailing whitespace.
    +
    src/App.tsx:127: trailing whitespace.
    +
    src/App.tsx:917: trailing whitespace.
    +                    <span
    src/App.tsx:926: trailing whitespace.
    +                      {pageIsColor
    src/App.tsx:927: trailing whitespace.
    +                        ? `🎨 Color · ${page.cobertura.toFixed(1)}%`
    src/App.tsx:1749: trailing whitespace.
    +              <div style={{
    src/App.tsx:1750: trailing whitespace.
    +                padding: '5px 6px',
    src/App.tsx:1751: trailing whitespace.
    +                background: totalBwImpressions >= 1 && totalBwImpressions <= 50 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
    src/App.tsx:1753: trailing whitespace.
    +                borderRadius: '4px'
    src/App.tsx:1759: trailing whitespace.
    +              <div style={{
    src/App.tsx:1760: trailing whitespace.
    +                padding: '5px 6px',
    src/App.tsx:1761: trailing whitespace.
    +                background: totalBwImpressions >= 51 && totalBwImpressions <= 100 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
    src/App.tsx:1763: trailing whitespace.
    +                borderRadius: '4px'
    src/App.tsx:1769: trailing whitespace.
    +              <div style={{
    src/App.tsx:1770: trailing whitespace.
    +                padding: '5px 6px',
    src/App.tsx:1771: trailing whitespace.
    +                background: totalBwImpressions >= 101 && totalBwImpressions <= 200 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
    src/App.tsx:1773: trailing whitespace.
    +                borderRadius: '4px'
    src/App.tsx:1779: trailing whitespace.
    +              <div style={{
    src/App.tsx:1780: trailing whitespace.
    +                padding: '5px 6px',
    src/App.tsx:1781: trailing whitespace.
    +                background: totalBwImpressions >= 201 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
    src/App.tsx:1783: trailing whitespace.
    +                borderRadius: '4px'
    src/App.tsx:1846: trailing whitespace.
    +
    src/App.tsx:1888: trailing whitespace.
    +                  <div
    src/App.tsx:1916: trailing whitespace.
    +                  <div
    src/App.tsx:1947: trailing whitespace.
    +              <div
    src/App.tsx:1981: trailing whitespace.
    +              <div
    warning: unable to access 'C:\Users\yahel/.config/git/ignore': Permission denied
    warning: unable to access 'C:\Users\yahel/.config/git/ignore': Permission denied
    warning: could not open directory 'tmpj3mskaf2/': Permission denied
    FullName                                                                      Length LastWriteTime
    --------                                                                      ------ -------------
    C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro 1.0.0.exe       86252306 10/2/2026 1:04:33 AM
    C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro Setup 1.0.0.exe 86571237 10/2/2026 1:04:42 AM
     M PROJECT_MEMORIES_PRINTSTUDIO_PRO.md
     M analysis.js
     M build/builder-debug.yml
     M build/win-unpacked/resources/app.asar
     M database.js
     D dist/assets/index-CXpJmU4s.css
     M dist/index.html
     M index.js
     M office_bridge.py
     M package.json
     M preload.js
     M server.js
     M src/App.tsx
     M src/index.css
     M upload_client.html
    ?? .claude/
    ?? .superdesign/
    ?? 75908b3f-9d43-443b-b510-f9d05d34bf35.jpg
    ?? 76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.ico
    ?? 76479920-dbd4-4144-8b2e-901e1cb4e544-Photoroom.png
    ?? "WhatsApp Image 2026-09-04 at 5.03.09 PM.jpeg"
    ?? codex-session-01a0acc4-f7c7-70e0-b766-074536f93329.md
    ?? docs/
    ?? hotspot_manager.js
    ?? src/domain/
    
    ✓ • 6.89s

## Activity

    $ rtk rg -n "PrintStudio Pro|YARS_Smart_Printer_Pro|updated.*exe|SetTokenInformation|duplicated React" 'C:\Users\yahel\.codex\memories\MEMORY.md'
    1:# Task Group: PrintStudio Pro source review, Electron printing, and packaging
    3:scope: Inspect and narrowly repair remaining PrintStudio Pro print-option behavior, then produce a confirmed Windows executable without changing unrelated UI or behavior.
    4:applies_to: cwd=C:\Users\yahel\YARS_Smart_Printer_Pro; reuse_rule=Reuse the Electron print-handler and packaging checks for this checkout or a closely matching app, but treat the proposed patch and historical executable as unverified until applied and rebuilt.
    6:## Task 1: Review existing PrintStudio Pro changes and attempt remaining print behavior fix; incomplete
    10:- rollout_summaries/2026-08-29T02-14-05-1HZf-printstudio_pro_review_packaging_blocked.md (cwd=\\?\C:\Users\yahel, rollout_path=C:\Users\yahel\.codex\sessions\2026\08\28\rollout-2026-08-28T20-14-05-01a04b4b-aadc-7f83-a596-70d872852f99.jsonl, updated_at=2026-09-11T05:45:31+00:00, thread_id=01a04b4b-aadc-7f83-a596-70d872852f99, partial; no patch or fresh executable verified)
    14:- PrintStudio Pro, YARS_Smart_Printer_Pro, Electron, React, src/App.tsx, index.js, ipcMain.handle('print-document'), generatePrintHTML, npm run build, vite build, electron-builder, printOptions, isColorPrint, pageSize, getPaperSizeMicrons, SetTokenInformation(TokenDefaultDacl) failed: 1344
    19:- When the user asks for the updated `.exe` path -> report it only after a fresh package has actually succeeded and the output file is confirmed. [Task 1]
    23:- The source repository is `C:\Users\yahel\YARS_Smart_Printer_Pro`; `npm run build` runs `vite build && electron-builder`. Relevant files are `src/App.tsx`, `src/index.css`, `index.js`, `server.js`, and `upload_client.html`. [Task 1]
    26:- Historical path `C:\Users\yahel\YARS_Smart_Printer_Pro\build\PrintStudio Pro 1.0.0.exe` is not evidence of a newly updated artifact. [Task 1]
    30:- Symptom: shell/patch launches fail with `Access is denied` or `SetTokenInformation(TokenDefaultDacl) failed: 1344`. Cause: Windows sandbox/process-token failure. Pivot: restart/restore the terminal or Codex session before inspecting, patching, or building; do not edit packaged files blindly—locate and modify source first. [Task 1]
    32:- Stop rule: no source changes, print fix, or updated `.exe` were verified in this rollout. After recovery, re-check the intended patch, run `node --check index.js`, run `npm run build`, and verify the output before making completion claims. [Task 1]
    ✓ • 816ms

## Assistant

He refinado el programa sin eliminar funciones existentes.

Cambios principales:

- Nuevo motor separado de precios en [`src/domain/pricing.ts`](C:/Users/yahel/YARS_Smart_Printer_Pro/src/domain/pricing.ts).
- Corrección del cálculo B/N, color, alta densidad y precios por mayoreo.
- Aprendizaje progresivo más estable y basado en correcciones reales.
- Corrección manual ahora considera las tarifas configuradas para aprender correctamente.
- QR corregido para usar rutas tokenizadas consistentes.
- Soporte de conexión por Internet mediante túnel, sin requerir la misma red Wi‑Fi.
- Tamaño físico y orientación enviados correctamente a Electron.
- Previsualización mejorada con:
  - Zoom.
  - Rotación tipo Word.
  - Selección directa de imágenes.
  - Realce visual de la celda seleccionada.
  - Barra de herramientas profesional.
- Documentación de arquitectura agregada en `.superdesign/init/`.

Verificaciones realizadas:

- `vite build` exitoso.
- `node --check index.js` exitoso.
- `node --check database.js` exitoso.
- Endpoint QR probado: respuesta HTTP `200`.
- Empaquetado Windows exitoso.

Archivos generados:

- [PrintStudio Pro 1.0.0.exe](C:/Users/yahel/YARS_Smart_Printer_Pro/build/PrintStudio%20Pro%201.0.0.exe)
- [PrintStudio Pro Setup 1.0.0.exe](C:/Users/yahel/YARS_Smart_Printer_Pro/build/PrintStudio%20Pro%20Setup%201.0.0.exe)

La conexión remota por Internet requiere que LocalTunnel pueda abrirse con acceso a Internet; la ruta local/tokenizada sí fue verificada directamente.
