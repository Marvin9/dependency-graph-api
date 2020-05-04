import * as express from 'express';

import graphAPI from './api/getGraph';

const app: express.Application = express.default();

app.use('/', graphAPI);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server runnning at PORT ${PORT}`);
});
