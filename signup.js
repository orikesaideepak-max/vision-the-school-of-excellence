import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://gocoupvzzsgouwdkdmzu.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.signup = async function () {

    const full_name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorBox = document.getElementById("error");

    errorBox.innerText = "";

    if (!full_name || !email || !password) {
        errorBox.innerText = "All fields are required";
        return;
    }

    try {

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: full_name,
                    role: "student"
                }
            }
        });

        console.log("Signup Data:", data);
        console.log("Signup Error:", error);

        if (error) {
            errorBox.innerText = error.message;
            return;
        }

        alert("Signup successful! Please login.");
        window.location.href = "login.html";

    } catch (err) {
        console.error("Unexpected Error:", err);
        errorBox.innerText = err.message;
    }
};