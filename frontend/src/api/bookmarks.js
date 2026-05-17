import axios from 'axios';

/** Base Axios instance — uses Vite proxy so no cross-origin issues in dev */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem('bt_token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/**
 * Fetch all bookmarks from the API.
 * @returns {Promise<Array>} Array of bookmark objects
 */
export const getBookmarks = async () => {
  const { data } = await api.get('/bookmarks');
  return data.data;
};

/**
 * Create a new bookmark.
 * @param {{ title: string, url: string }} payload
 * @returns {Promise<Object>} The created bookmark object
 */
export const createBookmark = async (payload) => {
  const { data } = await api.post('/bookmarks', payload);
  return data.data;
};

/**
 * Delete a bookmark by ID.
 * @param {number} id
 * @returns {Promise<Object>} The deleted bookmark object
 */
export const deleteBookmark = async (id) => {
  const { data } = await api.delete(`/bookmarks/${id}`);
  return data.data;
};

/**
 * Update a bookmark.
 */
export const updateBookmark = async (id, payload) => {
  const { data } = await api.put(`/bookmarks/${id}`, payload);
  return data.data;
};
