import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginForm
      initialSignUp={params.mode === "signup"}
      authError={params.error === "auth"}
    />
  );
}
