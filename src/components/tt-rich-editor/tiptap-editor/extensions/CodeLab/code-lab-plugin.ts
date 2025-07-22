import { Project } from '@/generated/prisma';
import { Node, mergeAttributes } from '@tiptap/core';

export interface CodeLabOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        codelab: {
            setCodeLab: (projectObj: Project) => ReturnType;
        };
    }
}

export const CodeLab = Node.create<CodeLabOptions>({
    name: 'codelab',
    group: 'block',
    atom: true,
    selectable: true,
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    addAttributes() {
        return {
            id: {
                default: null,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'div[data-codelab-id]',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-codelab-id': HTMLAttributes.id,
                class: 'tiptap-codelab-block',
            }),
            `CodeLab: ${HTMLAttributes.id}`,
        ];
    },
    addCommands() {
        return {
            setCodeLab: (projectObj: Project) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name, attrs: {
                        obj: {
                            id: projectObj.id,
                            name: projectObj.name,
                        }
                    }
                });
            },
        };
    },
});
