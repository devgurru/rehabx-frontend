import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLogin } from '@/api/queries';
import { Logo } from '@/components/layout/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signedIn } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const DEMO = { email: 'clinician@rehabx.demo', password: 'demo' };

export default function LoginPage() {
  const { t, i18n } = useTranslation('login');
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (token) return <Navigate to={from} replace />;

  const submit = (credentials: { email: string; password: string }) => {
    setRoleError(null);
    login.mutate(credentials, {
      onSuccess: ({ accessToken, user }) => {
        if (user.role !== 'CLINICIAN') {
          setRoleError(t('roleMismatch'));
          return;
        }
        dispatch(signedIn({ token: accessToken, user }));
        navigate(from, { replace: true });
      },
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit({ email, password });
  };

  const error = roleError ?? (login.error instanceof Error ? login.error.message : null);

  const HIGHLIGHTS = [
    { icon: ClipboardCheck, text: t('highlight1') },
    { icon: Activity, text: t('highlight2') },
    { icon: ShieldCheck, text: t('highlight3') },
  ];

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]" dir={i18n.dir()}>
      {/* ── Left/Right brand panel ── */}
      <aside className="relative hidden overflow-hidden bg-[#0b5f67] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] rounded-full bg-white/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-24 -right-10 size-40 rounded-full bg-[var(--coral)]/20"
          aria-hidden
        />
        <Logo className="[&_.text-primary]:text-[#9fe3e8] [&_span]:text-white" />
        <div className="relative max-w-md space-y-6">
          <p className="text-sm font-medium tracking-wide text-[#9fe3e8] uppercase">
            {t('portalLabel')}
          </p>
          <h1 className="text-4xl leading-tight font-bold text-balance">{t('heroHeading')}</h1>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-white/85">
                <Icon className="mt-0.5 size-5 shrink-0 text-[#9fe3e8]" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/60">{t('disclaimerSidebar')}</p>
      </aside>

      {/* ── Login form ── */}
      <main className="relative flex items-center justify-center p-6">
        <div className="absolute top-6 end-6 z-10">
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm mt-8 sm:mt-0">
          <CardHeader className="space-y-3">
            <Logo className="lg:hidden" />

            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => submit(DEMO)}
              disabled={login.isPending}
            >
              {login.isPending ? <Loader2 className="animate-spin" /> : <Stethoscope />}
              {t('continueDemo')}
              <ArrowRight className="ms-auto rtl:rotate-180" />
            </Button>

            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <Separator className="flex-1" />
              {t('orSignIn')}
              <Separator className="flex-1" />
            </div>

            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder={DEMO.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={login.isPending || !email || !password}
              >
                {t('signIn')}
              </Button>
            </form>
            <p className="text-muted-foreground text-center text-xs">
              {t('demoHint', { email: DEMO.email })}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
