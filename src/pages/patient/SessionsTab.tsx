import { Activity, CalendarDays, CheckCircle2, Clock, FileText, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTodayExercises, useProgress } from '@/api/queries';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatTime } from '@/lib/format';
import { useTranslation } from 'react-i18next';

/** Static demo session history rows — representative of what a real DB would return. */
const DEMO_SESSIONS = (patientFirstName: string, lang: string) => [
  {
    id: 's1',
    date: new Date(Date.now() - 0 * 86_400_000).toISOString(),
    label: lang === 'ar' ? 'جلسة اليوم' : "Today's session",
    exercises: 2,
    durationMin: 22,
    status: 'COMPLETED',
    note: lang === 'ar'
      ? `أكمل ${patientFirstName} تمرين رفع الذراعين وتمديد الساق. أداء جيد.`
      : `${patientFirstName} completed arm raise and leg extension. Good effort and form.`,
  },
  {
    id: 's2',
    date: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    label: lang === 'ar' ? 'الجلسة السابقة' : 'Previous session',
    exercises: 2,
    durationMin: 19,
    status: 'COMPLETED',
    note: lang === 'ar'
      ? `تحسن واضح في تمديد الساق. يحتاج لمزيد من العمل على التوازن.`
      : `Noticeable improvement on leg extension. Balance exercise needs more attention.`,
  },
  {
    id: 's3',
    date: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    label: lang === 'ar' ? 'الجلسة 3' : 'Session 3',
    exercises: 3,
    durationMin: 27,
    status: 'COMPLETED',
    note: lang === 'ar'
      ? `أكمل ${patientFirstName} جميع التمارين الثلاثة. استمر التعاون مع مقدم الرعاية.`
      : `${patientFirstName} completed all 3 exercises. Caregiver cooperation was excellent.`,
  },
  {
    id: 's4',
    date: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    label: lang === 'ar' ? 'الجلسة 4' : 'Session 4',
    exercises: 2,
    durationMin: 18,
    status: 'PARTIAL',
    note: lang === 'ar'
      ? `أكمل تمرين واحد فقط بسبب التعب. سيعيد المحاولة في اليوم التالي.`
      : `Only 1 of 2 exercises completed due to fatigue. Will retry next session.`,
  },
  {
    id: 's5',
    date: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    label: lang === 'ar' ? 'الجلسة 5' : 'Session 5',
    exercises: 2,
    durationMin: 21,
    status: 'COMPLETED',
    note: lang === 'ar'
      ? `جلسة ممتازة. التزام كامل وأداء جيد في جميع التمارين.`
      : `Excellent session. Full compliance and good performance across all exercises.`,
  },
  {
    id: 's6',
    date: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    label: lang === 'ar' ? 'الجلسة الأولى' : 'First session',
    exercises: 1,
    durationMin: 12,
    status: 'COMPLETED',
    note: lang === 'ar'
      ? `أول جلسة. أُدخل ${patientFirstName} على التمارين برفق مع شرح الأهداف لمقدم الرعاية.`
      : `First session. ${patientFirstName} was gently introduced to exercises. Goals explained to caregiver.`,
  },
];

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation('patientDetail');
  if (status === 'COMPLETED')
    return (
      <Badge className="bg-success-soft text-success gap-1">
        <CheckCircle2 className="size-3" aria-hidden />
        {t('sessions.statusCompleted')}
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-warning border-warning/40 gap-1">
      {t('sessions.statusPartial')}
    </Badge>
  );
}

export function SessionsTab({ patientId }: { patientId: string }) {
  const { t, i18n } = useTranslation('patientDetail');
  const progress = useProgress(patientId);
  const exercises = useTodayExercises(patientId);
  const [openNote, setOpenNote] = useState<string | null>(null);

  if (progress.isPending || exercises.isPending)
    return <CardSkeleton className="h-96" />;
  if (progress.error)
    return <ErrorState error={progress.error} onRetry={() => void progress.refetch()} />;

  const p = progress.data;
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  // Derive a first name from the patient ID for demo note personalisation
  const nameMap: Record<string, string> = {
    ahmed: 'Ahmed',
    sara: 'Sara',
    omar: 'Omar',
    layla: 'Layla',
    yousef: 'Yousef',
  };
  const firstName =
    Object.entries(nameMap).find(([k]) => patientId.toLowerCase().includes(k))?.[1] ?? 'Patient';

  const sessions = DEMO_SESSIONS(firstName, lang);

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="bg-brand-soft text-primary flex size-11 items-center justify-center rounded-xl">
              <Activity className="size-5" aria-hidden />
            </span>
            <div>
              <p className="tabular text-2xl font-bold">{p.exercises.completed}</p>
              <p className="text-muted-foreground text-xs">{t('sessions.totalCompleted')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="bg-success-soft text-success flex size-11 items-center justify-center rounded-xl">
              <CalendarDays className="size-5" aria-hidden />
            </span>
            <div>
              <p className="tabular text-2xl font-bold">{sessions.length}</p>
              <p className="text-muted-foreground text-xs">{t('sessions.sessionsLogged')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="bg-warning-soft text-warning flex size-11 items-center justify-center rounded-xl">
              <Clock className="size-5" aria-hidden />
            </span>
            <div>
              <p className="tabular text-2xl font-bold">
                {sessions.reduce((sum, s) => sum + s.durationMin, 0)}
              </p>
              <p className="text-muted-foreground text-xs">{t('sessions.totalMinutes')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session log table */}
      <Card className="overflow-hidden py-0">
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary size-4" aria-hidden />
            {t('sessions.logTitle')}
          </CardTitle>
          <CardDescription>{t('sessions.logDesc')}</CardDescription>
        </CardHeader>
        {sessions.length === 0 ? (
          <CardContent>
            <EmptyState title={t('sessions.noSessions')} />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="ps-5">{t('sessions.colDate')}</TableHead>
                <TableHead>{t('sessions.colExercises')}</TableHead>
                <TableHead>{t('sessions.colDuration')}</TableHead>
                <TableHead>{t('sessions.colStatus')}</TableHead>
                <TableHead className="pe-5">{t('sessions.colNote')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <>
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => setOpenNote(openNote === s.id ? null : s.id)}
                    aria-expanded={openNote === s.id}
                  >
                    <TableCell className="ps-5">
                      <div>
                        <p className="font-medium">{s.label}</p>
                        <p className="text-muted-foreground text-xs">{formatDate(s.date, lang)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="tabular">
                      {t('sessions.exerciseCount', { count: s.exercises })}
                    </TableCell>
                    <TableCell className="tabular">
                      {t('sessions.durationMin', { min: s.durationMin })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="pe-5">
                      <button
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium transition-colors"
                        aria-label={t('sessions.viewNote')}
                      >
                        <Pencil className="size-3" aria-hidden />
                        {openNote === s.id ? t('sessions.hideNote') : t('sessions.viewNote')}
                      </button>
                    </TableCell>
                  </TableRow>
                  {openNote === s.id && (
                    <TableRow key={`${s.id}-note`} className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={5} className="px-5 py-3">
                        <div className="flex items-start gap-2">
                          <FileText className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                          <p className="text-sm" dir="auto">
                            {s.note}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
