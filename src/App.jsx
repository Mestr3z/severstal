import { useEffect, useState } from "react";
import Sidebar from "./ components/Sidebar";
import NotesList from "./ components/NotesList";
import Editor from "./ components/Editor";
import "./App.css";

const STORAGE_KEY = "notes:data";

export default function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: Date.now(),
            title: "Первая заметка",
            content: "Моя первая заметка",
            fontSize: 16,
            fontFamily: "system",
          },
        ];
  });

  const [activeId, setActiveId] = useState(notes[0].id);
  const [theme, setTheme] = useState("dark");

  const activeNote = notes.find((n) => n.id === activeId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const updateNote = (id, patch) => {
    setNotes((notes) =>
      notes.map((n) => (n.id === id ? { ...n, ...patch } : n))
    );
  };

  const addNote = () => {
    const note = {
      id: Date.now(),
      title: "",
      content: "",
      fontSize: 16,
      fontFamily: "system",
    };

    setNotes((n) => [note, ...n]);
    setActiveId(note.id);
  };

  const deleteNote = (id) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== id);

      if (filtered.length === 0) {
        const newNote = {
          id: Date.now(),
          title: "",
          content: "",
          fontSize: 16,
          fontFamily: "system",
        };

        setActiveId(newNote.id);
        return [newNote];
      }

      if (id === activeId) {
        setActiveId(filtered[0].id);
      }

      return filtered;
    });
  };

  return (
    <div className="app">
      <Sidebar
        theme={theme}
        toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onAdd={addNote}
      >
        <NotesList
          notes={notes}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={deleteNote}
          onTitleChange={updateNote}
        />
      </Sidebar>

      <main className="main">
        {activeNote && <Editor note={activeNote} onChange={updateNote} />}
      </main>
    </div>
  );
}
