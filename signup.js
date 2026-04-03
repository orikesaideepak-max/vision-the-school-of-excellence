const SUPABASE_URL = "https://gocoupvzzsgouwdkdmzu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"; // use anon key only



async function signup() {
  const full_name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("error");

  errorBox.innerText = "";

  if (!full_name || !email || !password) {
    errorBox.innerText = "All fields are required";
    return;
  }

  // 1️⃣ Create Auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    errorBox.innerText = error.message;
    return;
  }

  const user = data.user;

  // 2️⃣ Insert into profiles table
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      full_name: full_name,
      email: email,
      role: "student" // 🔒 default role
    });

  if (profileError) {
    errorBox.innerText = "Profile creation failed";
    return;
  }

  alert("Signup successful! Please login.");
  window.location.href = "login.html";
}
