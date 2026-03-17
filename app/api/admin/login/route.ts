import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during login" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
