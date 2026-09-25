import { ClipboardList, LayoutGrid, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAllPrograms } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { ProgressBar } from '@/components/shared/progress';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/states';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatDate } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export default function ProgramsPage() {
  const { t, i18n } = useTranslation('programs');
  const navigate = useNavigate();
  const { data, isPending, error, refetch } = useAllPrograms();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = useMemo(() => {
    return (data || []).slice((page - 1) * pageSize, page * pageSize);
  }, [data, page, pageSize]);

  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'grid' | 'table')}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <List className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('emptyTitle')}
          description={t('emptyDesc')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => (
            <Link key={p.id} to={`/patients/${p.patient.id}?tab=plan`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={p.patient.fullName} color={p.patient.avatarColor} />
                      <div>
                        <p className="font-semibold" dir="auto">{p.patient.fullName}</p>
                        <p className="text-muted-foreground text-sm" dir="auto">{p.name}</p>
                      </div>
                    </div>
                  </div>
                  <SpecialtyBadge specialty={p.specialty} />
                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('week')}</dt>
                      <dd className="tabular font-semibold">
                        {p.currentWeek} / {p.durationWeeks}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('frequency')}</dt>
                      <dd className="font-semibold">{t('timesPerWk', { times: p.sessionsPerWeek })}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{t('exercises')}</dt>
                      <dd className="tabular font-semibold">{p.exerciseCount}</dd>
                    </div>
                  </dl>
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                      {t('progress', { date: formatDate(p.startDate, i18n.language) })}
                    </p>
                    <ProgressBar value={p.progress} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden py-0">
          <Table wrapperClassName="max-h-[600px]">
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted sticky top-0 z-10 shadow-sm">
                  <TableHead className="ps-5 h-11 text-xs uppercase tracking-wider font-semibold">{t('tablePatient', { defaultValue: 'Patient' })}</TableHead>
                  <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('tableProgram', { defaultValue: 'Program' })}</TableHead>
                  <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('tableSpecialty', { defaultValue: 'Specialty' })}</TableHead>
                  <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('tableWeek', { defaultValue: 'Week' })}</TableHead>
                  <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('tableFrequency', { defaultValue: 'Frequency' })}</TableHead>
                  <TableHead className="w-48 pe-5 h-11 text-xs uppercase tracking-wider font-semibold">{t('tableProgress', { defaultValue: 'Progress' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/patients/${p.patient.id}?tab=plan`)}
                  >
                    <TableCell className="ps-5">
                      <div className="flex items-center gap-3">
                        <PatientAvatar name={p.patient.fullName} color={p.patient.avatarColor} size="sm" />
                        <span className="font-semibold" dir="auto">{p.patient.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell dir="auto">{p.name}</TableCell>
                    <TableCell>
                      <SpecialtyBadge specialty={p.specialty} />
                    </TableCell>
                    <TableCell className="tabular">{p.currentWeek} / {p.durationWeeks}</TableCell>
                    <TableCell>{t('timesPerWk', { times: p.sessionsPerWeek })}</TableCell>
                    <TableCell className="pe-5">
                      <ProgressBar value={p.progress} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          {data.length > 0 && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={data.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          )}
        </Card>
      )}
    </div>
  );
}
