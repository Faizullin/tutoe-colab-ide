"use client";

import MediaLibraryNiceDialog from "@/components/attachment/media-gallery/media-library-nice-dialog";
import TiptapEditor, {
  TiptapEditorRef,
} from "@/components/tt-rich-editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Attachment } from "@/generated/prisma";
import { useControlledToggle } from "@/hooks/use-controlled-toggle";
import { showComponentNiceDialog } from "@/lib/nice-dialog";
import { documentIdValidator } from "@/lib/schema";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AdminPostDetailRouterOutputs } from "./types";

const postFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z
    .string()
    .min(3, { message: "Project slug must be at least 3 characters." })
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase and can only contain letters, numbers, and hyphens.",
    }),
  index: z
    .number()
    .int()
    .min(0, { message: "Index must be a non-negative integer." })
    .nullable()
    .optional(),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  thumbnailImageId: documentIdValidator().nullable().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

function ImageField({ value, onChange }: { value: Attachment["id"] | null, onChange: (id: Attachment["id"] | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const loadQuery = trpc.attachment.adminDetail.useQuery(value!, {
    enabled: !!value,
  });

  const handleOpenMediaDialog = useCallback(() => {
    showComponentNiceDialog<{
      record: Attachment;
      reason?: string;
    }>(MediaLibraryNiceDialog, {
      args: {
        objectType: "Post",
      },
    }).then((result) => {
      if (result?.result.record) {
        const image = result.result.record;
        if (image) {
          const url = image.url;
          setPreview(url);
          onChange(image.id);
        }
      }
    });
  }, [onChange]);

  useEffect(() => {
    if (loadQuery.data) {
      setPreview(loadQuery.data?.url || null);
    } else {
      setPreview(null);
    }
  }, [loadQuery.data,]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Image</label>
      <div
        className="w-40 h-40 border border-dashed border-border rounded flex items-center justify-center cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
        onClick={handleOpenMediaDialog}
        style={{ overflow: 'hidden' }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="object-cover w-full h-full" />
        ) : (
          <span className="text-muted-foreground">Click to select image</span>
        )}
      </div>
    </div>
  );
}

export function PostFormView({ initialData }: { initialData?: AdminPostDetailRouterOutputs | null }) {
  const trpcUtils = trpc.useUtils();
  const router = useRouter();
  const isEditMode = !!initialData; // Determine if in edit mode

  const defaultValues: PostFormValues = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    slug: initialData?.slug || "",
    index: initialData?.index ?? null,
    thumbnailImageId: initialData?.thumbnailImageId || null,
  };

  const editorRef = useRef<TiptapEditorRef>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: defaultValues, // Use defaultValues initially
    mode: "onSubmit",
  });

  // tRPC Mutations
  const createPostMutation = trpc.post.adminCreate.useMutation({
    onSuccess: (response) => {
      toast.success(`Post "${response.post.title}" created successfully!`);
      form.reset(defaultValues);
      trpcUtils.post.adminDetail.invalidate();
      router.push(`/dashboard/posts/${response.post.id}`);
    },
    onError: (error) => {
      toast.error(`Error creating post: ${error.message}`);
    },
  });

  const updatePostMutation = trpc.post.adminUpdate.useMutation({
    onSuccess: (response) => {
      toast.success(`Post "${response.post.title}" updated successfully!`);
      // After update, reset the form with the new data to mark it as "clean" again
      form.reset({
        title: response.post.title,
        content: response.post.content || "",
        slug: response.post.slug,
        index: response.post.index ?? null,
        thumbnailImageId: response.post.thumbnailImageId || null,
      });
      trpcUtils.post.adminDetail.invalidate();
    },
    onError: (error) => {
      toast.error(`Error updating post: ${error.message}`);
    },
  });

  const isSubmitting =
    createPostMutation.isPending || updatePostMutation.isPending;
  const canSubmit = form.formState.isDirty && !isSubmitting;

  function onSubmit(values: PostFormValues) {
    if (isEditMode) {
      if (!initialData?.id) {
        toast.error("Error: Post ID is missing for update.");
        return;
      }
      updatePostMutation.mutate({
        id: initialData.id,
        ...values,
      });
    } else {
      createPostMutation.mutate(values);
    }
  }

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content || "",
      });
    } else {
      form.reset({ title: "", content: "" });
    }
  }, [initialData, form]);

  const controlledToggle = useControlledToggle({
    defaultValue: false,
  });

  useEffect(() => {
    // Reset the editor content when the infoCard changes
    if (editorRef.current && controlledToggle.value && initialData) {
      // const instance = editorRef.current.getInstance()!;
      const conv = (data: any): string => {
        if (!data) return "";
        // const ext = instance.extensionManager.extensions;
        let html: string = "";
        try {
          html = data;
        } catch {
          toast.error("Error parsing content data. Please check the format.");
          html = `<p>Error parsing content data. Please check the format.</p><br />${data}`;
        }
        return html;
      };
      form.setValue("content", conv(initialData.content));
    }
  }, [controlledToggle.value, form, initialData]);


  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {isEditMode ? `Edit Post [#${initialData.id}]["${initialData.slug}"]` : "Create Post"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Image Field */}
            <FormField
              control={form.control}
              name="thumbnailImageId"
              render={({ field }) => (
                <ImageField value={field.value || null} onChange={field.onChange} />
              )}
            />
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="my-awesome-project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="index"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Index</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Index (optional)"
                        value={field.value ?? ""}
                        onChange={e =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter post content"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Controller
              control={form.control}
              name={"content"}
              render={({ field }) => (
                <div className="tiptap-content">
                  <TiptapEditor
                    ref={(ref) => {
                      const instance = ref?.getInstance();
                      if (instance && !editorRef.current) {
                        editorRef.current = ref;
                        let data: any = "";
                        try {
                          data = field.value
                        } catch {
                          toast.error(
                            "Error parsing content data. Please check the format."
                          );
                          data = `<p>Error parsing content data. Please check the format.</p><br />${field.value}`;
                        }
                        instance.commands.setContent(data);
                        controlledToggle.setTrue();
                      }
                    }}
                    ssr={true}
                    output="html"
                    placeholder={{
                      paragraph: "Type your content here...",
                      imageCaption: "Type caption for image (optional)",
                    }}
                    contentMinHeight={256}
                    contentMaxHeight={640}
                    onContentChange={field.onChange}
                    initialContent={field.value}
                  />
                </div>
              )}
            />
            <div className="flex justify-start gap-4">
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Post"}
              </Button>
              {initialData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    router.push(`/posts/${initialData.slug}`);
                  }}
                >
                  Preview
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
