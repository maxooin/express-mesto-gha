import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [2, 'поле имя [{VALUE}] содержит менее 2 символов'],
    maxLength: [30, 'поле имя [{VALUE}] содержит более 30 символов'],
    required: [true, 'поле имя не заполнено'],
  },
  link: {
    type: String,
    required: [true, 'поле ссылки на картинку не заполнено'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model('card', cardSchema);
