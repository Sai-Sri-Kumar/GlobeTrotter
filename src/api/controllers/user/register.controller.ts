import sql from "../../db/connect";
import { signToken } from "../../utils/jwt";

export async function register(req: Request) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      city_name,
      country_name,
      photo,
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return Response.json(
        { error: "Required fields missing" },
        { status: 400 },
      );
    }

    const emailExists = await sql`
      SELECT user_id FROM users WHERE email = ${email}
    `;
    if (emailExists.length) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    if (phone) {
      const phoneExists = await sql`
        SELECT user_id FROM users WHERE phone = ${phone}
      `;
      if (phoneExists.length) {
        return Response.json(
          { error: "Phone already registered" },
          { status: 409 },
        );
      }
    }

    const password_hash = await Bun.password.hash(password, {
      algorithm: "argon2id",
    });

    const [user] = await sql`
      INSERT INTO users (
        first_name, last_name, email, password_hash,
        phone, city_name, country_name, photo
      )
      VALUES (
        ${first_name}, ${last_name}, ${email}, ${password_hash},
        ${phone ?? null}, ${city_name ?? null},
        ${country_name ?? null}, ${photo ?? null}
      )
      RETURNING user_id, first_name, last_name, email
    `;

    const token = signToken({ user_id: user.user_id });

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: {
        "Set-Cookie": `auth=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
