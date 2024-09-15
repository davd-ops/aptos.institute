import React, { useRef, useState } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import { Box, Button, Text } from "@chakra-ui/react";
import * as monacoEditor from "monaco-editor";

const correctCode = `module Aptos::CreateAccount {

    struct Account has copy, drop {
        name: vector<u8>,
        age: u64
    }
    
    // Implement the create_account function
    public fun create_account(name: vector<u8>, age: u64): Account {
        Account { name, age } // Use the function parameters to initialize the struct
    }
}
`;

const defaultCode = `module Aptos::CreateAccount {

    struct Account has copy, drop {
        name: vector<u8>,
        age: u64
    }
    
    public fun create_account(name: vector<u8>, age: u64): Account {
        Account { } // Use the function parameters to initialize the struct
    }
}
`;

const CodeEditor: React.FC = () => {
  const monacoRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );

  const [userCode, setUserCode] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");

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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = editor;
  };

  const validateCode = () => {
    //Removing comments, whitespaces, new lines
    const normalizeCode = (code: string) =>
      code
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//gm, "")
        .replace(/\s+/g, "")
        .trim();

    const normalizedUserCode = normalizeCode(userCode);
    const normalizedCorrectCode = normalizeCode(correctCode);

    if (normalizedUserCode === normalizedCorrectCode) {
      setValidationMessage("Success! Your code is correct :)");
    } else {
      setValidationMessage("The code is inorrect :(");
    }
  };

  return (
    <Box>
      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        p={4}
        w="100%"
        h="500px"
      >
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={(value) => setUserCode(value || "")}
          defaultValue={defaultCode}
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
          }}
        />
      </Box>

      <Button mt={4} colorScheme="teal" onClick={validateCode}>
        Next
      </Button>

      {validationMessage && (
        <Text
          mt={4}
          color={validationMessage.includes("Success") ? "green" : "red"}
        >
          {validationMessage}
        </Text>
      )}
    </Box>
  );
};

export default CodeEditor;
