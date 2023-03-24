import { Form, Link, useActionData } from "@remix-run/react";
import { json, redirect, type ActionArgs } from "@remix-run/cloudflare";
import { User } from "~/models/User";

export async function action({ request, context: { auth } }: ActionArgs) {
  if (await auth.check(User)) {
    return redirect("/dashboard");
  }

  const formData = new URLSearchParams(await request.text());
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (await auth.attempt(User, { email, password })) {
    return redirect("/dashboard");
  }

  return json({ error: "Invalid credentials" }, { status: 400 });
}

export default function Login() {
  const actionData = useActionData();

  return (
    <Form method="post" className="m-auto w-full max-w-md flex flex-col items-center shadow bg-white p-8 gap-4">
      <h1 className="text-lg font-bold">Log in</h1>

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="email" className="text-sm">Email</label>
        <input name="email" type="email" required className="border rounded px-2 py-1" />
      </div>

      <div className="w-full flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">Password</label>
        <input name="password" type="password" required className="border rounded px-2 py-1" />
      </div>

      {actionData?.error && (
        <div style={{ color: "red" }}>{actionData.error}</div>
      )}

      <div className="w-full flex gap-4 items-center justify-center">
        <button type="submit"className="bg-orange-500 border border-orange-500 text-white rounded px-4 py-1" >Log in</button>

        <Link to="/auth/register" className="border rounded px-4 py-1">Register</Link>
      </div>
    </Form>
  );
}
