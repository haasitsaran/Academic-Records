import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, Award, Clock, CheckCircle, Users, Bot, Calendar, Tag, Trash2 } from "lucide-react";

interface Teacher {
  user_id: string;
  full_name: string;
  department?: string;
  designation?: string;
}

export function AchievementUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [verificationMethod, setVerificationMethod] = useState<'teacher' | 'ml_model'>('teacher');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    category: '',
    date: '',
    description: '',
    points: ''
  });

  const achievementTypes = [
    "Academic Excellence",
    "Research Publication", 
    "Project Completion",
    "Certification",
    "Competition Winner",
    "Leadership Role",
    "Community Service",
    "Internship",
    "Workshop Attendance",
    "Technical Skill"
  ];

  const categories = [
    "Academic",
    "Technical", 
    "Leadership",
    "Research",
    "Extracurricular",
    "Professional Development",
    "Community Service",
    "Sports & Fitness",
    "Arts & Culture",
    "Entrepreneurship"
  ];

  const suggestedTags = [
    "Programming", "Research", "Leadership", "Teamwork", "Innovation",
    "Problem Solving", "Communication", "Project Management", "Data Analysis",
    "Machine Learning", "Web Development", "Database", "Cybersecurity"
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          department,
          teachers(designation)
        `)
        .eq('role', 'teacher');

      if (error) throw error;
      
      const formattedTeachers = data?.map(teacher => ({
        user_id: teacher.user_id,
        full_name: teacher.full_name,
        department: teacher.department,
        designation: teacher.teachers?.[0]?.designation
      })) || [];
      
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPG, or PNG files only.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit achievements.",
        variant: "destructive"
      });
      return;
    }

    if (verificationMethod === 'teacher' && !selectedTeacher) {
      toast({
        title: "Teacher Required",
        description: "Please select a teacher for verification.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let certificateUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        setUploadProgress(30);
        certificateUrl = await uploadFile(selectedFile, user.id);
        setUploadProgress(60);
      }

      const achievementData = {
        student_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        achievement_type: formData.type,
        date_achieved: formData.date,
        points: parseInt(formData.points) || 0,
        verification_method: verificationMethod,
        assigned_teacher_id: verificationMethod === 'teacher' ? selectedTeacher : null,
        status: 'pending' as const,
        certificate_url: certificateUrl,
        skills: selectedTags
      };

      setUploadProgress(80);

      const { error } = await supabase
        .from('achievements')
        .insert(achievementData);

      if (error) throw error;

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "Achievement Submitted!",
          description: verificationMethod === 'teacher' 
            ? "Your achievement has been sent to the selected teacher for review."
            : "Your achievement is being processed by our AI verification system.",
        });
        
        // Reset form
        setFormData({
          title: '',
          type: '',
          category: '',
          date: '',
          description: '',
          points: ''
        });
        setSelectedTags([]);
        setSelectedTeacher('');
        setSelectedFile(null);
      }, 500);

    } catch (error) {
      console.error('Error submitting achievement:', error);
      setIsUploading(false);
      toast({
        title: "Submission Failed",
        description: "Failed to submit achievement. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Add New Achievement
        </h1>
        <p className="text-muted-foreground">
          Upload and validate your academic and professional accomplishments
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Achievement Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter achievement title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Achievement Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {achievementTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Achievement Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input 
                      id="points" 
                      type="number"
                      placeholder="Achievement points"
                      value={formData.points}
                      onChange={(e) => setFormData({...formData, points: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your achievement in detail..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Verification Method Selection */}
                <div className="space-y-4">
                  <Label>Verification Method</Label>
                  <RadioGroup 
                    value={verificationMethod} 
                    onValueChange={(value: 'teacher' | 'ml_model') => setVerificationMethod(value)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="teacher" id="teacher" className="mt-1" />
                      <div className="flex-1">
                        <label htmlFor="teacher" className="flex items-center gap-2 font-medium cursor-pointer">
                          <Users className="h-4 w-4" />
                          Teacher Verification
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          A faculty member will review and verify your achievement
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="ml_model" id="ml_model" className="mt-1" />
                      <div className="flex-1">
                        <label htmlFor="ml_model" className="flex items-center gap-2 font-medium cursor-pointer">
                          <Bot className="h-4 w-4" />
                          AI Verification
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Our AI system will automatically verify your achievement
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Teacher Selection */}
                {verificationMethod === 'teacher' && (
                  <div className="space-y-2">
                    <Label>Select Teacher for Verification</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.user_id} value={teacher.user_id}>
                            <div className="flex flex-col text-left">
                              <span>{teacher.full_name}</span>
                              {teacher.department && (
                                <span className="text-xs text-muted-foreground">
                                  {teacher.designation} - {teacher.department}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {teachers.length === 0 && (
                      <p className="text-sm text-muted-foreground">No teachers found. Please contact your administrator.</p>
                    )}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Supporting Documents</h3>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supported formats: PDF, JPG, PNG (Max 10MB each)
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading files...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Skills & Tags</h3>
                
                <div>
                  <Label>Selected Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Suggested Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedTags.map((tag) => (
                      <Badge 
                        key={tag}
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addTag(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" disabled={isUploading} className="flex-1">
                  {isUploading ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button type="button" variant="outline" className="flex-1 sm:flex-none">
                  Save Draft
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upload Guidelines */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Upload Guidelines</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Certificate Required</p>
                  <p className="text-muted-foreground">Upload official certificates or proof documents</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Accurate Dates</p>
                  <p className="text-muted-foreground">Ensure dates match your certificates</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Verification Process</p>
                  <p className="text-muted-foreground">Choose between teacher or AI verification</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Submissions */}
          <Card className="p-4 md:p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">Data Science Course</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Badge variant="outline" className="ml-2 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">Hackathon Winner</p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
                <Badge variant="outline" className="ml-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}