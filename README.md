# dependency-graph-api 🕸️

Dependency graph generator for imports.

Demo of github.com/Marvin9/hackernews-stories.

![demo](./recorded.svg)

- ### Install

  `npm i`

- ### Start

  `npm start`

- ### API

  `http://localhost:3000/graph?githubRepo=https://github.com/Marvin9/GTU-Petetion&entryFile=src/index.js`

  - **_Request_**
    <br />

  | query      | description                                           | valid                |
  | ---------- | ----------------------------------------------------- | -------------------- |
  | githubRepo | Repository URL of github.                             |
  | entryFile  | Index file from where you want graph to be generated. | .ts, .tsx, .js, .jsx |

  - **_Response_**
    <br />

  | title   | payload                                   | types                                                |
  | ------- | ----------------------------------------- | ---------------------------------------------------- |
  | error   | `{ error: true, message: Error Message }` | error: boolean, message: string                      |
  | success | `{ error: false, data: dependencyGraph }` | error: boolean, data: `{[source: string]: string[]}` |
