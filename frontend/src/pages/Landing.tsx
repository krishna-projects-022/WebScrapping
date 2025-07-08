
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star,
  BarChart3,
  Globe,
  Lock,
  Workflow,
  Play,
  Menu,
  X
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Database,
      title: "Smart Data Integration",
      description: "Connect and sync data from multiple sources with our intelligent automation engine."
    },
    {
      icon: Workflow,
      title: "Visual Pipeline Builder",
      description: "Design complex data workflows with our intuitive drag-and-drop interface."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Process millions of records in real-time with our high-performance infrastructure."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance certifications."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Generate insights with built-in analytics and customizable reporting tools."
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Deploy worldwide with our distributed cloud infrastructure and 99.9% uptime."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Data Engineer at TechCorp",
      content: "DataFlow Pro transformed our data pipeline. We reduced processing time by 80% and eliminated manual errors.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "CTO at StartupXYZ",
      content: "The visual pipeline builder is incredible. Our team can now create complex workflows without writing code.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Analytics Director at Enterprise Co",
      content: "Finally, a platform that scales with our needs. The real-time processing capabilities are game-changing.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      description: "Perfect for small teams getting started with data automation",
      features: [
        "Up to 10 data sources",
        "1M records/month",
        "Basic integrations",
        "Email support",
        "Standard templates"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$199",
      period: "per month",
      description: "Advanced features for growing businesses",
      features: [
        "Unlimited data sources",
        "10M records/month",
        "Custom integrations",
        "Priority support",
        "Advanced analytics",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "Tailored solution for large organizations",
      features: [
        "Unlimited everything",
        "Custom SLA",
        "Dedicated support",
        "On-premise option",
        "Custom development",
        "Training & onboarding"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-navy-800 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-navy-800">DataFlow Pro</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-navy-800 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-navy-800 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-navy-800 transition-colors">Pricing</a>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button className="bg-navy-800 hover:bg-navy-700" onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-navy-800 transition-colors">Features</a>
                <a href="#testimonials" className="text-gray-600 hover:text-navy-800 transition-colors">Testimonials</a>
                <a href="#pricing" className="text-gray-600 hover:text-navy-800 transition-colors">Pricing</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="outline" onClick={() => navigate('/login')} size="sm">
                    Sign In
                  </Button>
                  <Button className="bg-navy-800 hover:bg-navy-700" onClick={() => navigate('/login')} size="sm">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 gradient-navy-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="secondary" className="mb-6">
                🚀 Trusted by 10,000+ companies worldwide
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Automate Your Data Workflows with
                <span className="text-teal-300"> Intelligence</span>
              </h1>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                Transform raw data into actionable insights with our powerful automation platform. 
                Build, deploy, and scale data pipelines without writing code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-navy-800 hover:bg-gray-100 text-lg px-8"
                  onClick={() => navigate('/login')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-navy-800 text-lg px-8"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-teal-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fade-in">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
                  alt="Data Dashboard"
                  className="rounded-lg w-full"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Processing 1.2M records/sec</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-800 mb-4">
              Powerful Features for Modern Data Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, deploy, and manage data pipelines at scale
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 animate-fade-in border-0 shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-xl text-navy-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-800 mb-4">
              Loved by Data Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about DataFlow Pro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-navy-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your team
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-shadow duration-300 animate-fade-in ${
                plan.popular ? 'border-2 border-teal-500 scale-105' : ''
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-navy-800">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-navy-800">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-teal-600 hover:bg-teal-700' 
                        : 'bg-navy-800 hover:bg-navy-700'
                    }`}
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-navy-teal">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Data Workflows?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of companies already using DataFlow Pro to automate their data processes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-navy-800 hover:bg-gray-100 text-lg px-8"
              onClick={() => navigate('/login')}
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-navy-800 text-lg px-8"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-teal-600 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">DataFlow Pro</span>
              </div>
              <p className="text-gray-300">
                The leading platform for data automation and workflow management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">
              © 2024 DataFlow Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
