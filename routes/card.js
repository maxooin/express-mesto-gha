import { Router } from 'express';

import {
  createCard,
  deleteCard,
  dislikeCard,
  getAllCards,
  likeCard,
} from '../controllers/card.js';

const cardRouter = Router();

cardRouter.get('/', getAllCards);
cardRouter.delete('/:cardId', deleteCard);
cardRouter.post('/', createCard);
cardRouter.put('/:cardId/likes', likeCard);
cardRouter.delete('/:cardId/likes', dislikeCard);

export default cardRouter;
