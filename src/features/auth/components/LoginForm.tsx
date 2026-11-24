"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { DemoAccessCallout } from "./DemoAccessCallout";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSafeNextPath(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/workspace";
  }
  return nextParam;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const safeNext = getSafeNextPath(searchParams.get("next"));
  const isEmailConfirmed = searchParams.get("confirmed") === "true";
  const isConfirmError = searchParams.get("confirm_error") === "true";
  const toastFiredRef = useRef(false);

  useEffect(() => {
    if (toastFiredRef.current) return;
    if (isEmailConfirmed) {
      toastFiredRef.current = true;
      toast.success("Email berhasil dikonfirmasi. Silakan masuk ke akun Anda.");
    } else if (isConfirmError) {
      toastFiredRef.current = true;
      toast.error("Tautan konfirmasi email tidak valid atau sudah kedaluwarsa.");
    }
  }, [isEmailConfirmed, isConfirmError]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error("Email atau kata sandi tidak sesuai.");
        return;
      }

      toast.success("Berhasil masuk ke akun Anda.");
      router.push(safeNext);
      router.refresh();
    } catch {
      toast.error("Terjadi gangguan koneksi saat masuk.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-primary">
          Masuk{" "}
          <span className="font-normal text-ink-secondary">ke Workspace</span>
        </h2>
        <p className="text-sm text-ink-secondary">
          Gunakan akun terdaftar atau coba langsung menggunakan workspace demo.
        </p>
      </header>

      {isEmailConfirmed ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-2xl border border-safe/30 bg-safe-soft p-3.5 text-sm text-safe"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">Email Berhasil Dikonfirmasi</span>
            <span className="text-xs leading-relaxed">
              Akun Anda sudah aktif. Silakan masuk menggunakan email dan kata
              sandi yang baru didaftarkan.
            </span>
          </div>
        </div>
      ) : null}

      {isConfirmError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger-soft p-3.5 text-sm text-danger"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">Konfirmasi Email Gagal</span>
            <span className="text-xs leading-relaxed">
              Tautan konfirmasi tidak valid atau sudah kedaluwarsa. Silakan
              daftar ulang atau masuk jika akun sudah aktif.
            </span>
          </div>
        </div>
      ) : null}

      <DemoAccessCallout redirectTo={safeNext} />

      <div className="relative flex items-center py-1" role="separator">
        <div className="flex-1 border-t border-stone-200/80" />
        <span className="bg-surface px-3 text-xs font-medium text-ink-secondary">
          atau masuk dengan email
        </span>
        <div className="flex-1 border-t border-stone-200/80" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email" className="text-sm font-medium text-ink-primary">
            Email
          </Label>
          <Input
            id="login-email"
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
          <Label htmlFor="login-password" className="text-sm font-medium text-ink-primary">
            Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
              <span>Memproses Masuk...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-ink-secondary">
        Belum memiliki akun?{" "}
        <Link href="/auth/register" className="font-medium text-brand hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </>
  );
}
