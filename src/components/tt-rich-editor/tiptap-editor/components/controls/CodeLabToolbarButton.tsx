
"use client";

import AsyncSelect from '@/components/combobox/async-select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Project } from '@/generated/prisma';
import { Log } from '@/lib/log';
import { trpc } from '@/utils/trpc';
import { useCallback, useState } from 'react';
import { useTiptapContext } from '../Provider';

export const CodeLabToolbarButton: React.FC = () => {
  const { editor } = useTiptapContext();
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<{
    value: string;
    label: string;
  } | null>(null)
  const [initialData, setInitialData] = useState<Project[]>([]);
  const trpcUtils = trpc.useUtils();

  const handleSave = useCallback(() => {
    const foundItem = initialData.find(item => value && `${item.id}` === value.value);
    if (!foundItem) {
      alert("CodeLab not found");
      return;
    }
    // Insert CodeLabs into the editor
    editor.chain().focus().insertCodeLab(foundItem).run();

    setOpen(false);
  }, [editor, initialData, value]);


  // Use trpcUtils.project.adminList.fetch for live search
  const loadOptions = async (inputValue: string) => {
    try {
      const data = await trpcUtils.project.adminList.fetch({
        filter: {
          name: inputValue || undefined,
        },
      }, {
        staleTime: 0,
        gcTime: 0,
      });
      setInitialData(data.items || []);
      const options = (data?.items || []).map(item => ({
        value: `${item.id}`,
        label: `${item.name} [#${item.id}]`,
      }));
      return options;
    } catch (e) {
      Log.error("Error loading options:", e);
      return [];
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} type='button'>
        Insert CodeLab
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a CodeLab</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <AsyncSelect
              cacheOptions
              loadOptions={loadOptions}
              onChange={(v) => setValue(v as any)}
              defaultOptions
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              aria-label="Delete selected rows"
              variant="destructive"
              onClick={handleSave}
              disabled={!value}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
