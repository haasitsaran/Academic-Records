import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Compass, Target, Lightbulb, TrendingUp, Plus, X } from 'lucide-react';

interface CareerPreferences {
  id: string;
  interests: string[];
  skills: string[];
  preferred_industries: string[];
  career_goals: string;
}

interface CareerSuggestion {
  id: string;
  suggested_career: string;
  match_percentage: number;
  reasoning: string;
  required_skills: string[];
  suggested_courses: string[];
}

export function CareerSuggestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CareerPreferences | null>(null);
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  
  const [formData, setFormData] = useState({
    interests: [] as string[],
    skills: [] as string[],
    preferred_industries: [] as string[],
    career_goals: '',
    newInterest: '',
    newSkill: '',
    newIndustry: ''
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchSuggestions();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('career_preferences')
        .select('*')
        .eq('student_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences(data);
        setFormData({
          interests: data.interests || [],
          skills: data.skills || [],
          preferred_industries: data.preferred_industries || [],
          career_goals: data.career_goals || '',
          newInterest: '',
          newSkill: '',
          newIndustry: ''
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('career_suggestions')
        .select('*')
        .eq('student_id', user?.id)
        .order('match_percentage', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const preferencesData = {
        student_id: user?.id,
        interests: formData.interests,
        skills: formData.skills,
        preferred_industries: formData.preferred_industries,
        career_goals: formData.career_goals
      };

      const { error } = preferences
        ? await supabase
            .from('career_preferences')
            .update(preferencesData)
            .eq('id', preferences.id)
        : await supabase
            .from('career_preferences')
            .insert(preferencesData);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your career preferences have been saved successfully."
      });

      setEditingPreferences(false);
      fetchPreferences();
      generateSuggestions();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('generate-career-suggestions', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Career Suggestions Generated",
        description: "AI-powered career suggestions have been created based on your profile."
      });
      
      fetchSuggestions();
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate career suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'interests' | 'skills' | 'preferred_industries', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()],
        [`new${type.charAt(0).toUpperCase() + type.slice(1, -1)}`]: ''
      }));
    }
  };

  const removeItem = (type: 'interests' | 'skills' | 'preferred_industries', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="h-6 w-6" />
            Career Guidance
          </h2>
          <p className="text-muted-foreground">Discover your ideal career path</p>
        </div>
        
        {!editingPreferences && (
          <Button onClick={() => setEditingPreferences(true)}>
            <Target className="h-4 w-4 mr-2" />
            {preferences ? 'Update Preferences' : 'Set Preferences'}
          </Button>
        )}
      </div>

      {/* Career Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Career Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingPreferences ? (
            <div className="space-y-6">
              {/* Interests */}
              <div>
                <Label>Interests</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add an interest"
                    value={formData.newInterest}
                    onChange={(e) => setFormData({...formData, newInterest: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('interests', formData.newInterest))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('interests', formData.newInterest)}
                    disabled={!formData.newInterest.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <button onClick={() => removeItem('interests', index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label>Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a skill"
                    value={formData.newSkill}
                    onChange={(e) => setFormData({...formData, newSkill: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skills', formData.newSkill))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('skills', formData.newSkill)}
                    disabled={!formData.newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => removeItem('skills', index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <Label>Preferred Industries</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add an industry"
                    value={formData.newIndustry}
                    onChange={(e) => setFormData({...formData, newIndustry: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('preferred_industries', formData.newIndustry))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addItem('preferred_industries', formData.newIndustry)}
                    disabled={!formData.newIndustry.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_industries.map((industry, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {industry}
                      <button onClick={() => removeItem('preferred_industries', index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Career Goals */}
              <div>
                <Label htmlFor="career-goals">Career Goals</Label>
                <Textarea
                  id="career-goals"
                  placeholder="Describe your career aspirations and goals..."
                  value={formData.career_goals}
                  onChange={(e) => setFormData({...formData, career_goals: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSavePreferences}>Save Preferences</Button>
                <Button variant="outline" onClick={() => setEditingPreferences(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : preferences ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Preferred Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.preferred_industries.map((industry, index) => (
                    <Badge key={index} variant="outline">{industry}</Badge>
                  ))}
                </div>
              </div>
              
              {preferences.career_goals && (
                <div>
                  <h4 className="font-medium mb-2">Career Goals</h4>
                  <p className="text-muted-foreground">{preferences.career_goals}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Set Your Career Preferences</h3>
              <p className="text-muted-foreground mb-4">Help us understand your interests and goals to provide personalized career suggestions</p>
              <Button onClick={() => setEditingPreferences(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Set Preferences
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Career Suggestions</h3>
            <Badge variant="outline">{suggestions.length} matches found</Badge>
          </div>
          
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle className="text-lg">{suggestion.suggested_career}</CardTitle>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">{suggestion.match_percentage}% match</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{suggestion.reasoning}</p>
                  
                  <div>
                    <h4 className="font-medium mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.required_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Suggested Courses</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.suggested_courses.map((course, index) => (
                        <Badge key={index} variant="outline">{course}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {preferences && suggestions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generate Career Suggestions</h3>
            <p className="text-muted-foreground mb-4">Based on your preferences, we can suggest ideal career paths</p>
            <Button onClick={generateSuggestions}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Get Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}