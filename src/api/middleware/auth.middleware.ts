import jwt, { decode } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

type JwtPayload = {
  user_id: string;
  email: string;
  first_name: string;
};

function getCookie(req: Request, name: string) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  return cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

export function getUserFromRequest(req: Request): JwtPayload | null {
  try {
    const token = getCookie(req, "token"); // ⚠️ must match cookie name

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    console.log(decoded);

    return {
      user_id: decoded.user_id,
      email: decoded.email,
      first_name: decoded.first_name,
    };
  } catch (err) {
    // token expired / invalid / tampered
    return null;
  }
}
