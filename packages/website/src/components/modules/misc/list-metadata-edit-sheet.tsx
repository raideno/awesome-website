import { useState } from "react";

import { Heading, ScrollArea, Text } from "@radix-ui/themes";
import { AutoForm } from "@raideno/auto-form/ui";
import { AwesomeListMetadata } from "shared/types/awesome-list";
import { toast } from "sonner";

import type React from "react";
import type { z } from "zod/v4";

import { Sheet } from "@/components/ui/sheet";
import { useList } from "@/contexts/list";

export interface ListMetadataEditSheetProps {
  children?: React.ReactNode;
  state?: { open: boolean; onOpenChange: (open: boolean) => void };
}

export const ListMetadataEditSheet: React.FC<ListMetadataEditSheetProps> = ({
  children,
  state,
}) => {
  const list = useList();

  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = state?.open ?? internalOpen;
  const setOpen = state?.onOpenChange ?? setInternalOpen;

  const handleSubmit = async (data: z.infer<typeof AwesomeListMetadata>) => {
    try {
      await list.updateList({
        ...data,
      });
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update list metadata. Please try again.");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleError = () => {
    toast.error("Please fix the errors in the form before submitting.");
  };

  return (
    <Sheet.Root open={isOpen && list.canEdit} onOpenChange={setOpen}>
      {children && (
        <Sheet.Trigger disabled={!list.canEdit}>{children}</Sheet.Trigger>
      )}
      <Sheet.Content portal={false} side="right">
        <AutoForm.Root
          schema={AwesomeListMetadata}
          defaultValues={{
            ...list.content.new,
          }}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onError={handleError}
          className="h-full grid grid-rows-[auto_1fr_auto] gap-4"
        >
          <Sheet.Header>
            <>
              <Sheet.Title className="sr-only">Edit List</Sheet.Title>
              <Sheet.Description className="sr-only">
                Edit the list details below. Make changes and click "Save" to
                apply, or "Cancel" to discard.
              </Sheet.Description>
            </>
            <Heading>Edit List</Heading>
            <Text>
              Edit the list details below. Make changes and click "Save" to
              apply, or "Cancel" to discard.
            </Text>
          </Sheet.Header>
          <ScrollArea scrollbars="vertical">
            <Sheet.Body className="w-full h-full">
              <AutoForm.Content className="w-full" />
            </Sheet.Body>
          </ScrollArea>
          <Sheet.Footer>
            <AutoForm.Actions className="flex flex-col gap-4 w-full items-center">
              <Sheet.Close asChild className="!w-full">
                <AutoForm.Action
                  type="reset"
                  className="!w-full"
                  variant="outline"
                >
                  Cancel
                </AutoForm.Action>
              </Sheet.Close>
              <AutoForm.Action
                type="submit"
                className="!w-full"
                variant="classic"
              >
                Save
              </AutoForm.Action>
            </AutoForm.Actions>
          </Sheet.Footer>
        </AutoForm.Root>
      </Sheet.Content>
    </Sheet.Root>
  );
};
