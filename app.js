import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import usersRouter from './routes/user.js';
import cardRouter from './routes/card.js';
import { createUser, login } from './controllers/user.js';
import auth from './middlewares/auth.js';
import NotFoundError from './errors/NotFoundError.js';
import centralizedError from './middlewares/centralizedError.js';

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
mongoose.connect('mongodb://localhost:27017/mestodb')
  .catch((err) => {
    console.log(`Connection to database was failed with error ${err}`);
  });

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);
app.use('/users', usersRouter);
app.use('/cards', cardRouter);
app.all('*', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(centralizedError);

app.listen(PORT, () => {
  console.log(`App listen on PORT ${PORT}`);
});
