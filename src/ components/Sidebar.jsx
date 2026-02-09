export default function Sidebar({ children, onAdd, theme, toggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Заметки</span>
        <div>
          <button className="button" onClick={toggleTheme}>
            🌗
          </button>
          <button className="button" onClick={onAdd}>
            ＋
          </button>
        </div>
      </div>
      {children}
    </aside>
  );
}
