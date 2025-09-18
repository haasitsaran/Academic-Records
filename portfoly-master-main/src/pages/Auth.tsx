import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { user, profile, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: '' as 'student' | 'teacher' | 'recruiter' | '',
    rollNumber: '',
    employeeId: '',
    department: '',
    // Enhanced student fields
    technicalSkills: [] as string[],
    interests: [] as string[],
    careerGoals: '',
    bio: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  if (user && profile) {
    return <Navigate to={profile.role === 'student' ? '/dashboard' : '/faculty'} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Successfully logged in."
      });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (!signupData.role) {
      toast({
        title: "Role Required",
        description: "Please select a role.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const additionalData: any = {
      phone: signupData.phone
    };
    
    if (signupData.role === 'student') {
      if (signupData.rollNumber) additionalData.roll_number = signupData.rollNumber;
      additionalData.technical_skills = signupData.technicalSkills.join(',');
      additionalData.interests = signupData.interests.join(',');
      additionalData.career_goals = signupData.careerGoals;
    }
    if (signupData.role === 'teacher' && signupData.employeeId) {
      additionalData.employee_id = signupData.employeeId;
    }

    // Recruiter: demo flow without auth persistence
    if (signupData.role === 'recruiter') {
      toast({ title: "Welcome, Recruiter!", description: "Redirecting to recruiter dashboard..." });
      setLoading(false);
      navigate('/recruiter');
      return;
    }

    const { error } = await signUp(
      signupData.email, 
      signupData.password, 
      signupData.fullName, 
      signupData.role as 'student' | 'teacher',
      additionalData
    );

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account."
      });
    }
    setLoading(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !signupData.technicalSkills.includes(newSkill.trim())) {
      setSignupData({
        ...signupData,
        technicalSkills: [...signupData.technicalSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSignupData({
      ...signupData,
      technicalSkills: signupData.technicalSkills.filter(s => s !== skill)
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !signupData.interests.includes(newInterest.trim())) {
      setSignupData({
        ...signupData,
        interests: [...signupData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setSignupData({
      ...signupData,
      interests: signupData.interests.filter(i => i !== interest)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Team Pinnacle</h1>
          <p className="text-muted-foreground">Access your academic journey</p>
        </div>

        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join Team Pinnacle</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">I am a</Label>
                    <Select value={signupData.role} onValueChange={(value: 'student' | 'teacher' | 'recruiter') => setSignupData({...signupData, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Student
                          </div>
                        </SelectItem>
                        <SelectItem value="teacher">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Teacher
                          </div>
                        </SelectItem>
                        <SelectItem value="recruiter">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Recruiter (Demo)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                    />
                  </div>

                  {signupData.role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="roll-number">Roll Number</Label>
                        <Input
                          id="roll-number"
                          placeholder="Enter your roll number"
                          value={signupData.rollNumber}
                          onChange={(e) => setSignupData({...signupData, rollNumber: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Personal Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={signupData.bio}
                          onChange={(e) => setSignupData({...signupData, bio: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="career-goals">Career Goals</Label>
                        <Textarea
                          id="career-goals"
                          placeholder="What are your career aspirations?"
                          value={signupData.careerGoals}
                          onChange={(e) => setSignupData({...signupData, careerGoals: e.target.value})}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Technical Skills</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a technical skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          />
                          <Button type="button" onClick={addSkill} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {signupData.technicalSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Interests</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add an interest"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                          />
                          <Button type="button" onClick={addInterest} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {signupData.interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {interest}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {signupData.role === 'teacher' && (
                    <div className="space-y-2">
                      <Label htmlFor="employee-id">Employee ID</Label>
                      <Input
                        id="employee-id"
                        placeholder="Enter your employee ID"
                        value={signupData.employeeId}
                        onChange={(e) => setSignupData({...signupData, employeeId: e.target.value})}
                      />
                    </div>
                  )}
                  {signupData.role === 'recruiter' && (
                    <div className="text-sm text-muted-foreground">
                      No verification needed for demo. You will be redirected to the Recruiter dashboard on signup.
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;