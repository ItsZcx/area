'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withGuest from "@/lib/withGuest";
import { ArrowRight, BarChart, Download, Globe, Lock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Home() {

  return (
    <>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Automate Your Workflow with AREA
                </h1>
                <p className="mx-auto max-w-[700px] text-neutral-500 md:text-xl dark:text-neutral-400">
                  Connect your favorite apps and automate your work. Save time and boost productivity with AREA.
                </p>
              </div>
              <Link href="/auth/register">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-100 dark:bg-neutral-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Globe className="h-10 w-10 mb-4" />
                  <CardTitle>Connect Any App</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Integrate with a wide range of apps and services. New integrations are continuously added to expand your automation possibilities.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 mb-4" />
                  <CardTitle>Easy Automation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create powerful automations with our intuitive drag-and-drop interface. No coding required.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Lock className="h-10 w-10 mb-4" />
                  <CardTitle>Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Secure and reliable with 99.99% uptime. Your data and workflows are always safe and accessible.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Boost Your Productivity</h2>
                <p className="text-neutral-500 dark:text-neutral-400">
                  AREA helps you automate repetitive tasks, reduce errors, and focus on what matters most. Our users report saving an average of 5 hours per week.
                </p>
                <ul className="grid gap-2">
                  <li className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Increase efficiency by up to 80%</span>
                  </li>
                  <li className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Reduce manual errors by 95%</span>
                  </li>
                  <li className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Scale your operations effortlessly</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <Image
                  alt="Productivity chart"
                  src="/productivity-chart.webp"
                  height="310"
                  width="550"
                  className="overflow-hidden rounded-xl object-fill"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-neutral-100 dark:bg-neutral-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Download AREA for Android</h2>
                <p className="max-w-[900px] text-neutral-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-neutral-400">
                  Get the AREA app on your Android device and start automating on the go.
                </p>
              </div>
              {/* TODO: update path to apk */}
              <Link href="/area-app.apk" passHref>
                <Button size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download APK
                </Button>
              </Link>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Compatible with Android 7.0 and above
              </p>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Start Automating Today</h2>
                <p className="max-w-[900px] text-neutral-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-neutral-400">
                  Join thousands of businesses that use AREA to streamline their workflows and save time.
                </p>
              </div>
              <Link href="/auth/register">
                <Button size="lg">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">© 2024 AREA. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </>
  );
}

export default withGuest(Home);
