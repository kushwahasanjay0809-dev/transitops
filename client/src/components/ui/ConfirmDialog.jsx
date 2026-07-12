export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>{title || 'Are you sure?'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {message || 'This action cannot be undone.'}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16 }} />
                Deleting...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
