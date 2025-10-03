import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer,toast } from "react-toastify";

const TeacherCodeEditor = ({ levelId, termId, topicId}) => {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [lines, setLines] = useState(["1"]);
  const [codes, setCodes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeName, setCodeName] = useState("");
  const [selectedCodeId, setSelectedCodeId] = useState(null);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teacher/fetch-codes`,
        {
          params: { courseId: levelId, termId, topicId },
          headers: { Authorization: `${sessionStorage.getItem('token')}` },
        }
      );
      setCodes(response.data.codes);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch codes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Props:", { levelId, termId, topicId, });
    fetchCodes();
  }, []);

  // Handle code submission
  const handleSave = async () => {
    const code = editorRef.current.innerText;
    if (!code.trim()) {
      toast.error("Please enter some code before saving.");
      return;
    }
    if (!codeName.trim()) {
      toast.error("Please enter a name for your code.");
      return;
    }

    try {
      const response = await axios.post(
        `/api/teacher/store-code`,
        { 
          courseId: levelId, 
          termId, 
          topicId, 
          code,
          name: codeName.trim(),
          programId: selectedCodeId
        },
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
          },
        }
      );

      // Wait for the new code to be stored before fetching updated codes
      await fetchCodes();
      
      toast.success(response.data.message);
      setCodeName("");
      setSelectedCodeId(null);
      handleClear();
    } catch (error) {
      console.error("Failed to save code:", error);
      toast.error(error.response?.data?.message || "Failed to save code");
    }
  };

  // Handle date selection from dropdown
  const handleCodeSelect = (e) => {
    const selectedId = e.target.value;
    const selectedCode = codes.find(code => code._id === selectedId);
    
    if (selectedCode) {
      editorRef.current.innerText = selectedCode.code;
      setCodeName(selectedCode.name || "");
      setSelectedCodeId(selectedCode._id);
      updateLineNumbers();
    } else {
      editorRef.current.innerText = "";
      setCodeName("");
      setSelectedCodeId(null);
      setLines(["1"]);
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    updateLineNumbers();
  };

  // Handle input event
  const handleInput = () => {
    updateLineNumbers();
  };

  // Update line numbers
  const updateLineNumbers = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      const lineCount = text.split("\n").length || 1;
      setLines(Array.from({ length: lineCount }, (_, i) => (i + 1).toString()));
    }
  };

  // Clear the editor
  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      setLines(["1"]);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <ToastContainer />
      <div className="w-[70vw] h-[85vh] bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-gray-700">Code Editor</h2>
          <div className="flex items-center space-x-2">
          <select
              value={selectedCodeId || ""}
              onChange={handleCodeSelect}
              className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              <option value="">Select a saved code</option>
              {codes.map((code) => (
                <option key={code._id} value={code._id}>
                  {code.name || new Date(code.dateSubmitted).toLocaleString()}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              placeholder="Name"
              required
              className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-800 transition"
            >
              {selectedCodeId ? "Update" : "Save"}
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
          className="flex h-[calc(85vh-64px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
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
            className="py-3 px-6 w-full text-gray-800 text-lg font-mono outline-none transition-all whitespace-pre-wrap"
            id="editor"
            style={{ lineHeight: "24px", minHeight: "100%", caretColor: "black" }}
            placeholder="Start typing or paste here..."
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCodeEditor;