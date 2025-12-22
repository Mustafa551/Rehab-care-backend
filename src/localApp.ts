import 'dotenv/config';
import { app } from './server';
import { connectDb } from './config/db';

const port = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(
        `⚙️ Server is running at port : localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.log('Database connection failed !!! ', err);
    process.exit(1);
  });

