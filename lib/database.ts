import { supabase } from "./supabaseClient";

export async function createConversation(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: "New Conversation",
    })
    .select()
    .single();

  if (error) {
    console.error("Create conversation error:", JSON.stringify(error, null, 2));
    return null;
  }

  return data;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: role,
      content: content,
    })
    .select();

  if (error) {
    console.error("Save message error full:", JSON.stringify(error, null, 2));
    alert("Message nuk u ruajt në Supabase. Shiko console.");
    return null;
  }

  return data;
}