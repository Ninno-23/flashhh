# Scribe Study Desk

A responsive study workspace for turning course material into summaries, reviewers, flashcards, quizzes, and saved study sets. Includes a built-in guide library, chat history, study streak/progress tracking, light/dark mode, and local browser persistence.

## Features

- **Tutor modes:** chat, summary, reviewer, flashcards, Q&A quiz, and complete study kit.
- **File import:** PDF, Word (`.docx`), text/Markdown, and images. Scanned PDFs may use page-image analysis when the PDF has little extractable text.
- **Study tools:** flip cards, mark known cards, take quizzes, save generated sets, and track progress.
- **Local fallback:** built-in guides and text-derived kits remain available if no AI provider is configured.
- **Privacy-conscious API setup:** provider credentials stay on the server; never put API keys in frontend code or commit a real `.env` file.
- **Responsive layout** with keyboard focus states, reduced-motion support, and dark mode.

## Run locally

Requires Node.js 22.14+.

```bash
npm ci
npm run dev
```

## Configure AI

Set these environment variables in your hosting dashboard (not in client-side code):

- `AI_API_URL`: OpenAI-compatible Chat Completions endpoint, e.g. `https://router.huggingface.co/v1/chat/completions`
- `AI_API_KEY`: your provider token
- `AI_MODEL`: exact model ID supported by your provider

The model/provider must support the Chat Completions API format. Vision/image-note analysis depends on the selected model supporting image input. Do not commit API tokens to GitHub.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository. Render reads `render.yaml`.
3. Add your provider values for `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL` in the Render environment settings.
4. Deploy. Render uses `NITRO_PRESET=node-server` and starts `.output/server/index.mjs`.

The free web service may sleep when idle, and external AI providers may impose their own quotas or usage limits.

## Deploy to Vercel

The existing `vercel.json` and default Nitro preset target Vercel. Keep `NITRO_PRESET` unset (or set it to `vercel`) when deploying there.

## Tests

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

A passing local build does not guarantee that your hosting provider's environment variables or external AI quota are configured correctly; check the deployment logs and test an actual chat and each study mode after deployment.
