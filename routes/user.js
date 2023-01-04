import { Router } from 'express';

import {
  createUser,
  getUserById,
  getUsers,
  updateUserAvatar,
  updateUserInfo,
} from '../controllers/user.js';

const usersRouter = Router();

usersRouter.get('/', getUsers);
usersRouter.get('/:userId', getUserById);
usersRouter.post('/', createUser);
usersRouter.patch('/me', updateUserInfo);
usersRouter.patch('/me/avatar', updateUserAvatar);

export default usersRouter;
