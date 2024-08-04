import { Context } from "hono";
import * as v from "valibot";
import {
  createUser,
  createUserAuth,
  getOneUser,
  removeUser,
} from "./auth.service";
import nodemailer from "nodemailer";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";

export async function registerUser(c: Context) {
  const userDetailSchema = v.object({
    username: v.string("Enter username"),
    email: v.pipe(
      v.string("Enter email address"),
      v.email("Invalid email address")
    ),
    password: v.pipe(
      v.string("Enter password"),
      v.minLength(8, "Password must be at least 8 characters long"),
      v.regex(/[a-z]/, "Password must contain at least one lowercase letter"),
      v.regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
      v.regex(/[0-9]/, "Password must contain at least one number"),
      v.regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      )
    ),
  });
  const userDetails = await c.req.json();
  const result = v.safeParse(userDetailSchema, userDetails, {
    abortEarly: true,
  });
  if (!result.success) {
    return c.json({ message: result.issues[0].message }, 404);
  }
  const { email, username, password: pass } = result.output;
  const doesUserExist = await getOneUser(email);
  if (doesUserExist !== undefined) {
    return c.json({ message: "This user already exist" });
  }
  const password = await bcrypt.hash(pass, 8);
  //   send email to confirm the user
  const token = jwt.sign(
    { email, username, password },
    process.env.SECRET as string,
    {
      expiresIn: "1hr",
    }
  );
  const url = `${process.env.BASE_URL}/confirmation?token=${token}`;
  const sentEmail = await sendMail(email, url);
  if (sentEmail === "mail sent") {
    return c.json({ message: "confirm your email" });
  } else {
    return c.json({ message: "Unable to verify email" });
  }
}

// login user implementation
export async function loginUser(c: Context) {}

export async function confirmUserRegister(c: Context) {
  const token = c.req.query("token");

  try {
    const { email, username, password } = jwt.verify(
      token as string,
      process.env.SECRET as string
    ) as JwtPayload;
    console.log(email as string);

    const createdUser = await createUser({
      userName: username,
      email,
    });
    if (createUser.length !== 0) {
      const userId: number = createdUser[0].id;

      const userCredentials = await createUserAuth({ userId, password });
      if (userCredentials.length !== 0) {
        return c.redirect("/login");
      } else {
        await removeUser(userId);
        return c.json({ error: "Registration failed" }, 404);
      }
    } else {
      return c.json({ error: "Registration failed" }, 500);
    }
  } catch (error) {
    console.log(error);
    return c.json(
      {
        error: "Invalid confirmation link. Try to register again",
      },
      404
    );
  }
}

async function sendMail(
  mailTo: string,
  url: string
): Promise<void | string | undefined> {
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SENDER_EMAIL as string,
      pass: process.env.PASS as string,
    },
  });

  async function main() {
    try {
      const info = await transporter.sendMail({
        from: `Books management <${process.env.SENDER_EMAIL as string}>`,
        to: mailTo,
        subject: "Confirm your registration ✔",
        text: "Verify your email",
        html: ` <a href=${url}>Confirm registration</a> `,
      });

      console.log("Message sent: %s", info.messageId);
      return "mail sent";
    } catch (error) {
      if (error) {
        console.log(error);
        return "mail not sent";
      }
    }
  }
  const res = main()
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch(console.error);
  return res;
}
