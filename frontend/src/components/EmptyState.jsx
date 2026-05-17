/**
 * EmptyState — shown when no bookmarks exist or no search results match.
 */
const EmptyState = ({ isSearch = false }) => (
  <div className="glass-card p-12 md:p-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto" aria-label={isSearch ? "No matching bookmarks" : "No bookmarks saved yet"}>
    <div className="w-16 h-16 rounded-xl bg-brand-bg flex items-center justify-center text-3xl mb-6" aria-hidden="true">
      {isSearch ? '🔍' : '🔖'}
    </div>
    <h3 className="text-xl font-bold text-brand-text mb-2">
      {isSearch ? 'No results found' : 'Your Vault is Empty'}
    </h3>
    <p className="text-sm text-brand-muted leading-relaxed max-w-xs mx-auto">
      {isSearch 
        ? "No bookmarks match your search or filter. Try using different keywords or clearing filters." 
        : "Start organizing your digital life by adding your first bookmark using the form above."}
    </p>
  </div>
);

export default EmptyState;
