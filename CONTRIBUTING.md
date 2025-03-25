# Contributing to Organization Configuration Management Tool

Thank you for considering contributing to the Organization Configuration Management Tool. This document outlines the process for contributing to the project and the standards we follow.

## Development Setup

Please refer to the [Local Development Guide](docs/setup/local-development.md) for detailed instructions on setting up your development environment.

## Development Workflow

We follow a standard GitHub workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All pull requests should target the `main` branch.

## Code Standards

- **TypeScript**: We use TypeScript for type safety. Ensure all code has proper type definitions.
- **Formatting**: We use Prettier for code formatting and ESLint for linting.
- **Component Structure**: Follow the established component patterns in the codebase.
- **Naming Conventions**: Use descriptive names for functions, variables, and components.
- **Comments**: Add comments for complex logic, but focus on writing self-documenting code.

## Testing Requirements

All code contributions should include appropriate tests:

- **Unit Tests**: For individual components and functions
- **Integration Tests**: For API routes and service interactions
- **Coverage**: Aim for at least 80% test coverage for new code

Run tests locally before submitting a pull request:

```bash
npm test
```

## Pull Request Process

1. Ensure your code follows our standards and passes all tests
2. Update documentation if you're changing functionality
3. Include a clear description of the changes in your pull request
4. Link any related issues in the pull request description
5. Wait for code review and address any feedback

## Commit Message Guidelines

We follow conventional commits for our commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

Example: `feat: add organization selector component`

## Branch Naming

Use the following naming convention for branches:

- `feature/short-description` for new features
- `fix/short-description` for bug fixes
- `docs/short-description` for documentation updates
- `refactor/short-description` for code refactoring

## Code Review Process

All pull requests require at least one review from a maintainer before merging. Reviewers will check for:

- Code quality and adherence to standards
- Test coverage and passing tests
- Documentation updates
- Performance considerations

## Development Environment

The project uses the following development tools:

- Node.js 18+
- npm or yarn
- NextJS 14
- Jest for testing
- ESLint and Prettier for code quality

## Getting Help

If you need help with the contribution process or have questions, please:

- Open an issue with the question tag
- Refer to the documentation in the `docs` directory
- Reach out to the maintainers listed in the `.github/CODEOWNERS` file