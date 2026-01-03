import sql from "../../db/connect";
import { signToken } from "../../utils/jwt";

export async function login(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    const [user] = await sql`
      SELECT user_id, email, password_hash, first_name, last_name
      FROM users WHERE email = ${email}
    `;

    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await Bun.password.verify(password, user.password_hash);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ user_id: user.user_id });

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: {
        "Set-Cookie": `auth=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
