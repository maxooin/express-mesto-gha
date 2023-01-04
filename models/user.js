import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [2, 'поле имя [{VALUE}] содержит менее 2 символов'],
    maxlength: [30, 'поле имя [{VALUE}] содержит более 30 символов'],
    required: [true, 'поле имя не заполнено'],
  },
  about: {
    type: String,
    minlength: [2, 'поле о пользователе [{VALUE}] содержит менее 2 символов'],
    maxlength: [30, 'поле о пользователе [{VALUE}] содержит более 30 символов'],
    required: [true, 'поле о пользователе не заполнено'],
  },
  avatar: {
    type: String,
    required: [true, 'поле ссылка на аватар не заполнено'],
  },
});

export default mongoose.model('user', userSchema);
