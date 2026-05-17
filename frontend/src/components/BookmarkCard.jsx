import { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Copy, 
  Edit3, 
  ExternalLink, 
  Trash2, 
  Check,
  Calendar,
  Tag
} from 'lucide-react';

const getFaviconUrl = (url) => {
  try {
    const { origin } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=64`;
  } catch {
    return null;
  }
};

const getInitial = (title) => (title?.[0] ?? '?').toUpperCase();

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
};

const BookmarkCard = ({ bookmark, onDelete, isDeleting, onEdit }) => {
  const { id, title, url, createdAt, tags } = bookmark;
  const faviconUrl = getFaviconUrl(url);
  const [imgFailed, setImgFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setIsMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    onEdit(bookmark);
    setIsMenuOpen(false);
  };

  return (
    <article className="glass-card p-5 h-full flex flex-col group relative overflow-visible transition-all duration-500" aria-label={`Bookmark: ${title}`}>
      {/* Three-dot menu */}
      <div className="absolute top-3 right-3 z-20" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-brand-bg text-brand-muted hover:text-brand-text transition-all active:scale-90"
          aria-label="Actions"
        >
          <MoreVertical size={18} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-lg bg-brand-surface p-1 shadow-xl border border-brand-border animate-in fade-in zoom-in-95 duration-200 z-30">
            <button 
              onClick={handleCopy}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-brand-bg text-brand-text/80 hover:text-brand-text transition-all text-sm font-medium"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-brand-muted" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button 
              onClick={handleEdit}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-brand-bg text-brand-text/80 hover:text-brand-text transition-all text-sm font-medium"
            >
              <Edit3 size={14} className="text-brand-muted" />
              Edit Details
            </button>
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-brand-bg text-brand-text/80 hover:text-brand-text transition-all text-sm font-medium"
            >
              <ExternalLink size={14} className="text-brand-muted" />
              Visit Site
            </a>
            <div className="h-px bg-brand-border my-1" />
            <button 
              onClick={() => {
                if (showDeleteConfirm) {
                  onDelete(id);
                  setIsMenuOpen(false);
                } else {
                  setShowDeleteConfirm(true);
                }
              }}
              disabled={isDeleting}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all text-sm font-medium disabled:opacity-50 ${showDeleteConfirm ? 'bg-red-50 text-red-600' : 'hover:bg-red-50 text-red-500/80 hover:text-red-600'}`}
            >
              <Trash2 size={14} />
              <span className="truncate">
                {isDeleting ? 'Deleting...' : showDeleteConfirm ? 'Confirm?' : 'Delete'}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="shrink-0">
          {!imgFailed && faviconUrl ? (
            <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center p-2">
              <img
                src={faviconUrl}
                alt=""
                className="w-full h-full object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all"
                onError={() => setImgFailed(true)}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center text-sm font-bold text-brand-muted">
              {getInitial(title)}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-base font-semibold text-brand-text truncate leading-tight group-hover:text-brand-accent transition-colors" title={title}>
            {title}
          </h3>
          <p className="text-xs text-brand-muted truncate mt-0.5">
            {new URL(url).hostname}
          </p>
        </div>
      </div>

      {bookmark.summary && (
        <div className="mb-6 flex-1">
          <p className="text-[13px] text-brand-text/70 leading-relaxed break-words whitespace-pre-wrap">
            {bookmark.summary}
          </p>
        </div>
      )}

      <div className="mt-auto space-y-4">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <span key={t.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-bg text-brand-muted uppercase tracking-wider border border-brand-border">
                {t.name}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-brand-border flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-brand-muted uppercase tracking-tight">
            <Calendar size={10} />
            {formatDate(createdAt)}
          </div>
          
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-bold text-brand-accent uppercase tracking-wider hover:underline"
          >
            Visit
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </article>
  );
};

export default BookmarkCard;
