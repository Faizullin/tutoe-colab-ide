"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { FormattedMessage } from "react-intl";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <Badge variant="secondary" className="mb-4">
            <FormattedMessage
              id="welcome"
              defaultMessage="Welcome to Tutor Colab IDE"
            />
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <FormattedMessage
              id="modern_code_editor"
              defaultMessage="Modern Code {editor}"
              values={{
                editor: (
                  <span className="text-primary">
                    <FormattedMessage id="editor" defaultMessage="Editor" />
                  </span>
                ),
              }}
            />
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            <FormattedMessage
              id="hero_description"
              defaultMessage="A powerful code editor with smart suggestions to help you write code more efficiently."
            />
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/posts" passHref>
              <Button asChild size="lg" className="group">
                <span>
                  <FormattedMessage
                    id="get_started"
                    defaultMessage="Get Started"
                  />
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link href="/editor/demo" passHref>
              <Button asChild variant="outline" size="lg">
                <span>
                  <FormattedMessage id="view_demo" defaultMessage="View Demo" />
                </span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              <FormattedMessage
                id="visualization"
                defaultMessage="Visualization"
              />
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              <FormattedMessage
                id="multi_language_support"
                defaultMessage="Multi-language support"
              />
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              <FormattedMessage
                id="secure_environment"
                defaultMessage="Secure environment"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        {/* <section className="mb-20">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to code better</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed to make your coding workflow smoother and more productive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Code Completion</CardTitle>
                <CardDescription>
                  Get intelligent suggestions as you type with context-aware completions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Code Converter</CardTitle>
                <CardDescription>Convert your code between different programming languages instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Get help with debugging, optimization, and code explanations</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-12">
              <Badge variant="secondary" className="mb-4">
                <FormattedMessage
                  id="ready_to_get_started"
                  defaultMessage="Ready to get started?"
                />
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <FormattedMessage
                  id="try_today"
                  defaultMessage="Try TutorIDE today"
                />
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                <FormattedMessage
                  id="cta_description"
                  defaultMessage="Experience the future of coding with our intelligent editor. Start writing better code in minutes."
                />
              </p>

              <Link href="/editor/demo" passHref>
                <Button asChild size="lg" className="group">
                  <span>
                    <FormattedMessage
                      id="start_coding"
                      defaultMessage="Start Coding"
                    />
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
