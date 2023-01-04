import { constants } from 'http2';
import Card from '../models/card.js';

export function getAllCards(req, res) {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: 'На сервере произошла ошибка' }));
}

export function createCard(req, res) {
  const {
    name,
    link,
  } = req.body;
  Card.create({
    name,
    link,
    owner: req.user._id,
  })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Переданны некорректные данные при создании карточки' });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
}

export function deleteCard(req, res) {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND)
          .send({ message: `Карточка по указанному id=${req.params.cardId} не найден.` });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: `Переданы некорректные данные: id=${req.params.cardId} для удаления карточки.` });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка.' });
      }
    });
}

export function likeCard(req, res) {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND)
          .send({ message: `Передан несуществующий id=${req.params.cardId} карточки.` });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: `Переданы некорректные данные: id=${req.params.cardId} для постановки лайка.` });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка.' });
      }
    });
}

export function dislikeCard(req, res) {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        res.status(constants.HTTP_STATUS_NOT_FOUND)
          .send({ message: `Передан несуществующий id=${req.params.cardId} карточки.` });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: `Переданы некорректные данные: id=${req.params.cardId} для снятия лайка.` });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'На сервере произошла ошибка.' });
      }
    });
}
