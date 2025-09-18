import { Navigation } from "@/components/Navigation";
import { StudentDashboard } from "@/components/StudentDashboard";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <StudentDashboard />
    </div>
  );
};

export default Dashboard;