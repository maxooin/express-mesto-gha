import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { constants } from 'http2';
import usersRouter from './routes/user.js';
import cardRouter from './routes/card.js';

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/mestodb')
  .catch((err) => {
    console.log(`Connection to database was failed with error ${err}`);
  });

app.use((req, res, next) => {
  req.user = {
    _id: '63b4470f9f1d2866625c9a16',
  };
  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardRouter);
app.all('*', (req, res) => {
  res.status(constants.HTTP_STATUS_NOT_FOUND)
    .send({ message: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`App listen on PORT ${PORT}`);
});
