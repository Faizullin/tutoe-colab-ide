"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Editor from "@monaco-editor/react"
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronRight,
    Code,
    Edit,
    File,
    FileText,
    Folder,
    ImageIcon,
    MoreHorizontal,
    Plus,
    Trash2,
    X
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project, ProjectFile } from "@/generated/prisma"
import { formatDate } from "@/lib/format"
import { languageOptions } from "@/utils/constants"
import { trpc } from "@/utils/trpc"
import { toast } from "sonner"

// Schema for project name form
const projectNameSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
})

// Schema for file editor form
const fileEditorSchema = z.object({
    name: z.string().min(1, "Filename is required"),
    language: z.string().min(1, "Language is required"),
    content: z.string().min(1, "Content is required"),
})

type ProjectNameFormValues = z.infer<typeof projectNameSchema>
type FileEditorFormValues = z.infer<typeof fileEditorSchema>


const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
        case "js":
        case "jsx":
        case "ts":
        case "tsx":
            return <Code className="w-4 h-4 text-blue-500" />
        case "md":
            return <FileText className="w-4 h-4 text-green-500" />
        case "json":
            return <File className="w-4 h-4 text-yellow-500" />
        case "css":
        case "scss":
            return <File className="w-4 h-4 text-purple-500" />
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "svg":
            return <ImageIcon className="w-4 h-4 text-pink-500" />
        default:
            return <File className="w-4 h-4 text-gray-500" />
    }
}

const getLanguageFromFileName = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
        case "js":
        case "jsx":
            return "javascript"
        case "ts":
        case "tsx":
            return "typescript"
        case "json":
            return "json"
        case "css":
            return "css"
        case "scss":
            return "scss"
        case "md":
            return "markdown"
        case "html":
            return "html"
        case "xml":
            return "xml"
        case "py":
            return "python"
        case "java":
            return "java"
        case "cpp":
        case "c":
            return "cpp"
        default:
            return "plaintext"
    }
}

export function ProjectView({ initialData }: { initialData: Project }) {
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
    const [isEditingName, setIsEditingName] = useState(false)

    const trpcUtils = trpc.useUtils()

    // Load files for the project
    const loadFilesQuery = trpc.project.protectedUserProjectFileList.useQuery(initialData.id, {
        enabled: !!initialData.id,
    })

    const saveFileMutation = trpc.project.protectedSaveProjectFileContent.useMutation()
    const addFileMutation = trpc.project.protectedAddProjectFile.useMutation()
    const updateProjectMutation = trpc.project.adminUpdate.useMutation()
    const deleteFileMutation = trpc.project.protectedDeleteProjectFile.useMutation({
        onSuccess: () => {
            toast.success("File deleted successfully")
            trpcUtils.project.protectedUserProjectFileList.invalidate(initialData.id)
        }
    })

    // Project name form
    const projectNameForm = useForm<ProjectNameFormValues>({
        resolver: zodResolver(projectNameSchema),
        defaultValues: {
            name: initialData.name,
        },
    })

    // File editor form
    const fileEditorForm = useForm<FileEditorFormValues>({
        resolver: zodResolver(fileEditorSchema),
        defaultValues: {
            name: "",
            language: "plaintext",
        },
    })

    const handleOpenEditor = (file: any) => {
        setSelectedFile(file)
        fileEditorForm.reset({
            name: file.name,
            language: file.language || getLanguageFromFileName(file.name),
            content: file.content || "",
        })
    }

    const handleBackToList = () => {
        setSelectedFile(null)
        fileEditorForm.reset()
    }

    const handleAddFile = async () => {
        try {
            await addFileMutation.mutateAsync({
                projectId: initialData.id,
                name: `untitled-${Date.now()}.txt`,
                language: "plaintext",
            })
            toast.success("File created successfully")
            await trpcUtils.project.protectedUserProjectFileList.invalidate(initialData.id)
            loadFilesQuery.refetch()
        } catch (e: any) {
            toast.error(e?.message || "Error creating file")
        }
    }

    const handleUpdateProjectName = async (data: ProjectNameFormValues) => {
        try {
            await updateProjectMutation.mutateAsync({
                id: initialData.id,
                name: data.name,
            })
            toast.success("Project name updated successfully")
            setIsEditingName(false)
            // Update the initial data or refetch project data
        } catch (e: any) {
            toast.error(e?.message || "Error updating project name")
        }
    }

    const handleUpdateFileMeta = async (data: FileEditorFormValues) => {
        if (!selectedFile) return

        try {
            await saveFileMutation.mutateAsync({
                id: selectedFile.id,
                name: data.name,
                language: data.language,
                content: data.content,
            })
            toast.success("File metadata updated successfully")
            await trpcUtils.project.protectedUserProjectFileList.invalidate(initialData.id)
            setSelectedFile({ ...selectedFile, name: data.name, language: data.language })
        } catch (e: any) {
            toast.error(e?.message || "Error updating file metadata")
        }
    }

    return (
        <div className="flex flex-col w-full min-h-screen">
            {/* Header */}
            <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/dashboard" className="hover:text-foreground">
                        Dashboard
                    </Link>
                    <span>/</span>
                    <Link href="/projects" className="hover:text-foreground">
                        Projects
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{projectNameForm.getValues("name")}</span>
                    {selectedFile && (
                        <>
                            <span>/</span>
                            <span className="text-foreground font-medium">{selectedFile.name}</span>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-4 ml-auto">
                    <div></div>
                    <Button onClick={handleAddFile}>
                        <Plus className="w-4 h-4 mr-2" />
                        New File
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* Project Name Edit Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                {isEditingName ? (
                                    <Form {...projectNameForm}>
                                        <form
                                            onSubmit={projectNameForm.handleSubmit(handleUpdateProjectName)}
                                            className="flex items-center gap-2"
                                        >
                                            <FormField
                                                control={projectNameForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" size="icon" variant="ghost">
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setIsEditingName(false)
                                                    projectNameForm.reset({ name: initialData.name })
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl cursor-pointer" onClick={() => setIsEditingName(true)}>
                                            {projectNameForm.getValues("name")}
                                        </CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                <CardDescription className="text-base mt-2">{initialData.description}</CardDescription>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <Badge variant="secondary">/{initialData.slug}</Badge>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Created {formatDate(initialData.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Updated {formatDate(initialData.updatedAt)}
                                    </div>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Project
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {/* <Avatar className="w-6 h-6">
                                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                <AvatarFallback>
                                    {initialData.owner?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("") || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                                Owned by <span className="font-medium text-foreground">{initialData.owner?.name || "Unknown"}</span>
                            </span> */}
                        </div>
                    </CardContent>
                </Card>

                {selectedFile ? (
                    /* File Editor View */
                    <div className="space-y-4">
                        {/* File Metadata Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">File Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...fileEditorForm}>
                                    <form onSubmit={fileEditorForm.handleSubmit(handleUpdateFileMeta)} className="flex items-end gap-4">
                                        <FormField
                                            control={fileEditorForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Filename</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="filename.ext" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={fileEditorForm.control}
                                            name="language"
                                            render={({ field }) => (
                                                <FormItem className="w-48">
                                                    <FormLabel>Language</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select language" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {languageOptions.map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={saveFileMutation.isPending}>
                                            {saveFileMutation.isPending ? "Updating..." : "Update"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        {/* File Editor */}
                        <Card className="flex flex-col h-[calc(100vh-400px)]">
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-2">
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="flex items-center">
                                            {getFileIcon(selectedFile.name)}
                                            <CardTitle className="ml-2">{selectedFile.name}</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="ml-2">
                                            {selectedFile.path}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <Controller
                                    name="content"
                                    control={fileEditorForm.control}
                                    render={({ field }) => (
                                        <Editor
                                            height="100%"
                                            language={fileEditorForm.getValues("language")}
                                            value={field.value}
                                            onChange={(value) => field.onChange(value || "")}
                                            theme="vs-dark"
                                            options={{
                                                readOnly: false,
                                                minimap: { enabled: true },
                                                fontSize: 14,
                                                lineNumbers: "on",
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                            }}
                                        />
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Project Files List View */
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Folder className="w-5 h-5" />
                                        Project Files
                                    </CardTitle>
                                    <CardDescription />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadFilesQuery.isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading files...</div>
                            ) : (
                                <div className="space-y-2">
                                    {loadFilesQuery.data?.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No files in this project yet.
                                        </div>
                                    ) : (
                                        loadFilesQuery.data?.map((file) => (
                                            <div key={file.id}>
                                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        {getFileIcon(file.name)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{file.name}</div>
                                                            <div className="text-sm text-muted-foreground truncate">{file.path}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground hidden sm:block">
                                                            {formatDate(file.updatedAt)}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleOpenEditor(file)}
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleOpenEditor(file)}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive" onClick={() => {
                                                                    deleteFileMutation.mutateAsync(file.id)
                                                                }} disabled={deleteFileMutation.isPending}>
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
