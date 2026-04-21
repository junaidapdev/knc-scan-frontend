import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { ROUTES } from '@/constants/routes';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ApiCallError } from '@/lib/api';
import { logger } from '@/lib/logger';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

type LoginFormValues = z.infer<typeof schema>;

const ADMIN_RATE_LIMIT_COPY =
  'Too many failed attempts. Try again in a few minutes.';

export default function AdminLoginPage(): JSX.Element {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
    } catch (err) {
      if (err instanceof ApiCallError && err.code === 'ADMIN_RATE_LIMIT') {
        setSubmitError(ADMIN_RATE_LIMIT_COPY);
      } else if (err instanceof ApiCallError) {
        setSubmitError(err.bilingualMessage.en);
      } else {
        logger.error('[admin-login] unexpected error', { err });
        setSubmitError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas-bg px-4">
      <div className="w-full max-w-md rounded-lg border border-obsidian/10 bg-white p-8 shadow-lg">
        <p className="text-eyebrow uppercase text-obsidian/60">
          Kayan Admin Console
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[3px] text-obsidian">
          Sign in
        </h1>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-obsidian">Email</span>
            <input
              type="email"
              autoComplete="email"
              className="rounded border border-obsidian/20 px-3 py-2 text-obsidian focus:border-yellow focus:outline-none focus:shadow-focus-yellow"
              {...register('email')}
            />
            {errors.email ? (
              <span className="text-xs text-red-600">
                {errors.email.message}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-obsidian">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className="rounded border border-obsidian/20 px-3 py-2 text-obsidian focus:border-yellow focus:outline-none focus:shadow-focus-yellow"
              {...register('password')}
            />
            {errors.password ? (
              <span className="text-xs text-red-600">
                {errors.password.message}
              </span>
            ) : null}
          </label>
          {submitError ? (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-2 rounded bg-yellow px-4 py-2.5 text-sm font-semibold text-obsidian hover:bg-yellow-hover disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
