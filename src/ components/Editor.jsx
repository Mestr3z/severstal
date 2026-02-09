import { useEffect, useRef } from "react";

export default function Editor({ note, onChange }) {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && note) {
      editorRef.current.innerHTML = note.content || "";
    }
  }, [note?.id]);

  if (!note) return null;

  const saveContent = () => {
    onChange(note.id, { content: editorRef.current.innerHTML });
  };

  const preventFocusLoss = (e) => {
    e.preventDefault();
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const exec = (command) => {
    document.execCommand(command);
    editorRef.current.focus();
    saveSelection();
    saveContent();
  };

  const getCurrentFontSize = (node) => {
    if (!node) return 16;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const size = window.getComputedStyle(node).fontSize;
      return parseInt(size, 10) || 16;
    }
    return getCurrentFontSize(node.parentElement);
  };

  const applyFontSizeToSelection = (delta) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const baseNode = range.startContainer.parentElement;
    const currentSize = getCurrentFontSize(baseNode);
    const newSize = Math.max(12, Math.min(32, currentSize + delta));

    const content = range.extractContents();
    const span = document.createElement("span");
    span.style.fontSize = `${newSize}px`;
    span.appendChild(content);

    range.insertNode(span);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    editorRef.current.focus();
    saveSelection();
    saveContent();
  };

  const openImagePicker = () => {
    editorRef.current.focus();
    saveSelection();
    fileRef.current?.click();
  };

  const insertImageAtCursor = (src, alt = "") => {
    editorRef.current.focus();

    restoreSelection();

    const selection = window.getSelection();
    if (!selection) return;

    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;

    if (selection.rangeCount === 0) {
      editorRef.current.appendChild(img);
    } else {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);

      const after = document.createRange();
      after.setStartAfter(img);
      after.collapse(true);
      selection.removeAllRanges();
      selection.addRange(after);
      savedRangeRef.current = after.cloneRange();
    }

    saveContent();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      insertImageAtCursor(reader.result, file.name || "image");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    editorRef.current.focus();
    saveSelection();

    const reader = new FileReader();
    reader.onload = () => {
      insertImageAtCursor(reader.result, file.name || "image");
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="toolbar">
        <button
          className="tool-button"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("bold")}
        >
          B
        </button>
        <button
          className="tool-button"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("italic")}
        >
          I
        </button>
        <button
          className="tool-button"
          onMouseDown={preventFocusLoss}
          onClick={() => exec("underline")}
        >
          U
        </button>

        <select
          className="tool-select"
          value={note.fontFamily || "system"}
          onChange={(e) => onChange(note.id, { fontFamily: e.target.value })}
        >
          <option value="system">System</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
        </select>

        <button
          className="tool-button"
          onMouseDown={preventFocusLoss}
          onClick={() => applyFontSizeToSelection(-2)}
        >
          A-
        </button>
        <button
          className="tool-button"
          onMouseDown={preventFocusLoss}
          onClick={() => applyFontSizeToSelection(2)}
        >
          A+
        </button>

        <button
          className="tool-button"
          onMouseDown={preventFocusLoss}
          onClick={openImagePicker}
          title="Вставить картинку"
        >
          🖼
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>

      <div
        ref={editorRef}
        className="editor"
        contentEditable
        style={{
          fontFamily:
            note.fontFamily === "system" ? "system-ui" : note.fontFamily,
        }}
        onInput={() => {
          saveSelection();
          saveContent();
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onBlur={saveSelection}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        data-placeholder="Начните писать..."
      />
    </>
  );
}
