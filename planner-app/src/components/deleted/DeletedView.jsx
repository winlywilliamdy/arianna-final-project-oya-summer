import { deletedAtLabel } from "../../lib/dates";

export default function DeletedView({ deletedTasks, onRestore, onPermanentDelete, onBack }) {
  return (
    <section className="view">
      <div className="wrap">
        <section className="bin-panel">
          <div className="bin-head">
            <div>
              <div className="bin-title">Deleted</div>
              <div className="bin-subtitle">Restore a task or delete it permanently.</div>
            </div>
            <button type="button" className="btn-ghost" onClick={onBack}>
              Back to Tasks
            </button>
          </div>
          <div className="cards">
            {deletedTasks.length === 0 ? (
              <p className="empty">No deleted tasks.</p>
            ) : (
              deletedTasks.map((task) => (
                <div key={task.id} className="bin-item">
                  <div>
                    <div className="bin-item-title">{task.title}</div>
                    <div className="bin-item-meta">Deleted {deletedAtLabel(task.deletedAt)}</div>
                  </div>
                  <div className="bin-actions">
                    <button type="button" className="btn-restore" onClick={() => onRestore(task.id)}>
                      Restore
                    </button>
                    <button
                      type="button"
                      className="btn-delete-forever"
                      onClick={() => onPermanentDelete(task.id)}
                    >
                      Delete forever
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
