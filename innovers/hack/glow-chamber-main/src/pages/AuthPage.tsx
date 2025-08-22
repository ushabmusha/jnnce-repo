import { useState } from 'react';
import { ArrowLeft, FileText, User, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { seedTestData } from '@/utils/seedData';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Separate form states for user and admin
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (role: 'user' | 'admin') => {
    const formData = role === 'user' ? userFormData : adminFormData;

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const success = await login(formData.email, formData.password, role);
    if (success) {
      toast({
        title: "Login Successful!",
        description: `Welcome back! Redirecting to your ${role} dashboard.`,
        className: "bg-success text-success-foreground"
      });
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }, 1500);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or account doesn't exist for this role.",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (role: 'user' | 'admin') => {
    const formData = role === 'user' ? userFormData : adminFormData;

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const success = await register(formData.name, formData.email, formData.password, role);
    if (success) {
      toast({
        title: "Registration Successful!",
        description: `Welcome to PDFRooms! Redirecting to your ${role} dashboard.`,
        className: "bg-success text-success-foreground"
      });
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }, 1500);
    } else {
      toast({
        title: "Registration Failed",
        description: "An account with this email already exists for this role.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="border-white/20 text-white hover:bg-white hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">PDFRooms</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80 text-lg">Choose your role to get started</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                seedTestData();
                toast({
                  title: "Test Data Loaded!",
                  description: "Demo accounts and classroom created. Check console for credentials.",
                  className: "bg-success text-success-foreground"
                });
              }}
              className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Load Demo Data
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Authentication */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">User Access</CardTitle>
                <CardDescription className="text-white/70">
                  Join rooms and access shared PDF documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      Register
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={userFormData.email}
                        onChange={handleUserInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="user-password"
                          name="password"
                          type={showUserPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={userFormData.password}
                          onChange={handleUserInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                          onClick={() => setShowUserPassword(!showUserPassword)}
                        >
                          {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-accent hover:bg-accent-hover"
                      onClick={() => handleLogin('user')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Login as User'}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name</Label>
                      <Input
                        id="user-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={userFormData.name}
                        onChange={handleUserInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-reg-email">Email</Label>
                      <Input
                        id="user-reg-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={userFormData.email}
                        onChange={handleUserInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="user-reg-password"
                          name="password"
                          type={showUserPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={userFormData.password}
                          onChange={handleUserInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                          onClick={() => setShowUserPassword(!showUserPassword)}
                        >
                          {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-accent hover:bg-accent-hover"
                      onClick={() => handleRegister('user')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Register as User'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Admin Authentication */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Admin Access</CardTitle>
                <CardDescription className="text-white/70">
                  Manage rooms, upload PDFs, and view analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                      Register
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your admin email"
                        value={adminFormData.email}
                        onChange={handleAdminInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          name="password"
                          type={showAdminPassword ? "text" : "password"}
                          placeholder="Enter your admin password"
                          value={adminFormData.password}
                          onChange={handleAdminInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary-hover"
                      onClick={() => handleLogin('admin')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Login as Admin'}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Full Name</Label>
                      <Input
                        id="admin-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={adminFormData.name}
                        onChange={handleAdminInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-reg-email">Email</Label>
                      <Input
                        id="admin-reg-email"
                        name="email"
                        type="email"
                        placeholder="Enter your admin email"
                        value={adminFormData.email}
                        onChange={handleAdminInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="admin-reg-password"
                          name="password"
                          type={showAdminPassword ? "text" : "password"}
                          placeholder="Create an admin password"
                          value={adminFormData.password}
                          onChange={handleAdminInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary-hover"
                      onClick={() => handleRegister('admin')}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Register as Admin'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}