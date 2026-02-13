import React, { createContext, useContext } from "react";

import { useLocalStorageStateFactory } from "shared/hooks/local-storage-state";

interface EditingContextType {
  editingEnabled: boolean;
  setEditingEnabled: (v: boolean) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export const useEditing = () => {
  const context = useContext(EditingContext);
  if (!context)
    throw new Error("useEditing must be used within EditingProvider");
  return context;
};

export const EditingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [editingEnabled, setEditingEnabled] = useLocalStorageStateFactory(
    __CONFIGURATION__.repository.owner,
    __CONFIGURATION__.repository.name,
  )<boolean>("editing.enabled", false);

  return (
    <EditingContext.Provider value={{ editingEnabled, setEditingEnabled }}>
      {children}
    </EditingContext.Provider>
  );
};

export default EditingProvider;
