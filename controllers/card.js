import { constants } from 'http2';
import Card from '../models/card.js';
import NotFoundError from '../errors/NotFoundError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import BadRequestError from '../errors/BadRequestError.js';

export function getAllCards(req, res) {
  Card.find({})
    .populate(['owner', 'likes'])
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
    .then((result) => result.populate(['owner', 'likes']))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(constants.HTTP_STATUS_BAD_REQUEST)
          .send({ message: `Переданны некорректные данные при создании карточки: ${Object.values(err.errors)[0].message}` });
      } else {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
}

export function deleteCard(req, res, next) {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Данной карточки уже нет');
      } else if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Удаление не возможно. Вы не являетесь создателем данной карточки');
      } else {
        Card.findByIdAndRemove(req.params.cardId)
          .populate(['owner', 'likes'])
          .then((result) => {
            res.send(result);
          })
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданны некорректные данные'));
      } else {
        next(err);
      }
    });
}

export function likeCard(req, res) {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
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
    .populate(['owner', 'likes'])
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
