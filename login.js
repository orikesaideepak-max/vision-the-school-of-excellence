// Supabase configuration
const SUPABASE_URL = "https://gocoupvzzsgouwdkdmzu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw";

// Create a single Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("error");

  errorBox.innerText = "";

  if (!email || !password) {
    errorBox.innerText = "Email and password are required";
    return;
  }

  try {
    // 1️⃣ Login existing user
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      errorBox.innerText = loginError.message;
      return;
    }

    const user = loginData.user;
    if (!user) {
      errorBox.innerText = "Login failed. Try again.";
      return;
    }

    // 2️⃣ Fetch profile to get role
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      errorBox.innerText = "Profile exists but role not accessible. Contact admin.";
      return;
    }

    // 3️⃣ Redirect by role
    switch (profile.role) {
      case "student":
        window.location.replace("/student/dashboard.html");
        break;
      case "teacher":
        window.location.replace("/teacher/dashboard.html");
        break;
      case "admin":
        window.location.replace("/admin/dashboard.html");
        break;
      default:
        errorBox.innerText = "Invalid role. Contact admin.";
    }

  } catch (err) {
    console.error(err);
    errorBox.innerText = "Unexpected error occurred. Check console.";
  }
}
