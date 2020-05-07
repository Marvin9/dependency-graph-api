import { exec, execSync } from 'child_process';
import { Router } from 'express';
import { Clone } from 'nodegit';
import * as path from 'path';
import * as url from 'url';

import { errorResponse, reposDirectory, successResponse } from '../global';
import { graphVerify } from '../utils';

// MAIN LOGIC
import { generateGraph } from '../../lib';

const graphAPI: Router = Router();

/**
 * Steps API follows:
 * 1. Get repo & username. [to create unique folder]
 * 2. Clone repo
 * 3. Generate graph
 */
graphAPI.get('/graph', graphVerify, (req, resp) => {
  const { githubRepo, entryFile } = req.query;

  const parsedUrl = url.parse(githubRepo as string);

  if (!parsedUrl || !parsedUrl.pathname) {
    resp.status(400).send({
      error: true,
      message: 'Invalid url of repository',
    } as errorResponse);
    return;
  }

  const { pathname } = parsedUrl;

  // pathname => /username/repoName
  const [username, repoName] = pathname.slice(1).split('/');
  const uniqueFolderName = `${username}_${repoName}`;

  // where repo should be cloned
  const folderPath = `${reposDirectory}/${uniqueFolderName}`;
  // remove folder first if already exist.
  // folder is deleted once response is successfully sent. but in worst case it may not.
  execSync(`rm -rf ${folderPath}`);
  Clone.clone(githubRepo as string, path.resolve(process.cwd(), folderPath))
    .then(() => {
      const dependencyGraph: any = generateGraph(
        path.resolve(process.cwd(), folderPath),
        entryFile as string
      );

      if (!dependencyGraph) {
        resp.status(400).send({
          error: true,
          message: 'Error while generating graph',
        } as errorResponse);
        return;
      }

      Object.keys(dependencyGraph).forEach((key) => {
        dependencyGraph[key] = Array.from(dependencyGraph[key]);
      });

      // FINALLY SEND AS RESPONSE
      resp.send({
        error: false,
        data: dependencyGraph,
      } as successResponse);

      // REMOVE FOLDER
      exec(`rm -rf ${folderPath}`);
    })
    .catch(() => {
      resp.status(400).send({
        error: true,
        message: 'Internal error.',
      } as errorResponse);
    });
});

export default graphAPI;
