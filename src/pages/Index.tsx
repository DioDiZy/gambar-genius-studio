
import { Navbar } from "@/components/Navbar";
import { CustomButton } from "@/components/ui/custom-button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Create Beautiful Images with 
                <span className="block gradient-text">AI-Powered Technology</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10">
                Transform your ideas into stunning visuals with our powerful AI image generator. 
                Type a prompt, click a button, and watch your imagination come to life.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <CustomButton variant="gradient" size="lg" className="text-base">
                    Get Started
                  </CustomButton>
                </Link>
                <Link to="#demo">
                  <CustomButton variant="outline" size="lg" className="text-base">
                    See Examples
                  </CustomButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-secondary">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-background rounded-lg p-6 shadow-sm">
                  <div className="h-12 w-12 bg-primary/10 text-primary flex items-center justify-center rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="demo" className="py-20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">See What's Possible</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examples.map((example, index) => (
                <div key={index} className="overflow-hidden rounded-lg">
                  <div className="aspect-[4/3] bg-accent/30 rounded-lg animate-pulse-slow"></div>
                  <p className="mt-3 text-sm text-center text-muted-foreground">{example}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-secondary">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pricing Plans</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-background rounded-lg overflow-hidden shadow-sm ${
                    plan.popular ? 'border-2 border-primary relative' : 'border border-muted'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-xs font-medium py-1 text-center">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <svg 
                            className="mr-2 h-4 w-4 text-primary" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup">
                      <CustomButton 
                        variant={plan.popular ? "gradient" : "outline"} 
                        className="w-full"
                      >
                        Get Started
                      </CustomButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-creative-gradient text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Amazing Images?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already transforming their ideas into beautiful visuals.
            </p>
            <Link to="/signup">
              <CustomButton variant="default" size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Creating Now
              </CustomButton>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <Link to="/" className="text-xl font-bold gradient-text">
                  PembuatGambar
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  © 2025 PembuatGambar. All rights reserved.
                </p>
              </div>
              <div className="flex gap-8">
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
                <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

// Mock data
const features = [
  {
    icon: <span className="text-xl">✨</span>,
    title: "High-Quality Images",
    description: "Generate stunning, high-resolution images that are ready to use in your projects."
  },
  {
    icon: <span className="text-xl">⚡</span>,
    title: "Fast Generation",
    description: "Get your images in seconds with our optimized AI generation engine."
  },
  {
    icon: <span className="text-xl">🎨</span>,
    title: "Customizable Styles",
    description: "Choose from various artistic styles to match your creative vision."
  },
  {
    icon: <span className="text-xl">💾</span>,
    title: "Save & Export",
    description: "Easily save your generated images and export them in multiple formats."
  },
  {
    icon: <span className="text-xl">📱</span>,
    title: "Mobile Friendly",
    description: "Create images on the go with our fully responsive mobile experience."
  },
  {
    icon: <span className="text-xl">🔄</span>,
    title: "Unlimited Variations",
    description: "Generate multiple variations of your ideas until you find the perfect one."
  }
];

const examples = [
  "A futuristic cityscape with flying cars and neon lights",
  "A serene mountain landscape at sunset with a reflective lake",
  "A photorealistic portrait of a fantasy character with magical elements",
  "An abstract representation of emotions using vibrant colors and shapes",
  "A detailed illustration of an underwater scene with exotic sea creatures",
  "A sci-fi robot assistant in a modern living room"
];

const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for trying out our platform",
    features: [
      "20 images per month",
      "Standard generation quality",
      "Basic editing tools",
      "5 saved images"
    ],
    popular: false
  },
  {
    name: "Pro",
    price: 15,
    description: "For individuals who need more power",
    features: [
      "200 images per month",
      "High-quality generation",
      "Advanced editing tools",
      "Unlimited saved images",
      "Priority processing"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 49,
    description: "For teams and professional use",
    features: [
      "Unlimited images",
      "Maximum quality generation",
      "All editing tools",
      "API access",
      "Dedicated support",
      "Commercial license"
    ],
    popular: false
  }
];

export default Index;
