"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"; // ✅ Use the Singleton instance!
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setname] = useState("")
    const [isLogin, setisLogin] = useState(true)
    
    // ❌ const supabase = createClient()  <-- ISSE DELETE KARO!

    const handleAuth = async () => {
        if (isLogin) {
            // ✅ Ab ye hamare purane session ko recognize karega
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) alert(error.message)
            else window.location.href = "/" 
        }
        else {
            if (!email.endsWith("@gmail.com")) {
                alert("Please use a proper Gmail address")
                return;
            }
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name || "User" }
                }
            })
            
            if (error) alert(error.message)
            else {
                alert("Signup successful! Welcome to Campus-Flow 🚀");
                window.location.href = "/"; 
            }
        }
    }

  
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">
                    {isLogin ? "WELCOME BACK" : "Join Cmpus-flow"}
                </h1>
                {!isLogin && (
                    <input
                        type="text" name="name" placeholder="name"
                        className="w-full p-3 mb-4 border rounded-xl"
                        onChange={(e) => setname(e.target.value)}
                    />)}
                <input
                    type="text" name="email" placeholder="Email "
                    className="w-full p-3 mb-4 border rounded-xl"
                    onChange=
                    {(e) => setEmail(e.target.value)}
                />
                <input
                    type="text" name="password" placeholder="password"
                    className="w-full p-3 mb-4 border rounded-xl"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={handleAuth}
                    className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition"
                >
                    {isLogin ? "Login" : "Signup"}
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    {isLogin ? "New here?" : "Already have an account?"}{" "}
                    <span className="text-orange-600 font-bold cursor-pointer underline"
                        onClick={() => setisLogin(!isLogin)} > {isLogin ? "Create Account" : "Login"} </span> </p> </div> </div>)
}
//whts the need for this i completed the sigup nd l

