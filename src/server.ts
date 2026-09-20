import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
});
