# Contributing to Rank

We welcome contributions to **Rank by ListeningKit**! Please read this guide before submitting pull requests or issues.

---

## Development Workflow

1. **Fork and branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Verify tests and builds**:
   ```bash
   pnpm run build
   pnpm run test
   ```
4. **Commit messages**:
   Follow conventional commits format:
   - `feat: add hybrid reciprocal rank fusion pipeline`
   - `fix: correct token calculation in cross-encoder adapter`
   - `docs: update self-hosting instructions`

---

## Code Style & Conventions

- Use TypeScript with strict type checking enabled.
- Avoid loose `any` types; define explicit interfaces in `src/types/`.
- Ensure all public functions and methods are covered with unit tests.
- When adding architecture changes, update the Mermaid diagrams in `docs/diagrams/`.

---

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE).
