import type { Metadata } from "next";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun - BatasJamREG",
  description:
    "Buat akun BatasJamREG untuk mengelola batas jam digital tim dan Async Morning Digest.",
};

export default function RegisterPage() {
  return (
    <AuthSplitShell>
      <RegisterForm />
    </AuthSplitShell>
  );
}
