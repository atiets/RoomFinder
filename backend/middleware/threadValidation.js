// middleware/threadValidation.js
const { check } = require('express-validator');

exports.validateThread = [
  check('title')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Tiêu đề là bắt buộc')
    .isLength({ max: 200 })
    .withMessage('Tiêu đề không được vượt quá 200 ký tự'),
  
  check('content')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Nội dung là bắt buộc'),
  
  check('tags')
    .optional()
    .isArray()
    .withMessage('Tags phải là một mảng')
    .custom((tags) => {
      if (tags && tags.length > 5) {
        throw new Error('Không được thêm quá 5 tags');
      }
      return true;
    })
];