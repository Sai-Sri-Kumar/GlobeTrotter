import sql from "../../db/connect";
import { verifyToken } from "../../utils/jwt";

export async function getMe(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie?.match(/auth=([^;]+)/)?.[1];

    if (!token) {
      return Response.json({ user: null }, { status: 401 });
    }

    const payload: any = verifyToken(token);

    const [user] = await sql`
      SELECT user_id, first_name, last_name, email
      FROM users WHERE user_id = ${payload.user_id}
    `;

    return Response.json({ user });
  } catch {
    return Response.json({ user: null }, { status: 401 });
  }
}
