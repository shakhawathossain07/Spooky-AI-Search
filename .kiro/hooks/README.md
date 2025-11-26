# Agent Hooks for Spooky AI Search

This directory contains agent hooks that automate various development tasks.

## Available Hooks

### Automatic Hooks (Trigger on Events)

1. **Auto Test on Save** (`auto-test-on-save.json`)
   - Triggers: When `.ts` or `.tsx` files are saved
   - Action: Runs tests for the saved file and fixes failures
   - Status: ✅ Enabled

2. **Format Code on Save** (`format-on-save.json`)
   - Triggers: When code files are saved
   - Action: Checks and fixes linting/formatting issues
   - Status: ✅ Enabled

3. **Sync Database Types** (`database-sync.json`)
   - Triggers: When SQL migration files are saved
   - Action: Regenerates TypeScript types from database schema
   - Status: ✅ Enabled

### Manual Hooks (Click to Run)

4. **📝 Update Docs** (`update-docs.json`)
   - Action: Updates README with recent changes
   - Use when: You've added new features or changed APIs

5. **⚡ Optimize Search** (`optimize-search.json`)
   - Action: Analyzes and optimizes search performance
   - Use when: Search feels slow or you want to improve efficiency

6. **🔒 Security Check** (`security-check.json`)
   - Action: Performs security audit of the codebase
   - Use when: Before deployment or after adding new features

7. **🧪 Generate Tests** (`generate-tests.json`)
   - Action: Creates unit tests for the current file
   - Use when: You've written new code that needs testing

8. **✨ Enhance UI** (`improve-ui.json`)
   - Action: Suggests and implements UI/UX improvements
   - Use when: You want to improve a component's user experience

## How to Use

### Automatic Hooks
These run automatically when their trigger conditions are met. No action needed!

### Manual Hooks
1. Open the Kiro Explorer panel
2. Find the "Agent Hooks" section
3. Click the button for the hook you want to run
4. Or use Command Palette: "Open Kiro Hook UI"

## Enabling/Disabling Hooks

To disable a hook, edit its JSON file and set:
```json
"enabled": false
```

To enable it again, set it back to `true`.

## Creating Custom Hooks

You can create your own hooks by adding a new JSON file to this directory:

```json
{
  "name": "My Custom Hook",
  "description": "What this hook does",
  "enabled": true,
  "trigger": {
    "type": "manual",  // or "onFileSave"
    "buttonLabel": "🎯 Run My Hook"
  },
  "action": {
    "type": "agent",
    "prompt": "Instructions for what the agent should do"
  }
}
```

## Hook Types

### Trigger Types
- `manual`: Shows a button you can click
- `onFileSave`: Runs when files matching the pattern are saved

### File Patterns
- `**/*.ts`: All TypeScript files
- `**/*.{ts,tsx}`: TypeScript and TSX files
- `src/**/*.tsx`: Only TSX files in src directory
- `*.md`: Markdown files in root only

## Best Practices

1. **Keep prompts specific**: Clear instructions lead to better results
2. **Use file patterns wisely**: Avoid triggering on too many files
3. **Test manual hooks first**: Before making them automatic
4. **Disable unused hooks**: To avoid unnecessary agent runs
5. **Review agent changes**: Always check what the agent modified

## Troubleshooting

**Hook not triggering?**
- Check if `enabled: true`
- Verify file pattern matches your files
- Check Kiro logs for errors

**Agent doing wrong thing?**
- Refine the prompt to be more specific
- Add examples of expected behavior
- Break complex tasks into multiple hooks

## Examples

### Good Prompt
```
"Generate unit tests for the currently open component. Include tests for rendering, user interactions, and error states. Use Vitest and React Testing Library."
```

### Bad Prompt
```
"Make tests"  // Too vague!
```

## Support

For more information about agent hooks:
- Command Palette → "Open Kiro Hook UI"
- Kiro Documentation
- Explorer Panel → Agent Hooks section
