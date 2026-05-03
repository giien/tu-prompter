# Contributing

Thanks for your interest in improving TuPrompter.

## Before submitting changes

- Open an issue first for large changes, UI redesigns, or permission-related changes.
- Keep the extension privacy-conscious and minimal.
- Do not introduce telemetry, ad code, or background data collection.
- Do not commit API keys, private screenshots, or local packaging artifacts.

## Development notes

- This project is a native Chrome Manifest V3 extension without a build step.
- Reload the extension in `chrome://extensions` after local changes.
- Validate scripts before submitting:

```bash
node --check background/service-worker.js
node --check content/content.js
node --check popup/popup.js
```

## Pull requests

- Keep pull requests focused and small when possible.
- Explain user-facing behavior changes clearly.
- Mention any permission changes in the PR description.
- Confirm that the change still works on common image sites such as Pinterest.

## License reminder

By contributing, you agree that your contributions are provided under the repository license and may be used in future non-commercial releases of this project.

