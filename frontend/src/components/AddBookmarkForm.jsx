import { useState, useEffect } from 'react';
import { Type, Link as LinkIcon, Tags, Plus, X, Save } from 'lucide-react';

const AddBookmarkForm = ({ onAdd, submitting, editData, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setUrl(editData.url);
      setTagsInput(editData.tags?.map(t => t.name).join(', ') || '');
    } else {
      setTitle('');
      setUrl('');
      setTagsInput('');
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const success = await onAdd({ title, url, tags }, editData?.id);
      if (success && !editData) {
        setTitle('');
        setUrl('');
        setTagsInput('');
      }
    }
  };

  return (
    <form className="glass-card p-6 md:p-8" onSubmit={handleSubmit} aria-label={editData ? 'Edit bookmark form' : 'Add bookmark form'}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center text-brand-accent">
          {editData ? <Plus className="rotate-45" size={20} /> : <Plus size={20} />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-text">
            {editData ? 'Edit Bookmark' : 'Add Bookmark'}
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            {editData ? 'Update your saved link' : 'Save a new resource to your vault'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-brand-text ml-1" htmlFor="input-title">
            Title
          </label>
          <input
            id="input-title"
            className="input-field"
            type="text"
            placeholder="e.g. GitHub"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-brand-text ml-1" htmlFor="input-url">
            URL
          </label>
          <input
            id="input-url"
            className="input-field"
            type="url"
            placeholder="https://github.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <label className="text-xs font-semibold text-brand-text ml-1">
          Tags
        </label>
        <input
          className="input-field"
          type="text"
          placeholder="coding, repo, tools..."
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="btn-primary px-8 flex items-center justify-center gap-2 transition-all"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : editData ? <Save size={16} /> : <Plus size={16} />}
          <span className="font-semibold text-sm">
            {submitting ? 'Saving...' : editData ? 'Save Changes' : 'Add to Vault'}
          </span>
        </button>
        {editData && (
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="btn-secondary px-6 flex items-center gap-2 transition-all"
          >
            <X size={16} />
            <span className="font-semibold text-sm">Cancel</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default AddBookmarkForm;
