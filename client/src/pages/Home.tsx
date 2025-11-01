import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { Sparkles, Pencil, Zap, Users } from 'lucide-react';
import heroImage from '@assets/generated_images/Hero_workspace_background_13d2c8d4.png';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-background/20 backdrop-blur-md border-white/20 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Writing
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Unleash Your Stories
            <br />
            <span className="text-primary">with AI-Powered Writing</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Create, enhance, and share your blog posts with intelligent AI assistance. 
            Turn your ideas into compelling stories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <Link href="/write" data-testid="link-start-writing">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Pencil className="mr-2 h-5 w-5" />
                  Start Writing
                </Button>
              </Link>
            ) : (
              <Link href="/register" data-testid="link-get-started">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
            )}
            <Link href="/explore" data-testid="link-explore-posts">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-background/30">
                Explore Posts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How BlogFusion Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to enhance your writing and reach your audience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="hover-elevate transition-all">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Writing Assistant</h3>
                <p className="text-muted-foreground">
                  Get intelligent suggestions, grammar fixes, and style improvements as you write
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Editing</h3>
                <p className="text-muted-foreground">
                  Expand ideas, summarize content, and adjust tone with AI-powered tools
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Share & Connect</h3>
                <p className="text-muted-foreground">
                  Publish your stories and connect with readers who love your content
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Writing?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of writers using AI to create amazing content
          </p>
          {!user && (
            <Link href="/register" data-testid="link-join-now">
              <Button size="lg" className="text-lg px-8 py-6">
                Join BlogFusion Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
