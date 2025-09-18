import { Navigation } from "@/components/Navigation";
import { AcademicResults } from "@/components/AcademicResults";

const AcademicResultsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AcademicResults />
    </div>
  );
};

export default AcademicResultsPage;