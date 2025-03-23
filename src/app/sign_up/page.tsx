import { SignUpForm } from "./sign-up-form";

export default function SignUpPage() {
  return (
    <div className=" flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[400px]">
        <SignUpForm />
      </div>
    </div>
  );
}
