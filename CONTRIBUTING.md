# Contributing to African Fashion eCommerce

Thank you for your interest in contributing to the African Fashion eCommerce platform! 🎉

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/african-fashion-ecommerce.git
   cd african-fashion-ecommerce
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start development server**:
   ```bash
   npm run dev
   # or use the quick start script
   ./start.sh
   ```

## Development Workflow

### Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards (see below)

3. **Test your changes**:
   ```bash
   # Type check
   npm run type-check
   
   # Lint
   npm run lint
   
   # Build
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces for props and data
- Avoid `any` types
- Enable strict mode checks

### React/Next.js

- Use functional components with hooks
- Mark interactive components with `'use client'` directive
- Follow Next.js App Router conventions
- Use server components by default, client components when needed

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme (see `tailwind.config.js`)
- Ensure responsive design (mobile-first)
- Use semantic HTML elements

### File Structure

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
│   ├── common/       # Shared components
│   ├── ui/           # UI primitives
│   └── [feature]/    # Feature-specific components
├── services/         # API services
├── store/            # State management (Zustand)
├── types/            # TypeScript types
└── utils/            # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (e.g., `DesignCard.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Functions**: camelCase (e.g., `formatPrice()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `DesignFilters`)

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add designer profile page
fix: correct price filtering logic
docs: update deployment guide
refactor: extract price helper function
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] TypeScript type check passes (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code is well-commented where necessary
- [ ] No sensitive data or secrets committed

### PR Description

Include:
1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How was this tested?
5. **Screenshots** - If UI changes, include before/after screenshots

## Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Backend API integration
- User authentication flow
- Shopping cart functionality
- Payment processing (Stripe)
- Order management

### Medium Priority
- Designer dashboard
- Admin panel
- Search functionality improvements
- Performance optimizations
- Accessibility improvements

### Good First Issues
- UI component enhancements
- Documentation improvements
- Test coverage
- Bug fixes
- Code refactoring

## Code Review Process

1. At least one maintainer must review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your changes will be deployed in the next release

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/agolomola/african-fashion-ecommerce/discussions)
- **Bug Report?** Open an [Issue](https://github.com/agolomola/african-fashion-ecommerce/issues)
- **Need help?** Ask in the PR comments

## Code of Conduct

Be respectful and constructive:
- ✅ Be welcoming and inclusive
- ✅ Respect differing viewpoints
- ✅ Accept constructive criticism
- ✅ Focus on what's best for the community
- ❌ No harassment or discrimination
- ❌ No trolling or insulting comments

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- README acknowledgments

Thank you for making African Fashion eCommerce better! 🌍✨
