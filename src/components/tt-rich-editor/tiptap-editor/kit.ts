import {
  CharacterCount,
  Color,
  Highlight,
  Image,
  ImageCaption,
  ImageFigure,
  Link,
  ListKeymap,
  Placeholder,
  Selection,
  StarterKit,
  Subscript,
  Superscript,
  Table,
  TextAlign,
  TextStyle,
  Underline,
  Youtube,
} from "./extensions";
import { CodeLab } from "./extensions/CodeLab/code-lab-plugin";
import SeparatorDivider from "./extensions/SeparatorDivider";

const ExtensionKit = [
  StarterKit.configure({
    horizontalRule: false,
    hardBreak: false,
  }),
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: true,
    placeholder: ({ editor, node }) => {
      const placeholder = (editor.options.editorProps as any)["placeholder"];
      switch (node.type.name) {
        case ImageCaption.name:
          return placeholder?.imageCaption;
        default:
          return placeholder?.paragraph;
      }
    },
  }),
  Selection,
  CharacterCount,
  Underline,
  Superscript,
  Subscript,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  ListKeymap,
  Link,
  Image,
  ImageFigure,
  Youtube,
  Table,
  SeparatorDivider,
  CodeLab,
];

export default ExtensionKit;
