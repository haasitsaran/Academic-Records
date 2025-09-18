import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, Users, Shield, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-academic.jpg";

export const HeroSection = () => {
  const features = [
    {
      icon: Trophy,
      title: "Achievement Tracking",
      description: "Centralized platform for all academic and non-academic achievements"
    },
    {
      icon: Shield,
      title: "Faculty Validation",
      description: "Ensures credibility with faculty approval system"
    },
    {
      icon: Users,
      title: "Digital Portfolio",
      description: "Auto-generated, shareable digital profiles"
    },
    {
      icon: TrendingUp,
      title: "Career Analytics",
      description: "AI-powered career readiness scoring and insights"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient text-white">
          <div className="container mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="animate-fade-in">
                <Badge className="mb-6 bg-white/20 text-white border-white/20 hover:bg-white/30">
                  Academic Excellence Platform
                </Badge>
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Team Pinnacle
                  <span className="block text-4xl text-white/90 font-normal mt-2">
                    Your Digital Academic Journey
                  </span>
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Centralize, validate, and showcase your academic achievements. 
                  Build verified portfolios that boost placements and admissions 
                  while simplifying institutional reporting.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-white/30 text-white hover:bg-white/10 px-8"
                    >
                      View Demo Portfolio
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="animate-slide-up">
                <img 
                  src={heroImage} 
                  alt="Smart Student Hub - Academic Excellence Platform"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Smart Student Hub?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering students with comprehensive achievement management 
              and faculty with streamlined validation processes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 card-gradient border-border/50 hover:card-elevated transition-all duration-300 group"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students already building their verified digital portfolios 
            and advancing their careers with Smart Student Hub.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="px-8">
              Start Building Your Portfolio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};