"use client";

import { Button } from "@/components/ui/button";
import FormInput from "@/components/ui/common/form-input";
import FormSelect from "@/components/ui/common/form-select";
import FormImage from "@/components/ui/common/form-image";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { ROLE_LIST } from "@/constants/auth-constant";
import { Preview } from "@/types/general";
import { Loader2 } from "lucide-react";
import { FormEvent, RefObject } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormUser<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
  closeRef,
}: {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: "Create" | "Update";
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
  closeRef?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{type} User</DialogTitle>
        <DialogDescription>
          {type === "Create" ? "Register a new user" : "Make changes user here"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <FormInput
            form={form}
            name={"name" as Path<T>}
            label="Name"
            placeholder="Insert your name"
          />
          {type === "Create" && (
            <FormInput
              form={form}
              name={"email" as Path<T>}
              label="Email"
              placeholder="Insert email here"
              type="email"
              autoComplete="email"
            />
          )}
          <FormSelect
            form={form}
            name={"role" as Path<T>}
            label="Role"
            selectItem={ROLE_LIST}
          />
          <FormImage
            form={form}
            name={"avatar_url" as Path<T>}
            label="Avatar"
            preview={preview}
            setPreview={setPreview}
          />
          {type === "Create" && (
            <FormInput
              form={form}
              name={"password" as Path<T>}
              label="Password"
              placeholder="******"
              type="password"
              autoComplete="new-password"
            />
          )}
          <DialogFooter>
            <DialogClose
              ref={closeRef}
              render={<Button type="button" variant="outline" />}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : type}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </form>
    </DialogContent>
  );
}
