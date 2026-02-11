import { Portal } from "@radix-ui/react-dialog";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Heading,
  Text,
  Tabs,
} from "@radix-ui/themes";
import { MetadataRegistry } from "@raideno/auto-form/registry";
import { AutoForm } from "@raideno/auto-form/ui";
import React, { useState, useMemo, type ComponentProps } from "react";
import { z } from "zod/v4";
import ReactDiffViewer from "react-diff-viewer-continued";

import { toast } from "sonner";

import { useTheme } from "shared/contexts/theme";
import type { AwesomeList } from "shared/types/awesome-list";

import { useList } from "@/contexts/list";
import { useGitHubAuth } from "@/hooks/github-auth";
import { getWorkflowStatus } from "@/hooks/workflow-status";
import { GitHubService } from "@/lib/github";

import * as yaml from "js-yaml";

interface PushChangesDialogProps {
  children?: React.ReactNode;
  yamlContent: AwesomeList;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PushChangesFormSchema = z.object({
  repository: z
    .string()
    .register(MetadataRegistry, { label: "Repository*", disabled: true }),
  path: z
    .string()
    .register(MetadataRegistry, { label: "YAML File Path*", disabled: true }),
  message: z
    .string()
    .min(1)
    .max(48)
    .register(MetadataRegistry, { label: "Commit Message*", disabled: false }),
});

export const PushChangesDialog: React.FC<PushChangesDialogProps> = ({
  children,
  yamlContent,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const githubAuth = useGitHubAuth();
  const { clearChanges, syncRemoteList, content } = useList();
  const { theme } = useTheme();

  const dialogOpen = controlledOpen !== undefined ? controlledOpen : isOpen;
  const setDialogOpen = controlledOnOpenChange || setIsOpen;

  // Generate YAML content for old and new versions
  const { oldYaml, newYaml, hasYamlChanges } = useMemo(() => {
    const { readme: oldReadme, ...oldYamlData } = content.old;
    const { readme: newReadme, ...newYamlData } = yamlContent;

    const oldYaml = yaml.dump(oldYamlData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    const newYaml = yaml.dump(newYamlData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    return {
      oldYaml,
      newYaml,
      hasYamlChanges: oldYaml !== newYaml,
    };
  }, [content.old, yamlContent]);

  // Check for README changes
  const { oldReadme, newReadme, hasReadmeChanges } = useMemo(() => {
    const oldReadme = content.old.readme || "";
    const newReadme = yamlContent.readme || "";

    return {
      oldReadme,
      newReadme,
      hasReadmeChanges: oldReadme !== newReadme,
    };
  }, [content.old.readme, yamlContent.readme]);

  const handleError = () => {
    toast.error("Something is wrong with your inputs.");
  };

  const handleSubmit: ComponentProps<
    typeof AutoForm.Root<typeof PushChangesFormSchema>
  >["onSubmit"] = async (data, tag, _helpers) => {
    if (tag === "submit") {
      try {
        if (!githubAuth.isAuthenticated || !githubAuth.token) {
          toast.error("Authentication required", {
            description:
              "Please set your GitHub token in Settings (long-press the star button)",
          });
          return;
        }

        const status = await getWorkflowStatus({ token: githubAuth.token });

        if (status.isWorkflowRunning) {
          toast.error("Build in progress", {
            description:
              "Cannot push changes while website is being updated. Please wait for the build to complete.",
          });
          return;
        }

        const github = new GitHubService({
          token: githubAuth.token,
          owner: __REPOSITORY_OWNER__,
          repo: __REPOSITORY_NAME__,
        });

        await github.update(data.path, yamlContent, data.message);

        toast.success("Changes pushed successfully!", {
          description: "The repository has been updated",
        });

        setDialogOpen(false);

        // NOTE: optimistic update, set the new list as the base list and clear changes to disable update button until new changes are made
        syncRemoteList(yamlContent);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        toast.error("Failed to push changes", {
          description: errorMessage,
        });
      }
    } else if (tag === "discard") {
      clearChanges();
      setDialogOpen(false);
    } else {
      toast.error("Unknown action. Please try again.");
    }
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <Portal container={document.body}>
        <Dialog.Content style={{ maxWidth: "90vw", width: "1200px" }}>
          <AutoForm.Root
            defaultValues={{
              path: __YAML_FILE_PATH__,
              repository: `${__REPOSITORY_OWNER__}/${__REPOSITORY_NAME__}`,
              message: "chore: update",
            }}
            schema={PushChangesFormSchema}
            onError={handleError}
            onSubmit={handleSubmit}
          >
            <Flex direction="column" gap="4">
              <Box>
                <>
                  <Dialog.Title className="sr-only">
                    Push Changes to Repository
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Review and confirm pushing your changes to the repository.
                  </Dialog.Description>
                </>
                <Flex direction={"row"} align={"center"} justify={"between"}>
                  <Heading>Push Changes to Repository</Heading>
                  <Button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </Flex>
                <Text>
                  Review and confirm pushing your changes to the repository.
                </Text>
              </Box>

              {!githubAuth.isAuthenticated && (
                <Callout.Root color="red">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    You are not authenticated. Please set your GitHub token in
                    Settings (long-press the star button).
                  </Callout.Text>
                </Callout.Root>
              )}

              <AutoForm.Content />
              
              {/* Preview Changes Section */}
              <Box>
                <Heading size="3" mb="2">
                  Preview Changes
                </Heading>
                <Tabs.Root defaultValue="yaml">
                  <Tabs.List>
                    <Tabs.Trigger value="yaml">
                      list.yaml {hasYamlChanges && "(Modified)"}
                    </Tabs.Trigger>
                    {hasReadmeChanges && (
                      <Tabs.Trigger value="readme">
                        README.md (Modified)
                      </Tabs.Trigger>
                    )}
                  </Tabs.List>

                  <Box pt="3">
                    <Tabs.Content value="yaml">
                      {hasYamlChanges ? (
                        <Box
                          style={{
                            maxHeight: "400px",
                            overflow: "auto",
                            border: "1px solid var(--gray-6)",
                            borderRadius: "var(--radius-2)",
                          }}
                        >
                          <ReactDiffViewer
                            oldValue={oldYaml}
                            newValue={newYaml}
                            splitView={true}
                            useDarkTheme={theme === "dark"}
                            leftTitle="Current (Remote)"
                            rightTitle="New (Local)"
                            hideLineNumbers={false}
                          />
                        </Box>
                      ) : (
                        <Callout.Root>
                          <Callout.Text>
                            No changes to list.yaml file
                          </Callout.Text>
                        </Callout.Root>
                      )}
                    </Tabs.Content>

                    {hasReadmeChanges && (
                      <Tabs.Content value="readme">
                        <Box
                          style={{
                            maxHeight: "400px",
                            overflow: "auto",
                            border: "1px solid var(--gray-6)",
                            borderRadius: "var(--radius-2)",
                          }}
                        >
                          <ReactDiffViewer
                            oldValue={oldReadme}
                            newValue={newReadme}
                            splitView={true}
                            useDarkTheme={theme === "dark"}
                            leftTitle="Current (Remote)"
                            rightTitle="New (Local)"
                            hideLineNumbers={false}
                          />
                        </Box>
                      </Tabs.Content>
                    )}
                  </Box>
                </Tabs.Root>
              </Box>

              <AutoForm.Actions>
                <Flex direction={"column"} gap="3" justify="end">
                  <AutoForm.Action tag="discard" variant="soft" color="red">
                    Discard Changes
                  </AutoForm.Action>
                  <AutoForm.Action tag="submit" variant="classic">
                    Push Changes
                  </AutoForm.Action>
                </Flex>
              </AutoForm.Actions>
            </Flex>
          </AutoForm.Root>
        </Dialog.Content>
      </Portal>
    </Dialog.Root>
  );
};
