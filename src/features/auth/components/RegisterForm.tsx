"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { DemoAccessCallout } from "./DemoAccessCallout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNameValid = fullName.trim().length >= 2;
  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;
  const canSubmit =
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    passwordsMatch &&
    !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const emailRedirectTo = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo,
        },
      });

      if (error) {
        toast.error(error.message || "Gagal mendaftarkan akun baru.");
        return;
      }

      if (data.session) {
        toast.success("Akun berhasil dibuat. Selamat datang di BatasJamREG.");
        router.push("/workspace");
        router.refresh();
        return;
      }

      toast.info(
        "Akun berhasil dibuat. Silakan cek email Anda untuk konfirmasi sebelum masuk."
      );
      router.push("/auth/login");
    } catch {
      toast.error("Terjadi gangguan koneksi saat membuat akun.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-primary">
          Buat Akun{" "}
          <span className="font-normal text-ink-secondary">Workspace</span>
        </h2>
        <p className="text-sm text-ink-secondary">
          Daftarkan akun untuk membuat tim baru atau bergabung dengan kode
          undangan.
        </p>
      </header>

      <DemoAccessCallout />

      <div className="relative flex items-center py-1" role="separator">
        <div className="flex-1 border-t border-stone-200/80" />
        <span className="bg-surface px-3 text-xs font-medium text-ink-secondary">
          atau daftar dengan email
        </span>
        <div className="flex-1 border-t border-stone-200/80" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-name" className="text-sm font-medium text-ink-primary">
            Nama Lengkap
          </Label>
          <Input
            id="register-name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Nama lengkap Anda"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-11 rounded-xl border-stone-200 bg-bento-canvas/40 px-3.5 text-sm text-ink-primary transition-colors focus-visible:border-brand focus-visible:bg-surface focus-visible:ring-brand/20"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email" className="text-sm font-medium text-ink-primary">
            Email
          </Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@perusahaan.id"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl border-stone-200 bg-bento-canvas/40 px-3.5 text-sm text-ink-primary transition-colors focus-visible:border-brand focus-visible:bg-surface focus-visible:ring-brand/20"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password" className="text-sm font-medium text-ink-primary">
            Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl border-stone-200 bg-bento-canvas/40 pr-11 pl-3.5 text-sm text-ink-primary transition-colors focus-visible:border-brand focus-visible:bg-surface focus-visible:ring-brand/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center px-3 text-ink-secondary hover:text-ink-primary"
            >
              {showPassword ? (
                <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-confirm" className="text-sm font-medium text-ink-primary">
            Konfirmasi Kata Sandi
          </Label>
          <Input
            id="register-confirm"
            name="confirm_password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
            className="h-11 rounded-xl border-stone-200 bg-bento-canvas/40 px-3.5 text-sm text-ink-primary transition-colors focus-visible:border-brand focus-visible:bg-surface focus-visible:ring-brand/20"
            required
          />
          {confirmPassword.length > 0 && !passwordsMatch ? (
            <p className="text-xs text-danger" role="alert">
              Konfirmasi kata sandi belum cocok.
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
              <span>Membuat Akun...</span>
            </>
          ) : (
            <span>Buat Akun</span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-ink-secondary">
        Sudah memiliki akun?{" "}
        <Link href="/auth/login" className="font-medium text-brand hover:underline">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}
