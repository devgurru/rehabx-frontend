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

export default function ReferralsPage() {
  const navigate = useNavigate();
  const { data, isPending, error, refetch } = useAllReferrals();
  if (isPending) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Specialty referrals"
        description="Physician-led referrals to Physiotherapy, Occupational Therapy and Speech & Language Therapy."
      />
      {data.length === 0 ? (
        <EmptyState icon={Send} title="No referrals yet" />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="pl-5">Patient</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Referred by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-5">Status</TableHead>
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
                      <span className="flex items-center gap-2 font-medium">
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
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {r.reason}
                  </TableCell>
                  <TableCell>{r.createdBy}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                  <TableCell className="pr-5">
                    <Badge
                      className={
                        r.status === 'ACCEPTED'
                          ? 'bg-success-soft text-success'
                          : 'bg-warning-soft text-warning'
                      }
                    >
                      {r.status === 'ACCEPTED' ? 'Accepted' : 'Pending'}
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
