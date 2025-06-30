# Contributing to Echofy.ai

Thank you for your interest in contributing to Echofy.ai! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (for backend features)
- ElevenLabs account (for TTS features)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/echofy-ai.git`
3. Install dependencies: `npm install`
4. Copy environment file: `cp .env.example .env`
5. Configure your environment variables
6. Start development server: `npm run dev`

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict mode, proper typing
- **ESLint**: Follow Airbnb configuration
- **Prettier**: Auto-format code before commits
- **Conventional Commits**: Use semantic commit messages

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(auth): add social login support`
- `fix(transcription): resolve audio processing bug`
- `docs(readme): update installation instructions`

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`
- Refactor: `refactor/description`

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Writing Tests
- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Test Structure
```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Test implementation
  });
});
```

## 🏗️ Architecture Guidelines

### Component Structure
```typescript
// Component props interface
interface ComponentProps {
  // Props definition
}

// Main component
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    // JSX
  );
};

export default Component;
```

### File Organization
```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── pages/         # Page components
├── lib/           # Utility functions
├── types/         # TypeScript definitions
└── test/          # Test utilities
```

### State Management
- Use React Context for global state
- Use useState for local component state
- Use useReducer for complex state logic
- Avoid prop drilling

## 🔒 Security Guidelines

### API Keys
- Never commit API keys to version control
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper authentication checks

### Data Handling
- Encrypt sensitive data
- Implement proper CORS policies
- Use HTTPS in production
- Follow GDPR compliance guidelines

## 📝 Documentation

### Code Documentation
- Document complex functions with JSDoc
- Add inline comments for business logic
- Keep README files up to date
- Document API endpoints

### User Documentation
- Write clear user guides
- Include screenshots for UI features
- Provide troubleshooting sections
- Keep documentation current with features

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Reproduce the bug
3. Gather system information
4. Create minimal reproduction case

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.0.0]

**Additional Context**
Screenshots, logs, etc.
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Mockups, examples, etc.
```

## 🔄 Pull Request Process

### Before Submitting
1. Create feature branch from `develop`
2. Write tests for new functionality
3. Update documentation
4. Run full test suite
5. Ensure code follows style guidelines

### PR Template
```markdown
**Description**
Brief description of changes

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process
1. Automated checks must pass
2. At least one code review required
3. All conversations must be resolved
4. Squash and merge to main

## 🏷️ Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

### Release Steps
1. Create release branch from `main`
2. Update version numbers
3. Update CHANGELOG.md
4. Create pull request
5. Merge and tag release
6. Deploy to production

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the issue, not the person

### Communication
- Use clear, concise language
- Provide context for discussions
- Be patient with responses
- Ask questions when unclear

## 📞 Getting Help

### Resources
- [Documentation](./docs/)
- [GitHub Discussions](https://github.com/your-org/echofy-ai/discussions)
- [Discord Community](https://discord.gg/echofy)

### Contact
- Technical questions: GitHub Issues
- General discussion: GitHub Discussions
- Security issues: security@echofy.ai
- Other inquiries: hello@echofy.ai

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

Thank you for contributing to Echofy.ai! 🎉