const express = require('express');
const router = express.Router();
const {
  getAllBookmarks,
  createBookmark,
  deleteBookmark,
  updateBookmark,
} = require('../controllers/bookmarkController');

/**
 * @route   GET /api/bookmarks
 * @desc    Fetch all bookmarks
 * @access  Private
 */
router.get('/', getAllBookmarks);

/**
 * @route   POST /api/bookmarks
 * @desc    Create a new bookmark
 * @access  Private
 */
router.post('/', createBookmark);

/**
 * @route   DELETE /api/bookmarks/:id
 * @desc    Delete a bookmark by ID
 * @access  Private
 */
router.delete('/:id', deleteBookmark);

/**
 * @route   PUT /api/bookmarks/:id
 * @desc    Update a bookmark
 * @access  Private
 */
router.put('/:id', updateBookmark);

module.exports = router;
