import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { IconButton, TextField } from "@radix-ui/themes";
import { type ControllerParams } from "@raideno/auto-form/registry";
import React, { useState } from "react";

export const PasswordWithToggleController: React.FC<
  ControllerParams<any, string>
> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField.Root
      type={showPassword ? "text" : "password"}
      value={props.field.value}
      onChange={(event) => props.field.onChange(event.target.value)}
      placeholder={props.metadata.placeholder}
    >
      <TextField.Slot side="right">
        <IconButton
          type="button"
          size="1"
          variant="ghost"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide token" : "Show token"}
        >
          {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </IconButton>
      </TextField.Slot>
    </TextField.Root>
  );
};
