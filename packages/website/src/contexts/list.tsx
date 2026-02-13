// @ts-ignore: idk
import list_ from "virtual:awesome-list";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useMemo } from "react";

import { useDocumentTitle } from "shared/hooks/document-title";
import { useDynamicMetadata } from "shared/hooks/dynamic-metadata";
import { AwesomeListSchema } from "shared/types/awesome-list";
import { deepEqual } from "shared/lib/utils";

import type { AwesomeList } from "shared/types/awesome-list";

import { GitHubService } from "@/lib/github";

import * as yaml from "js-yaml";

import { useCommitAwareStorage } from "@/hooks/commit-aware-storage";
import { useGitHubAuth } from "@/hooks/github-auth";
import { useWorkflowStatus } from "@/hooks/workflow-status";

interface ListContextType {
  content: {
    old: AwesomeList;
    new: AwesomeList;
  };
  allTags: Array<string>;
  updateList: (updates: Partial<AwesomeList>) => void;
  clearChanges: () => void;
  syncRemoteList: (newList: AwesomeList) => void;
  hasUnsavedChanges: boolean;
  isWorkflowRunning: boolean;
  canEdit: boolean;
  isLoading: boolean;
  error: string | null;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const useList = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useList must be used within a ListProvider");
  }
  return context;
};

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const githubAuth = useGitHubAuth();
  const { isWorkflowRunning, checkWorkflowStatus } = useWorkflowStatus();
  const queryClient = useQueryClient();

  const {
    data: changes,
    setData: setChanges,
    clearData: clearPersistedChanges,
  } = useCommitAwareStorage<Partial<AwesomeList>>(
    "awesome-list-changes",
    __CONFIGURATION__.repository.commit,
    {},
  );

  const enabled = Boolean(
    githubAuth.isAuthenticated && githubAuth.token && !import.meta.env.DEV,
  );

  const {
    data: remoteList,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["awesome-list"],
    queryFn: async () => {
      try {
        const github = new GitHubService({
          token: githubAuth.token || undefined,
          owner: __CONFIGURATION__.repository.owner,
          repo: __CONFIGURATION__.repository.name,
        });
        const file = await github.getFile(__CONFIGURATION__.list.path);
        const content = yaml.load(file.content);

        const parsing = AwesomeListSchema.safeParse(content);

        if (parsing.error) throw parsing.error;

        const list = parsing.data;

        try {
          const readmePath = __CONFIGURATION__.list.path.replace(
            /[^/]+$/,
            "README.md",
          );
          const readmeFile = await github.getFile(readmePath);
          list.readme = readmeFile.content;
        } catch (err) {
          console.warn("Failed to fetch remote README:", err);
          if (list_.readme) {
            list.readme = list_.readme;
          }
        }

        return list;
      } catch (err) {
        console.warn("Failed to fetch remote YAML, using preloaded data:", err);
        return list_;
      }
    },
    enabled,
    initialData: list_,
    retry: (failureCount, _error) => failureCount < 3,
  });

  const baseList = remoteList || list_;
  const list = useMemo<AwesomeList>(() => {
    return { ...baseList, ...changes };
  }, [baseList, changes]);

  const allTags = useMemo(() => {
    return [
      ...new Set(list.elements.flatMap((element) => element.tags)),
    ].sort();
  }, [list]);

  const updateList = async (updates: Partial<AwesomeList>) => {
    await checkWorkflowStatus();
    if (isWorkflowRunning) {
      throw new Error(
        "Cannot edit while website is being updated. Please wait for the build to complete.",
      );
    }
    setChanges((prev: Partial<AwesomeList>) => ({ ...prev, ...updates }));
  };

  const clearChanges = () => {
    clearPersistedChanges();
  };

  const syncRemoteList = (newList: AwesomeList) => {
    queryClient.setQueryData(["awesome-list"], newList);
    clearPersistedChanges();
  };

  // Check if there are actual changes by comparing the merged list with the base list
  const hasUnsavedChanges = useMemo(() => {
    if (Object.keys(changes).length === 0) return false;

    // Compare each changed field
    for (const key of Object.keys(changes) as Array<keyof AwesomeList>) {
      if (!deepEqual(list[key], baseList[key])) {
        return true;
      }
    }

    return false;
  }, [changes, list, baseList]);

  const canEdit = !isWorkflowRunning;
  const error = queryError?.message || null;

  useDocumentTitle(hasUnsavedChanges);
  useDynamicMetadata(list);

  return (
    <ListContext.Provider
      value={{
        content: {
          old: baseList,
          new: list,
        },
        allTags,
        updateList,
        clearChanges,
        syncRemoteList,
        hasUnsavedChanges,
        isWorkflowRunning,
        canEdit,
        isLoading,
        error,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
