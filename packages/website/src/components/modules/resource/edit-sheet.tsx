import { useState } from "react";

import { Heading, Text } from "@radix-ui/themes";
import { AutoForm } from "@raideno/auto-form/ui";
import { AwesomeListElementSchema } from "shared/types/awesome-list";
import { toast } from "sonner";

import type React from "react";
import type { z } from "zod/v4";

import type { AwesomeListElement } from "shared/types/awesome-list";

import { Sheet } from "@/components/ui/sheet";

import { useList } from "@/contexts/list";

export interface ResourceEditSheetProps {
  children?: React.ReactNode;
  element: AwesomeListElement;
  state?: { open: boolean; onOpenChange: (open: boolean) => void };
}

export const ResourceEditSheet: React.FC<ResourceEditSheetProps> = ({
  children,
  element,
  state,
}) => {
  const list = useList();

  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = state?.open ?? internalOpen;
  const setOpen = state?.onOpenChange ?? setInternalOpen;

  const handleSubmit = async (
    data: z.infer<typeof AwesomeListElementSchema>,
  ) => {
    try {
      await list.updateList({
        elements: list.content.new.elements.map((el) =>
          el.name === element.name ? { ...el, ...data } : el,
        ),
      });
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update resource. Please try again.");
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
          schema={AwesomeListElementSchema}
          defaultValues={{
            ...element,
          }}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onError={handleError}
          className="w-full h-full grid grid-rows-[auto_1fr_auto] gap-4"
        >
          <Sheet.Header>
            <>
              <Sheet.Title className="sr-only">Edit Resource</Sheet.Title>
              <Sheet.Description className="sr-only">
                Edit the resource details below. Make changes and click "Save"
                to apply, or "Cancel" to discard.
              </Sheet.Description>
            </>
            <Heading>Edit Resource</Heading>
            <Text>
              Edit the resource details below. Make changes and click "Save" to
              apply, or "Cancel" to discard.
            </Text>
          </Sheet.Header>
          <Sheet.Body>
            <AutoForm.Content
              fields={["name", "description", "link", "tags", "group"]}
            />
          </Sheet.Body>
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
                className="w-full"
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
