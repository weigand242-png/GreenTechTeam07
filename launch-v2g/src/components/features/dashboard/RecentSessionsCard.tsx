import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import type { Session } from "@/lib/sessions";

interface Props {
  sessions: Session[];
  className?: string;
}

const dateFmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function RecentSessionsCard({ sessions, className }: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5" />
          Recent charging sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Vehicle</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">kWh</TableHead>
              <TableHead className="text-right">Peak kW</TableHead>
              <TableHead className="text-right pr-4">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.sessionId}>
                <TableCell className="pl-4 font-mono text-xs">
                  {s.vehicleId}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {s.locationType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.kWhDelivered.toFixed(1)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.peakKw.toFixed(1)}
                </TableCell>
                <TableCell className="text-muted-foreground pr-4 text-right text-xs">
                  {dateFmt.format(s.start)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
