"use server";

import { deleteFile, uploadFile } from "@/actions/storage-action";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthFormState } from "@/types/auth";
import {
  createUserSchema,
  updateUserSchema,
} from "@/validations/auth-validation";

export async function createUser(prevState: AuthFormState, formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  let avatarUrl = validatedFields.data.avatar_url;

  if (avatarUrl instanceof File) {
    const result = await uploadFile("images", "users", avatarUrl);

    if (result.status === "error") {
      return {
        status: "error",
        errors: { ...prevState.errors, _form: result.errors._form },
      };
    }

    avatarUrl = result.data.url;
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        name: validatedFields.data.name,
        role: validatedFields.data.role,
        avatar_url: avatarUrl,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

  return { status: "success" };
}

export async function updateUser(prevState: AuthFormState, formData: FormData) {
  const validatedFields = updateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  let avatarUrl = validatedFields.data.avatar_url;

  if (avatarUrl instanceof File) {
    const oldAvatarUrl = (formData.get("old_avatar_url") as string) ?? "";
    const prevPath = oldAvatarUrl.includes("/images/")
      ? oldAvatarUrl.split("/images/")[1]
      : undefined;

    const result = await uploadFile("images", "users", avatarUrl, prevPath);

    if (result.status === "error") {
      return {
        status: "error",
        errors: { ...prevState.errors, _form: result.errors._form },
      };
    }

    avatarUrl = result.data.url;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: validatedFields.data.name,
      role: validatedFields.data.role,
      avatar_url: avatarUrl,
    })
    .eq("id", formData.get("id") as string)
    .select();

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

  if (!data || data.length === 0) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: ["No row updated (cek RLS / id)"],
      },
    };
  }

  return { status: "success" };
}

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const id = formData.get("id") as string;
  const avatarUrl = (formData.get("avatar_url") as string) ?? "";

  const supabaseAdmin = await createAdminClient();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

  if (avatarUrl.includes("/images/")) {
    await deleteFile("images", avatarUrl.split("/images/")[1]);
  }

  return { status: "success" };
}
