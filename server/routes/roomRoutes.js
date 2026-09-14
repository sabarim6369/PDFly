const express = require('express');
const { createRoom, joinRoom, getRoom } = require('../controllers/roomController');

const router = express.Router();

router.post('/', createRoom);
router.get('/:code', getRoom);
router.post('/:code/join', joinRoom);

module.exports = router;
