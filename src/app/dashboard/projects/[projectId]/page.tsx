import { trpcCaller } from "@/server/api/caller";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "../_components/project-view";

export const metadata: Metadata = {
  title: "Edit Project",
  description: "Edit your project details here.",
};

type PageProps = { params: Promise<{ projectId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const projectId = parseInt(params.projectId, 10);
  const data = await trpcCaller.project.adminDetail(projectId);
  if (!data) {
    notFound();
  }
  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* <Breadcrumb /> */}
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
          <ProjectView initialData={data} />
        </div>
      </div>
    </>
  );
}
