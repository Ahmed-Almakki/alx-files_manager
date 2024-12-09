import express from 'express';
import router from './routes/index';

const app = express();
const PortListen = process.env.PORT || 5000;
app.use('/', router);

app.listen(PortListen, () => {
  console.log('Server running on port', PortListen);
});
