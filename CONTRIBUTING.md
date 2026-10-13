# Contributing to Tempo Agent Examples

Thank you for your interest in contributing to the Tempo Agent Examples repository! We welcome contributions from the community to help improve and expand our examples.

## Getting Started

1. Ensure you read the general [CONTRIBUTING](https://github.com/skeduloDevelopers/.github/blob/main/profile/CONTRIBUTING.md) and [CODE OF CONDUCT](https://github.com/skeduloDevelopers/.github/blob/main/profile/CODE_OF_CONDUCT.md) instructions.
2. Familiarize yourself with the codebase and review the [README](README.md) for details on the available examples and how to deploy them.
3. Check the existing issues or create a new issue before starting work on a significant contribution. This helps us coordinate efforts and provide guidance.
4. Fork this repository.
5. Set up your development environment following the [Tempo developer guide](https://docs.skedulo.com/developer-guides/tempo/) and the [Skedulo CLI documentation](https://docs.skedulo.com/developer-guides/cli/skedulo-cli-introduction/).
6. Create a _topic_ branch in your fork based on the **main** branch.
7. Make your changes in your fork.
8. Submit a pull request when you're ready. We'll review your code, suggest any needed changes, and merge it in.

## Types of Contributions

We welcome various types of contributions, including:

- **New examples**: a custom agent, or an automation that raises Tempo tasks, that demonstrates a use case or a feature the existing examples do not
- **Improvements to existing examples**: better instructions, tighter tool allowlists, clearer READMEs
- **Bug fixes**: an example that no longer deploys or no longer behaves as its README says
- **Documentation updates**: README files, screenshots, prompts to try

## Example Guidelines

When contributing an example, please ensure:

- It lives in its own folder, named for what it shows, and the folder contains the state file(s) and a `README.md`
- The README covers the purpose, the prerequisites, the deploy command, three prompts to try, and what Tempo should do with each
- Every state file deploys with `sked artifacts <type> upsert` and, for a custom agent, passes publish validation
- The example is portable: no tenant IDs, no secrets, no internal hostnames. Use a placeholder host such as `parts.example.com` in `allowedDomains` and a `ConfigVariable` artifact for any secret
- Custom agents are short: a one-sentence `role`, a `scope`, a few lines of `guidance`, and `negativeBoundaries` only where they matter
- If the example belongs in the deployable package, add a copy of its state file(s) under `package/src/<artifact-type>/`
- Add the example to the table in the main README, with a screenshot in `images/`

## Branches

- We work in **main**.
- Our released (aka. _production_) branch is **main**.
- Development happens in _topic_ branches (feature and/or bug-fix).
    - Feature and bug-fix branches are based on **main**
    - Branches _should_ be kept up-to-date using `rebase`
    - See below for further merge instructions

### Branch Naming Convention

When creating _topic_ branches in this repository, please prefix with `<developer-name>/` to keep the repository organized.

Examples:
- `sophiew/add-parts-agent-example`
- `johnd/fix-cancellation-filter`
- `mariaf/improve-documentation`

### Merging Between Branches

- We try to limit merge commits as much as possible.
- _Topic_ branches are:
    1. Based on **main** and will be
    1. Squash-merged into **main**

## Pull Requests

- Develop features and bug fixes in _topic_ branches.
- _Topic_ branches can live in forks (external contributors) or within this repository (committers with write access).
- Provide a clear description of the changes in your pull request.
- Reference any related issues using the `#issue-number` syntax.
- Ensure your code follows the existing style and conventions.
- Update documentation as needed.

### Pull Request Checklist

Before submitting a pull request, please ensure:

- [ ] Every state file you added or changed deploys successfully with the Skedulo CLI to a tenant with Tempo enabled
- [ ] You have run the prompts in the example README and Tempo behaved as the README says
- [ ] All JSON files are properly formatted
- [ ] Documentation has been updated (README.md and the in-folder README, including screenshots)
- [ ] Nothing committed contains a tenant ID, a secret value, or an internal hostname
- [ ] Your branch is up to date with **main**
- [ ] Your commit messages are clear and descriptive

### Merging Pull Requests

- Pull request merging is restricted to squash & merge only.
- This keeps our commit history clean and makes it easier to track changes.

## Questions or Need Help?

If you have questions or need assistance:

- Review the [Tempo developer guide](https://docs.skedulo.com/developer-guides/tempo/)
- Check existing issues for similar questions
- Create a new issue with the `question` label
- Contact your Customer Success Manager

## Recognition

Contributors who make significant contributions will be recognized in the repository. We appreciate your time and effort in making these examples better for the entire Skedulo developer community!
