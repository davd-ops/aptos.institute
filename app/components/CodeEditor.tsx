import React, { useRef } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";

interface CodeEditorProps {
  defaultCode: string;
  correctCode?: string;
  isReadOnly?: boolean;
  onChange?: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  defaultCode,
  isReadOnly = false,
  onChange,
}) => {
  const monacoRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true, // Disable semantic errors
      noSyntaxValidation: true, // Disable syntax errors
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true, // This allows non-TS code to work smoothly
    });
  };

  const handleEditorDidMount: OnMount = (editor) => {
    monacoRef.current = editor;
  };

  return (
    <Editor
      height="300px"
      defaultLanguage="typescript"
      theme="vs-dark"
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      value={defaultCode}
      options={{
        readOnly: isReadOnly,
        minimap: { enabled: false },
        lineNumbers: "on",
        scrollBeyondLastLine: false,
      }}
      onChange={(value) => onChange?.(value ?? "")}
    />
  );
};

export default CodeEditor;
