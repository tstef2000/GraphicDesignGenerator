# GraphicDesignGenerator

Discord bot for generating Rust team/server logos with AI using Google Gemini image generation.

## Features

- Multiple slash commands (not just one):
	- `/logo` for main generation
	- `/logo-advanced` for deeper controls
	- `/remix` to iterate from an uploaded logo
	- `/styles` for recommended style presets
	- `/inspiration` for Rust trend packs
	- `/reference` to save/list/remove custom reference images
	- `/prompt-preview` to inspect the exact AI prompt before generating
- Rich prompt variables:
	- Style preset + custom style text
	- Colors (up to 8 HEX colors)
	- Font direction
	- Glow on/off
	- Mascot, vibe, icon focus, complexity, aspect ratio
	- Negative prompt constraints
	- Extra advanced controls (texture, emblem shape, shadow strength, typography case, saturation)
- User-provided reference images:
	- Per-request attachments (`reference_image_1..3`)
	- Saved per-user references via `/reference add`
- Rust-specific guidance:
	- Prompt engineering includes Rust survival/industrial/esports branding cues
	- Inspiration packs tuned for common Rust logo motifs while avoiding direct copying

## Why Gemini model selection is configurable

Gemini model names can change over time. This bot uses:

- `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview` by default

If Google updates model availability, set `GEMINI_IMAGE_MODEL` in `.env` to your preferred image-capable Gemini model.

## Setup

1. Install Node.js 20+
2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Fill values in `.env`:

- `DISCORD_BOT_TOKEN`
- `DISCORD_CLIENT_ID`
- `GEMINI_API_KEY`
- Optional: `DISCORD_GUILD_ID` for faster guild-scoped command registration while testing

5. Register slash commands:

```bash
npm run register
```

6. Start bot:

```bash
npm start
```

## Command Quick Start

### Main generation

```text
/logo description:"Hardcore rust clan logo with wolf mask" style:mascot-aggro colors:#F97316,#111827 glow:true text:"WLF"
```

### Advanced generation

```text
/logo-advanced description:"Elite PvP group logo" style:military-tactical texture:metal-rusted emblem_shape:shield shadow_strength:60 saturation:vibrant
```

### Save custom references

```text
/reference add image:<upload>
/reference list
```

### Remix existing design

```text
/remix source_image:<upload> description:"Keep identity but make it more modern and sharp" glow:false
```

## Notes on Rust logo inspiration research

This bot intentionally uses trend-level Rust branding guidance (survival faction motifs, tactical insignias, industrial geometry, aggressive esports readability) rather than copying any specific server/team trademark.

If you want exact visual direction from your own favorite servers/teams, upload those as custom reference images with `/logo` attachments or `/reference add`.

## Project Structure

- `src/index.js` bot runtime
- `src/registerCommands.js` command registration
- `src/commands/commandRegistry.js` slash command definitions + handlers
- `src/services/geminiService.js` Gemini image generation and image input handling
- `src/services/referenceStore.js` saved user references
- `src/utils/stylePresets.js` recommended styles
- `src/utils/rustInspiration.js` Rust trend packs
- `src/utils/promptBuilder.js` prompt construction

## Future upgrades you can add

- Multiple output variations per request
- Cooldown + credits system
- Admin config command for per-server defaults
- Optional queue worker for high traffic
