export default function NotesList({
  notes,
  activeId,
  onSelect,
  onDelete,
  onTitleChange,
}) {
  return (
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-item ${note.id === activeId ? "active" : ""}`}
          onClick={() => onSelect(note.id)}
        >
          <input
            className="note-title-input"
            value={note.title}
            placeholder="Название заметки"
            onChange={(e) => onTitleChange(note.id, { title: e.target.value })}
          />
          <button
            className="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </>
  );
}
