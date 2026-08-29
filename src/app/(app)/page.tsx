import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-evenly items-center h-screen">

      <Card className="w-full max-w-sm">

        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>

          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>

          <CardAction>
            <Button
              variant="link"
              >
              <Link href="/sign-in">Sign-in</Link>
            </Button>
          </CardAction>

        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="abc@example.com"
                />
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label>Password</Label>
                <Button variant="link" className="text-muted-foreground w-min">Forget your Password</Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full gap-2">
            <Button>Login</Button>
            <Button variant="outline">Login with Google</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
