import dotenv from 'dotenv';
import { constants } from 'http2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import BadRequestError from '../errors/BadRequestError.js';

dotenv.config();

const {
  NODE_ENV,
  JWT_SECRET,
} = process.env;

export function getUsers(req, res) {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: 'На сервере произошла ошибка.' }));
}

function findUserById(id, res, next) {
  User.findById(id)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(`Пользователь с указанным _id=${id} не найден.`);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`Переданы некорректные данные: _id=${id} при запросе информации о пользователе.`));
      } else {
        next(err);
      }
    });
}

export function getUserById(req, res, next) {
  findUserById(req.params.userId, res, next);
}

export function getMe(req, res, next) {
  findUserById(req.user._id, res, next);
}

export function createUser(req, res) {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      const userOutOfPassword = user.toObject();
      delete userOutOfPassword.password;
      res.send(userOutOfPassword);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: `Переданны некорректные данные при создании карточки: ${Object.values(err.errors)[0].message}` });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка.' });
      }
    });
}

export function updateUserInfo(req, res) {
  const {
    name,
    about,
  } = req.body;
  User.findByIdAndUpdate(req.user._id, {
    name,
    about,
  }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND)
          .send({ message: `Пользователь c указанным _id=${req.user._id} не найден.` });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные при обновлении пользователя.' });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка.' });
      }
    });
}

export function updateUserAvatar(req, res) {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND)
          .send({ message: `Пользователь c указанным _id=${req.user._id} не найден.` });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка.' });
      }
    });
}

export function login(req, res, next) {
  const {
    email,
    password,
  } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.send({ token });
    })
    .catch(() => {
      next(new UnauthorizedError('Передан неверный логин или пароль'));
    });
}
