import { Context } from "hono";
import * as v from "valibot";
import {
  createUser,
  createUserAuth,
  getOneUser,
  getUserPass,
  updatePass,
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
    return c.json({ message: "This user already exist" }, 404);
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
  const url = `${process.env.CLIENT_URL}/confirmation?token=${token}`;
  const sentEmail = await sendMail(email, url, {
    title: "Confirm your registration",
    text: "Verify your email",
    urLink: "Confirm registration",
  });
  if (sentEmail === "mail sent") {
    return c.json({ message: "confirm your email" });
  } else {
    return c.json({ message: "Unable to verify email" }, 404);
  }
}

// login user implementation
export async function loginUser(c: Context) {
  const userDetails = await c.req.json();
  const loginSchema = v.object({
    email: v.pipe(
      v.string("Enter email address"),
      v.email("Invalid email address")
    ),
    password: v.string(),
  });
  const result = v.safeParse(loginSchema, userDetails, {
    abortEarly: true,
  });
  if (!result.success) {
    return c.json({ message: result.issues[0].message }, 404);
  }
  const { email, password } = result.output;

  const isUserRegistered = await getOneUser(email);
  if (isUserRegistered === undefined) {
    return c.json({ message: "User does not exist" }, 404);
  }
  const confirmPass = await getUserPass(isUserRegistered.id);

  const isAuthorised = await bcrypt.compare(
    password,
    confirmPass?.password as string
  );
  if (!isAuthorised) {
    return c.json({ message: "Incorrect email or password" }, 404);
  }
  const { userName: username } = isUserRegistered;

  const token = jwt.sign({ username, email }, process.env.SECRET as string, {
    expiresIn: "3h",
  });
  return c.json({
    token,
    user: isUserRegistered,
  });
}

export async function provideEmail(c: Context) {
  const emailSchema = v.object({
    email: v.pipe(v.string("Enter email"), v.email("Invalid email")),
  });
  const inputEmail = await c.req.json();
  const result = v.safeParse(emailSchema, inputEmail, { abortEarly: true });

  if (!result.success) {
    return c.json({ error: result.issues[0].message }, 404);
  }
  const { email } = result.output;
  const doesUserExist = await getOneUser(email);
  if (doesUserExist === undefined) {
    return c.json({ error: "User does not exist" }, 404);
  }

  const token = jwt.sign(
    { userId: doesUserExist.id, email },
    process.env.SECRET as string,
    {
      expiresIn: "2h",
    }
  );
  const url = `${process.env.CLIENT_URL}/reset-password/reset?token=${token}`;

  const sendEmail = await sendMail(email, url, {
    title: "Book management Password Reset ",
    text: "Reset your password",
    urLink: "password reset",
  });
  if (sendEmail === "mail sent") {
    return c.json({ message: "Reset email sent" });
  } else {
    return c.json({ message: "Unable to send reset email" });
  }
}

export async function resetNewPassword(c: Context) {
  const { token, password } = await c.req.json();

  const passwordSchema = v.object({
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
  const result = v.safeParse(passwordSchema, { password });
  if (!result.success) {
    return c.json({ message: result.issues[0].message }, 404);
  }

  try {
    const { userId } = jwt.verify(
      token as string,
      process.env.SECRET as string
    ) as JwtPayload;

    const password: string = await bcrypt.hash(result.output.password, 8);
    const updatePassword = await updatePass(password, userId);
    if (updatePassword?.length === 0) {
      return c.json({ error: "unable to update password" }, 404);
    }
    if (updatePassword === null) {
      return c.json({ error: "Server error password" }, 404);
    }
    return c.json({ message: "password updated" });
  } catch (error) {
    return c.json({ error: "Invalid reset link" }, 404);
  }
}

export async function confirmUserRegister(c: Context) {
  const { token } = await c.req.json();
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
    if (createdUser.length !== 0) {
      const { id: userId, email, username } = createdUser[0];
      const userCredentials = await createUserAuth({ userId, password });
      if (userCredentials.length !== 0) {
        // return user with jwt

        // const tokenReg = jwt.sign(
        //   { email, username },
        //   process.env.SECRET as string,
        //   { expiresIn: "3h" }
        // );
        // return c.json({ token: tokenReg, user: createdUser });
        return c.json({ message: "user registration successfully" });
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
  url: string,
  message: { title: string; text: string; urLink: string }
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
        subject: `${message.title} ✔`,
        text: `${message.text}`,
        html: ` <a href=${url}>${message.urLink}</a> `,
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
