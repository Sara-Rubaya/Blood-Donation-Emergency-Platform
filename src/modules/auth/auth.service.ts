import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET as string;
// Cast to SignOptions["expiresIn"] — newer @types/jsonwebtoken wants a
// number or a branded "StringValue" template type, not a plain string.
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: "DONOR" | "REQUESTER";
  bloodGroup?: string;
  phone?: string;
  city?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: { ...payload, password: hashedPassword, bloodGroup: payload.bloodGroup as any },
  });

  const token = signToken(user.id, user.role);
  const { password, ...safeUser } = user;
  return { user: safeUser, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) throw new ApiError(401, "Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const token = signToken(user.id, user.role);
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

// GCP Social Login: verifies the Google ID token, then finds-or-creates the user
export const loginWithGoogle = async (idToken: string, role: "DONOR" | "REQUESTER" = "REQUESTER") => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new ApiError(401, "Invalid Google token");

  let user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: payload.name || "Google User",
        email: payload.email,
        googleId: payload.sub,
        role,
        isVerified: true,
      },
    });
  }

  const token = signToken(user.id, user.role);
  const { password, ...safeUser } = user;
  return { user: safeUser, token };
};