import { Request, Response, NextFunction } from 'express';

import { errorResponse } from './global';

export const graphVerify = (
  req: Request,
  resp: Response,
  next: NextFunction
): void => {
  const { githubRepo, entryFile } = req.query;
  if (!githubRepo || !entryFile) {
    resp.status(400).send({
      error: true,
      message: 'Provide non empty values',
    } as errorResponse);
  } else {
    next();
  }
};
