import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

type Leader = {
  id: string;
  name: string;
  department: string;
  points: number;
};

const DUMMY_LEADERS: Leader[] = [
  { id: "s1", name: "Aarav Patel", department: "CSE", points: 860 },
  { id: "s2", name: "Ishita Sharma", department: "ECE", points: 790 },
  { id: "s3", name: "Rahul Verma", department: "ME", points: 720 },
  { id: "s4", name: "Sneha Nair", department: "CSE", points: 690 },
  { id: "s5", name: "Aditya Rao", department: "IT", points: 660 },
  { id: "s6", name: "Meera Iyer", department: "EEE", points: 640 },
  { id: "s7", name: "Zoya Khan", department: "CIV", points: 610 },
  { id: "s8", name: "Vikram Singh", department: "CSE", points: 600 },
  { id: "s9", name: "Neha Gupta", department: "BT", points: 585 },
  { id: "s10", name: "Kunal Joshi", department: "ECE", points: 560 },
];

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Badge className="bg-yellow-500 text-black"><Trophy className="h-3 w-3 mr-1" />#1</Badge>;
  if (rank === 2) return <Badge className="bg-gray-300 text-black"><Medal className="h-3 w-3 mr-1" />#2</Badge>;
  if (rank === 3) return <Badge className="bg-amber-700 text-white"><Award className="h-3 w-3 mr-1" />#3</Badge>;
  return <Badge variant="secondary">#{rank}</Badge>;
};

const Leaderboard = () => {
  const sorted = useMemo(() => {
    return [...DUMMY_LEADERS].sort((a, b) => b.points - a.points);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Top students by verified achievement points</p>
        </div>

        <Card className="p-4 md:p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s, idx) => (
                <TableRow key={s.id} className={idx < 3 ? "bg-muted/30" : undefined}>
                  <TableCell>
                    <RankBadge rank={idx + 1} />
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell className="text-right font-semibold">{s.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;


