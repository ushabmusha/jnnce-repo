import { useState } from 'react';
import { ArrowRight, FileText, Users, Shield, Zap, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: FileText,
      title: "PDF Management",
      description: "Upload, share, and manage PDF documents with advanced viewing capabilities"
    },
    {
      icon: Users,
      title: "Room-Based Sharing",
      description: "Create private rooms with unique passkeys for secure document sharing"
    },
    {
      icon: Shield,
      title: "Admin Controls",
      description: "Comprehensive admin panel with user management and analytics"
    },
    {
      icon: Zap,
      title: "Real-time Analytics",
      description: "Track views, engagement, and user statistics in real-time"
    }
  ];

  const plans = [
    {
      name: "Free Trial",
      price: "Free",
      duration: "14 days",
      features: [
        "Up to 3 rooms",
        "5 PDF uploads",
        "Basic analytics",
        "Email support"
      ],
      popular: false,
      action: () => navigate('/auth')
    },
    {
      name: "Pro Membership",
      price: "$29",
      duration: "per month",
      features: [
        "Unlimited rooms",
        "Unlimited PDF uploads",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "API access"
      ],
      popular: true,
      action: () => navigate('/auth')
    },
    {
      name: "Enterprise",
      price: "Custom",
      duration: "contact us",
      features: [
        "Everything in Pro",
        "SSO integration",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee"
      ],
      popular: false,
      action: () => navigate('/auth')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PDFRooms
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-hero">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Share PDFs Securely
              <br />
              <span className="text-accent">In Private Rooms</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create secure rooms, upload PDFs, and manage document access with powerful admin controls 
              and real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold shadow-xl"
                onClick={() => navigate('/auth')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Start Free Trial
                <ArrowRight className={`ml-2 w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg"
                onClick={() => navigate('/auth')}
              >
                Get Membership
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage and share PDF documents securely
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with our free trial or unlock premium features with our membership plans
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? 'border-primary shadow-glow animate-glow' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/{plan.duration}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  <Button 
                    className={`w-full mt-8 ${plan.popular ? 'bg-gradient-primary hover:opacity-90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={plan.action}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust PDFRooms for secure document sharing
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold"
            onClick={() => navigate('/auth')}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PDFRooms
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 PDFRooms. All rights reserved. Secure document sharing made simple.
          </p>
        </div>
      </footer>
    </div>
  );
}