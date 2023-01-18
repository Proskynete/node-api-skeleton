<div id="top">
  <h1>Node API Skeleton <img src="https://cdn.iconscout.com/icon/free/png-256/typescript-1174965.png" width="25" height="25" /></h1>
</div>

<p>This is a repository meant to serve as a starting point if you want to start a TypeScript express API project with some common features already set up and best practices.</p>
</div>

## Status

[![Coverage Status](https://img.shields.io/coverallsCoverage/github/Proskynete/node-api-skeleton?logo=Coveralls)](https://coveralls.io/github/Proskynete/node-api-skeleton?branch=master) [![CI](https://img.shields.io/github/actions/workflow/status/Proskynete/node-api-skeleton/ci.yml?logo=GithubActions&logoColor=fff)](https://github.com/Proskynete/node-api-skeleton/actions/workflows/ci.yml) [![GitHub issues](https://img.shields.io/github/issues/Proskynete/node-api-skeleton)](https://github.com/Proskynete/node-api-skeleton/issues) [![GitHub forks](https://img.shields.io/github/forks/Proskynete/node-api-skeleton)](https://github.com/Proskynete/node-api-skeleton/network) [![GitHub stars](https://img.shields.io/github/stars/Proskynete/node-api-skeleton)](https://github.com/Proskynete/node-api-skeleton/stargazers)  [![PRs welcome](https://img.shields.io/badge/PRs-welcome-green)](#CONTRIBUTING.md)

<details>
  <summary>Table of contents</summary>
  <ol>
    <li>
      <a href="#features">Features</a>
    </li>
    <li>
      <a href="#folder-structure">Folder structure</a>
    </li>
    <li>
      <a href="#how-to-use">How to use</a>
    </li>
    <li>
      <a href="#docker">Docker</a>
    </li>
    <li>
      <a href="#linting">Linting</a>
    </li>
    <li>
      <a href="#testing">Testing</a>
    </li>
    <li>
      <a href="#coveralls">Coveralls</a>
    </li>
  </ol>
</details>

<h2 id="features">⚙️ Features</h2>

- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [ts-node-dev](https://github.com/wclr/ts-node-dev)
- [Jest](https://jestjs.io/)
- [Cors](https://github.com/expressjs/cors)
- [Morgan](https://github.com/expressjs/morgan)
- [Helmet](https://helmetjs.github.io/)
- [Supertest](https://github.com/ladjs/supertest#readme)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/#/)
- [Github Actions](https://github.com/features/actions)
- [Docker](https://www.docker.com/)
- [Open API](https://swagger.io/specification/)

<p align="right"><a href="#top">🔝</a></p>

<h2 id="folder-structure">🗂️ Folder structure</h2>

    .
    ├── .github/
    │   └── workflows/
    │       ├── ci.yml          # Continuous integration workflow
    │       ├── coveralls.yml   # Coveralls workflow
    │       ├── lint.yml        # Linting workflow
    │       └── test.yml        # Testing workflow
    ├── .husky/                 # Husky configuration
    │   ├── pre-commit          # Pre-commit hook    
    │   └── pre-push            # Pre-push hook
    ├── coverage/               # Coverage report generated by Jest (folder is ignored by git)
    ├── dist/                   # Transpiler files (folder is ignored by git)
    ├── src/
    │   ├── controllers/        # Controllers define functions that respond to various http requests
    │   │   └── ...
    │   ├── models/             # Models define the structure
    │   │   └── ...
    │   ├── routes/             # Routes define the endpoints of the API
    │   │   ├── index.ts        # Index file that generates the prefix of the routes and imports all the routes
    │   │   └── ...
    │   ├── tools/              # Tools are used to generate the Open API documentation and health check
    │   │   └── ...
    │   ├── utils/              # Functions that are used in multiple places
    │   │   └── ...
    │   ├── app.ts              # Express app with middlewares and routes
    │   ├── config.ts           # Configuration file
    │   └── server.ts           # Server file that starts the app
    ├── test/
    │   ├── __mocks__/          # Mocks for tests
    │   └── ...                 # Tests
    └── ...

<p align="right"><a href="#top">🔝</a></p>

<h2 id="how-to-use">💪  How to use</h2>

You can use this repository as a template by clicking on the `Use this template` button on the top right of the repository page and select the `Create a new repository` option. This will create a new repository with the same files and history as this one.

```bash
# Install dependencies
npm install

# Set up environment variables and fill in the values
cp .env.example .env
code .env # or vim or whatever you prefer

# Set up coveralls repo token
cp .coveralls.example .coveralls.yml
code .coveralls.yml # or vim or whatever you prefer

# Run the development server
npm run dev

# Production build
npm run build

# Run the production server
npm start
```

<p align="right"><a href="#top">🔝</a></p>

<h2 id="docker">🐳 Docker</h2>

```bash
# Build the image
docker build -t {{some-name}} .

# Run the container
docker run -p 3000:3000 {{some-name}}
```

<p align="right"><a href="#top">🔝</a></p>

<h2 id="linting">🔦 Linting</h2>

```bash
# Run Linter
npm run lint

# Run Formatter
npm run lint:fix
```

> The linter will run automatically before every commit using [Husky](https://typicode.github.io/husky/).

<p align="right"><a href="#top">🔝</a></p>

<h2 id="testing">👾 Testing</h2>

```bash
# Run tests
npm run test

# Run tests and generate coverage report
npm run test:coverage

# Run coverage and send report to Coveralls
npm run test:coveralls
```

<p align="right"><a href="#top">🔝</a></p>

<h2 id="coveralls">📊 Coveralls</h2>

> If you have a coveralls account, and you have the project synchronized with coveralls, you can use it to generate the jest coverage and send it to coveralls.

The coverage report is generated by [Jest](https://jestjs.io/) and sent to [Coveralls](https://coveralls.io/) but first you need the `repo_token` variable in your `.coveralls.yml` file. The coverage report is generated automatically when you push to the repository, only if you have a coveralls repo token set up and a coveralls profile linked to your github account.

In case you do not want to use [Coveralls](https://coveralls.io/), you must do the following:

- Delete the `coveralls.yml` github action workflow file from the `.github/workflows` folder.
- Remove the `coveralls.example` file from the root of the project.
  - Remove the `.coveralls.yml` file if you have already created it.
- Remove the `test:coveralls` script from the `package.json` file.
  - Remove the `coveralls` package if you have already installed it.

<p align="right"><a href="#top">🔝</a></p>
