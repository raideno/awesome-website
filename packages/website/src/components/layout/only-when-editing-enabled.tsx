import { useEditing } from "@/contexts/editing";

export interface OnlyWhenEditingEnabledProps {
  children?: React.ReactNode;
}

export const OnlyWhenEditingEnabled: React.FC<OnlyWhenEditingEnabledProps> = ({
  children,
}) => {
  const { editingEnabled } = useEditing();

  if (!editingEnabled) {
    return null;
  }

  return <>{children}</>;
};
