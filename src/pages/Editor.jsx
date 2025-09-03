import React, { useRef, useState, useEffect } from "react";

const TextEditor = () => {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [lines, setLines] = useState(["1"]);

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    updateLineNumbers();
  };

  const handleInput = () => {
    updateLineNumbers();
  };

  const updateLineNumbers = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      const lineCount = text.split("\n").length || 1;
      setLines(Array.from({ length: lineCount }, (_, i) => (i + 1).toString()));
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      setLines(["1"]);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 mb-5">
      {/* Space below navbar to avoid overlap */}
      <div className="mt-16 w-full max-w-[90%] md:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%] bg-white shadow-2xl rounded-lg overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-700">Code Editor</h2>
          <div className="space-x-2">
           
            <button
              onClick={() => console.log(editorRef.current.innerText)}
              className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-800 transition"
            >
              Save
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-800 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Editor Container with Single Scrollbar */}
        <div
          ref={editorContainerRef}
          className="flex h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
        >
          {/* Line Numbers */}
          <div className="w-12 text-gray-600 text-right pr-2 py-3">
            {lines.map((line) => (
              <div key={line} className="h-[24px] leading-[24px] text-sm">
                {line}
              </div>
            ))}
          </div>

          {/* Editable Text Area */}
          <div
            ref={editorRef}
            contentEditable
            spellCheck={false}
            onPaste={handlePaste}
            onInput={handleInput}
            className="py-3 px-6 w-full text-gray-800 text-lg font-mono outline-none  transition-all whitespace-pre-wrap"
            style={{ lineHeight: "24px", minHeight: "100%", caretColor: "black" }} // Ensures alignment
            placeholder="Start typing or paste here..."
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
