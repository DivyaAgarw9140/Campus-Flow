"use server"
import { createClient } from "@/utils/supabase/server";

export async function signUp(formdata: FormData) { // Added 'signUp' here
  const name = formdata.get('name') as string;     // Extract the name
  const email = formdata.get('email') as string;
  const password = formdata.get('password') as string;

  const supabase = await createClient();

  // Added '.signUp' below
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name, // This talks to your SQL robot
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
if(!email.endsWith("@gmail.com"))
{
  return { error:"Only valid email allowed!!"};
}
  if (error) {
    return { error: error.message };
  }
  
  return { success: "Check your email to confirm registration" };
}
import { redirect } from "next/navigation";

export async function signIn(formdata: FormData) {
  const email = formdata.get('email') as string;
  const password = formdata.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/staff/dashboard');
}