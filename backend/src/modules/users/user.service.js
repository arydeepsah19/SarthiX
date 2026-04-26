import {supabase} from "../../config/supabaseClient.js";

export const findUserByClerkId = async (clerkUserId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};

export const createUser = async ({ clerkUserId, role, name }) => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      clerk_user_id: clerkUserId,
      role,
      name
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserPhone = async (userId, phoneNumber) => {
  const { data, error } = await supabase
    .from("users")
    .update({ phone_number: phoneNumber })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
 