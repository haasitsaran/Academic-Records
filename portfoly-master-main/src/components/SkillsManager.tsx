import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Code, Database, Globe, Smartphone, Settings, BarChart } from 'lucide-react';

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: string;
  is_technical: boolean;
}

const PREDEFINED_SKILLS = [
  { name: 'JavaScript', icon: Code, category: 'Programming' },
  { name: 'Python', icon: Code, category: 'Programming' },
  { name: 'Java', icon: Code, category: 'Programming' },
  { name: 'C++', icon: Code, category: 'Programming' },
  { name: 'React', icon: Globe, category: 'Web Development' },
  { name: 'Vue.js', icon: Globe, category: 'Web Development' },
  { name: 'Angular', icon: Globe, category: 'Web Development' },
  { name: 'Node.js', icon: Settings, category: 'Backend' },
  { name: 'Express.js', icon: Settings, category: 'Backend' },
  { name: 'Django', icon: Settings, category: 'Backend' },
  { name: 'Flask', icon: Settings, category: 'Backend' },
  { name: 'MySQL', icon: Database, category: 'Database' },
  { name: 'PostgreSQL', icon: Database, category: 'Database' },
  { name: 'MongoDB', icon: Database, category: 'Database' },
  { name: 'Redis', icon: Database, category: 'Database' },
  { name: 'React Native', icon: Smartphone, category: 'Mobile' },
  { name: 'Flutter', icon: Smartphone, category: 'Mobile' },
  { name: 'Swift', icon: Smartphone, category: 'Mobile' },
  { name: 'Kotlin', icon: Smartphone, category: 'Mobile' },
  { name: 'Machine Learning', icon: BarChart, category: 'AI/ML' },
  { name: 'Data Science', icon: BarChart, category: 'AI/ML' },
  { name: 'TensorFlow', icon: BarChart, category: 'AI/ML' },
  { name: 'PyTorch', icon: BarChart, category: 'AI/ML' }
];

const PROFICIENCY_COLORS = {
  'Beginner': 'bg-yellow-500',
  'Intermediate': 'bg-blue-500',
  'Advanced': 'bg-green-500',
  'Expert': 'bg-purple-500'
};

export const SkillsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<string>('Beginner');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (user) {
      fetchSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skillName: string, proficiencyLevel: string) => {
    try {
      const { error } = await supabase
        .from('student_skills')
        .insert({
          student_id: user?.id,
          skill_name: skillName,
          proficiency_level: proficiencyLevel,
          is_technical: true
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Skill Already Added",
            description: "This skill is already in your profile.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Skill Added",
        description: `${skillName} has been added to your profile.`
      });

      fetchSkills();
      setNewSkillName('');
      setNewSkillLevel('Beginner');
      setShowAddSkill(false);
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill.",
        variant: "destructive"
      });
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('student_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      toast({
        title: "Skill Removed",
        description: "Skill has been removed from your profile."
      });

      fetchSkills();
    } catch (error) {
      console.error('Error removing skill:', error);
      toast({
        title: "Error",
        description: "Failed to remove skill.",
        variant: "destructive"
      });
    }
  };

  const updateSkillLevel = async (skillId: string, newLevel: string) => {
    try {
      const { error } = await supabase
        .from('student_skills')
        .update({ proficiency_level: newLevel })
        .eq('id', skillId);

      if (error) throw error;

      toast({
        title: "Skill Updated",
        description: "Skill proficiency level has been updated."
      });

      fetchSkills();
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({
        title: "Error",
        description: "Failed to update skill level.",
        variant: "destructive"
      });
    }
  };

  const getSkillCategory = (skillName: string) => {
    const skill = PREDEFINED_SKILLS.find(s => s.name === skillName);
    return skill?.category || 'Other';
  };

  const categories = ['All', ...new Set(PREDEFINED_SKILLS.map(s => s.category)), 'Other'];
  const filteredSkills = selectedCategory === 'All' 
    ? skills 
    : skills.filter(skill => getSkillCategory(skill.skill_name) === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Technical Skills
          </CardTitle>
          <Button 
            onClick={() => setShowAddSkill(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Skill Form */}
        {showAddSkill && (
          <Card className="p-4 border-dashed">
            <div className="space-y-4">
              <h4 className="font-medium">Add New Skill</h4>
              
              {/* Predefined Skills Grid */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Quick Add</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {PREDEFINED_SKILLS
                    .filter(skill => !skills.some(s => s.skill_name === skill.name))
                    .map((skill, index) => {
                      const IconComponent = skill.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill(skill.name, newSkillLevel)}
                          className="flex items-center gap-2 justify-start p-2 h-auto"
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="text-xs">{skill.name}</span>
                        </Button>
                      );
                    })}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-2 block">Or Add Custom Skill</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter skill name"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newSkillLevel} onValueChange={(value: any) => setNewSkillLevel(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => addSkill(newSkillName, newSkillLevel)}
                    disabled={!newSkillName.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddSkill(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Skills List */}
        {filteredSkills.length > 0 ? (
          <div className="space-y-4">
            {categories.filter(cat => cat !== 'All').map(category => {
              const categorySkills = filteredSkills.filter(skill => 
                category === 'Other' 
                  ? !PREDEFINED_SKILLS.some(ps => ps.name === skill.skill_name)
                  : getSkillCategory(skill.skill_name) === category
              );
              
              if (categorySkills.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {PREDEFINED_SKILLS.find(ps => ps.name === skill.skill_name)?.icon && (
                              <div className="p-1">
                                {(() => {
                                  const IconComponent = PREDEFINED_SKILLS.find(ps => ps.name === skill.skill_name)?.icon;
                                  return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
                                })()}
                              </div>
                            )}
                            <span className="font-medium">{skill.skill_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={skill.proficiency_level} 
                            onValueChange={(value) => updateSkillLevel(skill.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Skills Added</h3>
            <p className="text-muted-foreground mb-4">Start by adding your technical skills to showcase your expertise</p>
            <Button onClick={() => setShowAddSkill(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Skill
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};