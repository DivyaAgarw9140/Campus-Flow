"use client"
import {useState} from "react"
import {createClient} from "
export default function LoginPage() {
    const [email,setEmail] =useState("")
    const[password,setPassword]=useState("")
    const [fullName,setFullName]=useState("")
    const [isLogin,setisLogin]=useState(true)
    const supabase=createClient()
    const handleAuth=async()=>{
        if(isLogin)
        {
            const {error}=await supabase.auth.signInWithPassword({email,password})
            if(error) alert(error.message)
               else window.location.href="/"

        }
        else
        {
            if(!email.endsWith("@gmail.com"))
            {
                alert("please use your gmail proper")

return
            }
            const {error}=await supabase.auth.signUp({
                email,
                password,
                options:{
                    data:{ full_name :fullName} 
                    // this triggers our slq robot

                }
            })
if(error)
    alert(error.message)
else
    alert("check your email plese")

        }
    }
    return  (
         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">
            {isLogin ? "WELCOME BACK":"Join Cmpus-flow"}
 </h1>
{!isLogin && (
    <input 
    type="text" placeholder="nmel"   
     className="w-full p-3 mb-4 border rounded-xl"
    onChange={(e)=>setFullName(e.target.value)}
    /> )}
    <input 
    type="text" placeholder="Email "  
      className="w-full p-3 mb-4 border rounded-xl"
    onChange=
    {(e)=>setEmail(e.target.value)}
    />
     <input 
    type="text" placeholder="password"   
     className="w-full p-3 mb-4 border rounded-xl"
    onChange={(e)=>setPassword(e.target.value)}
    />
    <button 
    onClick={handleAuth}
    className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition"
        >
{isLogin ?"Login":"SIgnup"}
        </button>
)} 
<p className="mt-4 text-center text-sm text-gray-600">
     {isLogin ? "New here?" : "Already have an account?"}{" "} 
     <span className="text-orange-600 font-bold cursor-pointer underline" 
     onClick={() => setisLogin(!isLogin)} > {isLogin ? "Create Account" : "Login"} </span> </p> </div> </div> ) }
 //whts the need for this i completed the sigup nd l





)