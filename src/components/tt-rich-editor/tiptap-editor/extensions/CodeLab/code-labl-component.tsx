import * as React from 'react';

interface CodeLabComponentProps {
  id: string;
}

export const CodeLabComponent: React.FC<CodeLabComponentProps> = ({ id }) => {
  // You can fetch more details about the CodeLab here if needed
  return (
    <div className="tiptap-codelab-block border rounded p-4 bg-muted">
      <strong>CodeLab:</strong> {id}
    </div>
  );
};
