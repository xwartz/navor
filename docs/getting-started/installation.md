# Installation

Navor requires Node.js 22.14 or later.

## Install the CLI

```bash
npm install --global @navor/cli
```

Verify:

```bash
nav
```

If the command is not found, ensure your npm global bin directory is on `PATH`.

## From a source checkout

```bash
git clone https://github.com/xwartz/navor.git
cd navor
pnpm install
pnpm build
```

Run the example workspace:

```bash
nav serve example
```

Open the URL printed in the terminal (default port 5173).

## Create your first repository

A Navor repository is a directory of `.nav` files. Create one anywhere:

```bash
mkdir ~/investment
```

Continue with [your first `.nav` file](your-first-nav.md), then [organize your repository](organize-your-repository.md).

## Editor support

Syntax highlighting and format-on-save for `.nav` files live in the [editor support](editor-support.md) guide.

## AI assistant skills

Navor publishes portable Agent Skills through the open `skills` CLI. List the available skills first:

```bash
npx skills add xwartz/navor --list
```

Install all of them for Codex in the current project:

```bash
npx skills add xwartz/navor --skill '*' --agent codex
```

Use `--agent cursor` or `--agent claude-code` for another supported assistant. Add `--global` to install for all of your projects instead of only the current project.

The CLI collects anonymous installation telemetry by default. If that does not fit your privacy preference, disable it for the command:

```bash
DISABLE_TELEMETRY=1 npx skills add xwartz/navor --skill '*' --agent codex --global
```

Read [AI assistant skills](ai-skills.md) before using a skill with an investment workspace.
