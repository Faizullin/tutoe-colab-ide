import { EditorContent, type Editor } from "@tiptap/react";
import clsx from "clsx";
import {
  createContext,
  HTMLAttributes,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";
import useTiptapEditor, {
  type UseTiptapEditorOptions,
} from "../hooks/useTiptapEditor";

type TiptapContextType = {
  editor: Editor;
  contentElement: RefObject<HTMLDivElement>; // <-- Fix here
  isFullScreen: boolean;
  isResizing: boolean;
  isSourceMode: boolean;
  toggleFullScreen: () => void;
  toggleSourceMode: () => void;
  setIsResizing: (value: boolean) => void;
};

const TiptapContext = createContext<TiptapContextType>({} as TiptapContextType);
export const useTiptapContext = () => useContext(TiptapContext);

type TiptapProviderProps = {
  slotBefore?: ReactNode;
  slotAfter?: ReactNode;
  editorOptions: UseTiptapEditorOptions;
  editorProps?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};

export const TiptapProvider = ({
  children,
  editorOptions,
  slotBefore,
  slotAfter,
}: TiptapProviderProps) => {
  const contentElement = useRef<HTMLDivElement | null>(null);
  const editor = useTiptapEditor(editorOptions);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  if (!editor) {
    return null;
  }

  const focusEditorViaContainer = (event: React.MouseEvent) => {
    const target = event.target as Element;
    const content = contentElement.current;
    if (content && target.contains(content)) {
      content.style.display = "flex";
      setTimeout(() => {
        content.style.display = "";
      }, 0);
    }
  };

  const editorContent = (
    <div
      className={clsx("rte-editor", isFullScreen && "rte-editor--fullscreen")}
    >
      {slotBefore}
      <div
        className="rte-editor__container"
        onMouseDown={focusEditorViaContainer}
      >
        <EditorContent
          ref={contentElement}
          editor={editor}
          className="rte-editor__content"
        />
      </div>
      {children}
      {slotAfter}
    </div>
  );

  return (
    <TiptapContext.Provider
      value={{
        editor,
        contentElement: contentElement as RefObject<HTMLDivElement>,
        isFullScreen,
        isResizing,
        isSourceMode,
        setIsResizing,
        toggleFullScreen: () => setIsFullScreen((prev) => !prev),
        toggleSourceMode: () => setIsSourceMode((prev) => !prev),
      }}
    >
      {editorContent}
    </TiptapContext.Provider>
  );
};

export default TiptapProvider;
