import { Send } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAllReferrals } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { PatientAvatar } from '@/components/shared/PatientAvatar';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/shared/states';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { useTranslation } from 'react-i18next';

export default function ReferralsPage() {
  const { t, i18n } = useTranslation('referrals');
  const navigate = useNavigate();
  const { data, isPending, error, refetch } = useAllReferrals();

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
      />
      {data.length === 0 ? (
        <EmptyState icon={Send} title={t('emptyTitle')} />
      ) : (
        <Card className="overflow-hidden py-0 flex flex-col">
          <Table wrapperClassName="max-h-[600px]">
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted sticky top-0 z-10 shadow-sm">
                <TableHead className="pl-5 h-11 text-xs uppercase tracking-wider font-semibold">{t('patient')}</TableHead>
                <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('specialty')}</TableHead>
                <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('reason')}</TableHead>
                <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('referredBy')}</TableHead>
                <TableHead className="h-11 text-xs uppercase tracking-wider font-semibold">{t('date')}</TableHead>
                <TableHead className="pr-5 h-11 text-xs uppercase tracking-wider font-semibold">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => r.patient && navigate(`/patients/${r.patient.id}?tab=plan`)}
                >
                  <TableCell className="pl-5">
                    {r.patient && (
                      <span className="flex items-center gap-2 font-medium" dir="auto">
                        <PatientAvatar
                          name={r.patient.fullName}
                          color={r.patient.avatarColor}
                          size="sm"
                        />
                        {r.patient.fullName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SpecialtyBadge specialty={r.specialty} />
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate" dir="auto">
                    {r.reason}
                  </TableCell>
                  <TableCell dir="auto">{r.createdBy}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(r.createdAt, i18n.language)}</TableCell>
                  <TableCell className="pr-5">
                    <Badge
                      className={
                        r.status === 'ACCEPTED'
                          ? 'bg-success-soft text-success'
                          : 'bg-warning-soft text-warning'
                      }
                    >
                      {r.status === 'ACCEPTED' ? t('statusAccepted') : t('statusPending')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalItems={data.length}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </Card>
      )}
    </div>
  );
}
