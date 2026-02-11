import React, { useState } from "react";

import {
  InfoCircledIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";

import { useGitHubAuth } from "@/hooks/github-auth";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const githubAuth = useGitHubAuth();
  const [tokenValue, setTokenValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedToken = tokenValue.trim();
    if (!trimmedToken) {
      toast.error("Token cannot be empty");
      return;
    }
    
    githubAuth.setToken(trimmedToken);
    onOpenChange(false);
    toast.success("Token saved successfully");
  };

  // Update tokenValue when dialog opens
  React.useEffect(() => {
    if (open) {
      setTokenValue(githubAuth.token || "");
    }
  }, [open, githubAuth.token]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Box>
              <>
                <Dialog.Title className="sr-only">Settings</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Manage your GitHub authentication and preferences
                </Dialog.Description>
              </>
              <Heading>Settings</Heading>
              <Text>Manage your GitHub authentication and preferences</Text>
            </Box>

            <Flex direction="column" gap="2">
              <label htmlFor="github-token">
                <Text size="2" weight="medium">
                  GitHub Personal Access Token
                </Text>
              </label>
              <TextField.Root
                id="github-token"
                type={showPassword ? "text" : "password"}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tokenValue}
                onChange={(e) => setTokenValue(e.target.value)}
                required
              >
                <TextField.Slot side="right">
                  <IconButton
                    type="button"
                    size="1"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide token" : "Show token"}
                  >
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>
              <Text size="1" color="gray">
                Required for editing and pushing changes. Token is automatically
                saved.
              </Text>
            </Flex>

            <Callout.Root color="blue" variant="soft">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                You'll need a GitHub personal access token with repository write
                permissions.{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  Create one here
                </a>
                .
              </Callout.Text>
            </Callout.Root>
            <Button type="submit" className="w-full" variant="classic">
              Save
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
};
