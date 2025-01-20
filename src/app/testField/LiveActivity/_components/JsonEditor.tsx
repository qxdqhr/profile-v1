import { Editor } from "@monaco-editor/react";

interface JsonEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    error: string | null;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
    return (
        <div className="live-activity-editor-section">
            <label className="live-activity-form-group">
                <span className="live-activity-label">
                    Content State (JSON)
                </span>
                <div className="live-activity-editor-container">
                    <Editor
                        height="300px"
                        defaultLanguage="json"
                        value={value}
                        onChange={onChange}
                        options={{
                            minimap: { enabled: false },
                            formatOnPaste: true,
                            formatOnType: true,
                            automaticLayout: true
                        }}
                    />
                </div>
            </label>
            {error && (
                <div className="live-activity-error-message">
                    {error}
                </div>
            )}
        </div>
    );
} 