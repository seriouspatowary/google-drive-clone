"use client"

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { P, paragraphVariants } from '@/components/custom/p';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {RiGoogleFill, RiLoader3Fill} from  "@remixicon/react"
import { authClient } from '@/lib/better-auth/auth-client';
import { useToast } from '@/hooks/use-toast';


interface Props{
    action: "Sign In" | "Sign Up";

}

const AuthForm = ({ action }: Props) => {
    
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card className='w-96 drop-shadow-2xl'>
        <CardHeader>
              <CardTitle className={paragraphVariants({ size: 'large', weight: 'bold' })}>{ action}</CardTitle>
              <CardDescription>{action } to access you account</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
              <Button variant="lift" disabled={isLoading} onClick={async () => {
                  await authClient.signIn.social({
                      provider: "google",
                      callbackURL:"/dashboard"
                  }, {
                      onSuccess: () => {
                      toast({
                        title: "success",
                        description:"Redirecting to google signin page"
                        
                          })
                    },
                    onError: (c) => {
                      toast({
                      title: "Error",
                      description: c.error.message,
                      })
                    },
                    onRequest: () => {
                      setIsLoading(true);
                    },
                    onResponse: () => {
                      setIsLoading(false);
                    }
                  })
        }}>{!isLoading ? <RiGoogleFill /> :<RiLoader3Fill className='animate-spin'/>}{action} with google</Button>

              <P
          variant="muted"
          size="small"
          weight="light"
          className="w-full text-center"
        >
          {action === "Sign In" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="link">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="link">
                Sign In
              </Link>
            </>
          )}
        </P>
        </CardContent>
        
   </Card>

  )
}

export default AuthForm