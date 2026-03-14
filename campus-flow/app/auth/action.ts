"use server"
import {createClient} from '@supabase/supabase-js';
import {redirect} from 'next/navigation';
export async function signUp(formdata:FormData)
{
 const email=   formdata.get('email') as string
 const password= formdata.get('password') as string
 const endingpart="@gmail.com"


//  1. frontend logic check
if(!email.endsWith(endingpart))
    return { error : `Only ${endingpart} are allowed`};

const supabase= await createClient()
const {error}= await supabase.auth.signUp({
   email,
   password,
   options:{
    emailRedirectTo:
    `${process.env.NEXT_PUBIC_SITE_URL}/auth/callback`,

   },


})
if(error)
    return {error:error.message}
return {success: "Check your email to confirm registeration"};


}