import { Project } from '@/generated/prisma';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeLabComponent, ProjectData } from './code-labl-component';

export interface CodeLabOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        codelab: {
            insertCodeLab: (projectObj: Project) => ReturnType;
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
            obj: {
                default: null as ProjectData | null,
            },
            // renderHTML: (value: any) =>
            //     value
            //         ? { 'data-obj': JSON.stringify(value) }
            //         : {},
            // parseHTML: (element: any) => {
            //     const raw = element.getAttribute('data-obj');
            //     return raw ? JSON.parse(raw) : null;
            // },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'div[data-codelab-id]',
                getAttrs: (node) => {
                    const raw = node.getAttribute('data-obj');
                    const dataObj = raw ? JSON.parse(raw) : null;
                    return {
                        obj: dataObj,
                    }
                },
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        const obj = HTMLAttributes.obj as ProjectData | null;
        return [
            'div',
            mergeAttributes(
                this.options.HTMLAttributes,
                {
                    'data-obj': JSON.stringify(obj),
                    'data-codelab-id': obj?.id || '',
                    class: 'tiptap-codelab-block',
                },
            ),
            `CodeLab: ${obj?.name ?? ''}`,
        ];
    },
    addCommands() {
        return {
            insertCodeLab:
                (project: Project) =>
                    ({ commands }) =>
                        commands.insertContent({
                            type: this.name,
                            attrs: {
                                obj: {
                                    id: project.id,
                                    name: project.name,
                                    slug: project.slug,
                                    description: project.description,
                                },
                            },
                        }),
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(CodeLabComponent);
    },
});
