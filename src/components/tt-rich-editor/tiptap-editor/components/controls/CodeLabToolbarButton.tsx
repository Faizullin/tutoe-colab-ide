import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Project } from '@/generated/prisma';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { useTiptapContext } from '../Provider';

export const CodeLabToolbarButton: React.FC = () => {
  const { editor } = useTiptapContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);

  // Replace with your actual trpc query for codelabs
  const loadCodeLabsQuery = trpc.project.adminList.useQuery({
    filter: {
      name: search,
    }
  });

  const handleSelect = (projectObj: Project) => {
    setSelected(id);
    editor?.commands.setCodeLab(projectObj);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Insert CodeLab
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a CodeLab</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search CodeLab..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="mt-4 max-h-60 overflow-auto">
            {loadCodeLabsQuery.isLoading ? (
              <div>Loading...</div>
            ) : (
              loadCodeLabsQuery.data?.items?.map((lab) => (
                <div
                  key={lab.id}
                  className="cursor-pointer px-2 py-1 hover:bg-muted rounded"
                  onClick={() => handleSelect(lab)}
                >
                  {lab.name} [#{lab.id}]
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
