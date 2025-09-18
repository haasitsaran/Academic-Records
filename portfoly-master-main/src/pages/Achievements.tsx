import { Navigation } from "@/components/Navigation";
import { AchievementUpload } from "@/components/AchievementUpload";

const Achievements = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AchievementUpload />
    </div>
  );
};

export default Achievements;