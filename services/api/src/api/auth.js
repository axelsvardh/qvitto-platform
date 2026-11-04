import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// The only user fields an endpoint may return. Never the password hash.
export const toPublicUser = (user) => ({ id: user.id, email: user.email, name: user.name });

// --------- REGISTER ------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // kontrollera om användaren redan finns
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Användare finns redan" });

    // hasha lösenord
    const hashedPassword = await bcrypt.hash(password, 10);

    // skapa användare
    const user = await prisma.user.create({
      data: { name, email, bankConnectionId: null, password: hashedPassword },
    });

    res.json({ message: "Registrering lyckades", user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------- LOGIN ------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Användare hittades inte" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Fel lösenord" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Inloggning lyckades",
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------- NOTIS ------------
export const savePushToken = async (req, res) => {
  const { userId } = req.user;
  const { token } = req.body;
  await prisma.user.update({
    where: { id: userId },
    data: { pushToken: token },
  });
  res.json({ message: "Push token sparad" });
};
