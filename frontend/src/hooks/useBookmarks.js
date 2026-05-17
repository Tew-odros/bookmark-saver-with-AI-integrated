import { useState, useEffect, useCallback } from 'react';
import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
  updateBookmark as apiUpdateBookmark
} from '../api/bookmarks';
import { useAuth } from '../context/AuthContext';

export const useBookmarks = (q = '', tag = '') => {
  const { token, user } = useAuth();
  const [bookmarks, setBookmarks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toasts, setToasts]         = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const fetchBookmarks = useCallback(async (isInitial = false) => {
    if (!token) return;
    try {
      if (isInitial) setLoading(true);
      const data = await getBookmarks(); 
      let filtered = data;
      if (q) filtered = filtered.filter(b => b.title.toLowerCase().includes(q.toLowerCase()) || b.url.toLowerCase().includes(q.toLowerCase()));
      if (tag) filtered = filtered.filter(b => b.tags?.some(t => t.name.toLowerCase().includes(tag.toLowerCase())));
      
      setBookmarks(filtered);
    } catch (err) {
      addToast('Failed to load bookmarks.', 'error');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [token, q, tag, addToast]);

  useEffect(() => {
    if (user && token) {
      // Only show full-screen skeleton on first load or when filters are empty to be safe
      const isInitial = bookmarks.length === 0 && !q && !tag;
      fetchBookmarks(isInitial);
    }
  }, [user, token, fetchBookmarks]);

  const addBookmark = useCallback(async ({ title, url, tags }) => {
    setSubmitting(true);
    try {
      const created = await createBookmark({ title, url, tags });
      setBookmarks((prev) => [created, ...prev]);
      addToast('Bookmark saved!', 'success');
      return true;
    } catch (err) {
      addToast(err?.response?.data?.error || 'Failed to add bookmark.', 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [addToast]);

  const editBookmark = useCallback(async (id, { title, url, tags }) => {
    try {
      const updated = await apiUpdateBookmark(id, { title, url, tags });
      setBookmarks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      addToast('Bookmark updated!', 'success');
      return true;
    } catch (err) {
      addToast(err?.response?.data?.error || 'Failed to update bookmark.', 'error');
      return false;
    }
  }, [addToast]);

  const removeBookmark = useCallback(async (id) => {
    setDeletingId(id);
    try {
      await deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      addToast('Bookmark deleted.', 'success');
    } catch (err) {
      addToast(err?.response?.data?.error || 'Failed to delete bookmark.', 'error');
    } finally {
      setDeletingId(null);
    }
  }, [addToast]);

  return {
    bookmarks,
    loading,
    submitting,
    deletingId,
    toasts,
    addBookmark,
    editBookmark,
    removeBookmark,
  };
};
