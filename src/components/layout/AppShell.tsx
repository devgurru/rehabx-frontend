import {
  Activity,
  BarChart3,
  ChevronsUpDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Send,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { signedOut } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Logo } from './Logo';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV = [
  { to: '/', tKey: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', tKey: 'patients', icon: Users },
  { to: '/programs', tKey: 'programs', icon: ClipboardList },
  { to: '/referrals', tKey: 'referrals', icon: Send },
  { to: '/kpis', tKey: 'kpis', icon: Activity },
  { to: '/reports', tKey: 'reports', icon: BarChart3 },
];

export function AppShell() {
  const { t, i18n } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const signOut = () => {
    dispatch(signedOut());
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  const isActive = (to: string, end?: boolean) => (end ? pathname === to : pathname.startsWith(to));

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side={i18n.dir() === 'rtl' ? 'right' : 'left'}>
        <SidebarHeader className="px-3 pt-4">
          <NavLink to="/" className="flex items-center gap-2 px-1" aria-label="RehabX home">
            <Logo className="group-data-[collapsible=icon]:hidden" />
            <Logo
              showWordmark={false}
              className="hidden group-data-[collapsible=icon]:inline-flex"
            />
          </NavLink>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('nav.clinicalWorkspace')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.to, item.end)}
                      tooltip={t(`nav.${item.tKey}`)}
                    >
                      <NavLink to={item.to} end={item.end}>
                        <item.icon />
                        <span>{t(`nav.${item.tKey}`)}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
            <div className="bg-brand-soft/60 text-accent-foreground rounded-lg border p-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold">
                <FileText className="size-3.5" aria-hidden /> {t('nav.investorPrototype')}
              </p>
              <p className="text-accent-foreground/80 mt-1">
                {t('nav.fictionalData')}
              </p>
            </div>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu dir={i18n.dir()}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                    <PatientAvatar
                      name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                      color="#0e7c86"
                      size="sm"
                    />
                    <span className="grid flex-1 text-start leading-tight">
                      <span className="truncate text-sm font-semibold">{user?.displayName}</span>
                      <span className="text-muted-foreground truncate text-xs">{user?.title}</span>
                    </span>
                    <ChevronsUpDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-semibold">{user?.displayName}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>
                    <LogOut /> {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="bg-background/85 sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-1 h-5" />
          <span className="text-muted-foreground text-sm">
            {t('nav.clinicName')}
          </span>
          <div className="ms-auto flex items-center gap-2">
            <span className="bg-card text-muted-foreground hidden rounded-full border px-2.5 py-1 text-xs font-medium sm:inline">
              {t('nav.demoEnvironment')}
            </span>
            <LanguageSwitcher />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
