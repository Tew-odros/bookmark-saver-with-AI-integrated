import { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './index.css';
import { useBookmarks } from './hooks/useBookmarks';
import { useAuth } from './context/AuthContext';
import AddBookmarkForm from './components/AddBookmarkForm';
import BookmarkCard from './components/BookmarkCard';
import EmptyState from './components/EmptyState';
import AuthScreen from './components/AuthScreen';
import Chatbot from './components/Chatbot';
import ConfirmModal from './components/ConfirmModal';

const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="skeleton-line h-icon" />
      <div className="skeleton-line h-title" />
    </div>
    <div className="skeleton-line h-url" />
    <div className="skeleton-line h-date" />
  </div>
);

const ToastContainer = ({ toasts }) => (
  <div className="fixed top-8 right-8 flex flex-col gap-3 z-[150] pointer-events-none" role="region" aria-live="polite">
    {toasts.map(({ id, message, type }) => (
      <div 
        key={id} 
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl glass-card pointer-events-auto animate-in slide-in-from-top-4 duration-500 ${type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}`} 
        role="alert"
      >
        <span className="text-xl" aria-hidden="true">{type === 'success' ? '✨' : '⚠️'}</span>
        <span className="text-sm font-semibold">{message}</span>
      </div>
    ))}
  </div>
);

function App() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedTag, setDebouncedTag] = useState('');

  const [editBookmark, setEditBookmark] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const formRef = useRef(null);

  // Sync debounced values to prevent excessive API calls and layout jumps
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedTag(tagFilter);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, tagFilter]);

  // Apply theme class to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const {
    bookmarks,
    loading,
    submitting,
    deletingId,
    toasts,
    addBookmark,
    editBookmark: apiEditBookmark,
    removeBookmark,
  } = useBookmarks(debouncedSearch, debouncedTag);

  // Reset logout confirmation when user changes (e.g., after logging back in)
  useEffect(() => {
    setShowLogoutConfirm(false);
  }, [user]);

  if (!user) {
    return <AuthScreen />;
  }

  const startEditing = (bookmark) => {
    setEditBookmark(bookmark);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddOrEdit = async (data, id) => {
    let success = false;
    if (id) {
      success = await apiEditBookmark(id, data);
      if (success) setEditBookmark(null);
    } else {
      success = await addBookmark(data);
    }
    return success;
  };

  return (
    <>
      <header className="glass-header shadow-2xl/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer transition-all active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-3xl shadow-inner group-hover:bg-brand-accent/30 transition-colors" aria-hidden="true">🔖</div>
            <span className="brand-name text-2xl font-black tracking-tighter gradient-text">BookmarkVault</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-accent transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden lg:flex flex-col items-end border-r border-brand-border pr-8">
              <span className="text-xs font-black text-brand-accent uppercase tracking-widest mb-1">Authenticated</span>
              <span className="text-sm font-medium text-brand-muted">{user.email}</span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="btn-secondary text-xs uppercase tracking-widest font-bold px-6 py-3 transition-all border-brand-border hover:border-brand-accent"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <section ref={formRef} className="mb-20 scroll-mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both">
          <AddBookmarkForm 
            onAdd={handleAddOrEdit} 
            submitting={submitting} 
            editData={editBookmark} 
            onCancelEdit={() => setEditBookmark(null)} 
          />
        </section>

        <div className="glass-card mb-12 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted/40 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Search by title or URL..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="input-field pl-14 py-4 text-base"
            />
          </div>
          <div className="relative w-full md:w-80">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted/40 text-xl">🏷️</span>
            <input 
              type="text" 
              placeholder="Filter by tag..." 
              value={tagFilter} 
              onChange={e => setTagFilter(e.target.value)} 
              className="input-field pl-14 py-4 text-base"
            />
          </div>
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse" aria-busy="true">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="animate-in fade-in zoom-in duration-1000 delay-300 fill-mode-both">
              <EmptyState isSearch={!!(search || tagFilter)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" role="list">
              {bookmarks.map((bm) => (
                <div key={bm.id} role="listitem">
                  <BookmarkCard
                    bookmark={bm}
                    onDelete={removeBookmark}
                    onEdit={startEditing}
                    isDeleting={deletingId === bm.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Sign Out"
        message="Are you sure you want to sign out? Your session will be ended."
        confirmText="Confirm Sign Out"
        cancelText="Cancel"
      />

      <ToastContainer toasts={toasts} />
      <Chatbot />
    </>
  );
}

export default App;
