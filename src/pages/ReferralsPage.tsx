import { Send } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAllReferrals } from '@/api/queries';
import { SpecialtyBadge } from '@/components/shared/badges';
import { PageHeader } from '@/components/shared/PageHeader';
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
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-5">{t('patient')}</TableHead>
                <TableHead>{t('specialty')}</TableHead>
                <TableHead>{t('reason')}</TableHead>
                <TableHead>{t('referredBy')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead className="pr-5">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
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
        </Card>
      )}
    </div>
  );
}
