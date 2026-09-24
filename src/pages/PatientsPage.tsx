import { Search, SearchX, X } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { usePatients, useSpecialties } from '@/api/queries';
import { PatientStatusBadge, SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { ProgressBar } from '@/components/shared/progress';
import { EmptyState, ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import type { PatientStatus } from '@/lib/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { patientFiltersChanged, patientFiltersReset } from '@/store/uiSlice';
import { useTranslation } from 'react-i18next';

const STATUSES: PatientStatus[] = ['ACTIVE', 'UNDER_REVIEW', 'NEW', 'COMPLETED'];

export default function PatientsPage() {
  const { t } = useTranslation('patients');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.ui.patientFilters);
  const { data: patients, isPending, error, refetch } = usePatients();
  const { data: specialties } = useSpecialties();

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return (patients ?? []).filter(
      (p) =>
        (!term ||
          p.fullName.toLowerCase().includes(term) ||
          p.diagnosis.name.toLowerCase().includes(term)) &&
        (filters.specialtyId === 'all' || p.specialty?.id === filters.specialtyId) &&
        (filters.status === 'all' || p.status === filters.status),
    );
  }, [patients, filters]);

  const isFiltered =
    filters.search !== '' || filters.specialtyId !== 'all' || filters.status !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('header.title')}
        description={t('header.description')}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:max-w-sm md:flex-1">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 rtl:left-auto rtl:right-3"
            aria-hidden
          />
          <Input
            value={filters.search}
            onChange={(e) => dispatch(patientFiltersChanged({ search: e.target.value }))}
            placeholder={t('filters.searchPlaceholder')}
            className="ps-9"
            aria-label={t('filters.searchAria')}
          />
        </div>
        <Select
          value={filters.specialtyId}
          onValueChange={(v) => dispatch(patientFiltersChanged({ specialtyId: v }))}
        >
          <SelectTrigger className="md:w-56" aria-label={t('filters.specialtyAria')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allSpecialties')}</SelectItem>
            {specialties?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(v) =>
            dispatch(patientFiltersChanged({ status: v as PatientStatus | 'all' }))
          }
        >
          <SelectTrigger className="md:w-48" aria-label={t('filters.statusAria')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {tCommon(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button variant="ghost" onClick={() => dispatch(patientFiltersReset())}>
            <X /> {t('filters.clear')}
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="ps-5">{t('table.patient')}</TableHead>
                <TableHead>{t('table.age')}</TableHead>
                <TableHead>{t('table.diagnosis')}</TableHead>
                <TableHead>{t('table.specialty')}</TableHead>
                <TableHead className="w-48">{t('table.progress')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead className="pe-5">{t('table.lastAssessment')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending &&
                Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7} className="px-5">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/patients/${p.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/patients/${p.id}`)}
                  tabIndex={0}
                  aria-label={t('table.openPatient', { name: p.fullName })}
                >
                  <TableCell className="ps-5">
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={p.fullName} color={p.avatarColor} size="sm" />
                      <div>
                        <p className="font-semibold">{p.fullName}</p>
                        <p className="text-muted-foreground text-xs">
                          {p.gender === 'MALE' ? t('table.boy') : t('table.girl')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="tabular">{p.age}</TableCell>
                  <TableCell>{p.diagnosis.name}</TableCell>
                  <TableCell>
                    <SpecialtyBadge specialty={p.specialty} />
                  </TableCell>
                  <TableCell>
                    {p.requiresReview ? (
                      <span className="text-muted-foreground text-sm">{t('table.notStarted')}</span>
                    ) : (
                      <ProgressBar value={p.progress} />
                    )}
                  </TableCell>
                  <TableCell>
                    <PatientStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground pe-5">
                    {p.lastAssessmentAt ? formatDate(p.lastAssessmentAt) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isPending && filtered.length === 0 && (
            <EmptyState
              icon={SearchX}
              className="m-5"
              title={t('empty.title')}
              description={t('empty.description')}
              action={
                <Button variant="outline" size="sm" onClick={() => dispatch(patientFiltersReset())}>
                  {t('empty.clearFilters')}
                </Button>
              }
            />
          )}
        </Card>
      )}
    </div>
  );
}
