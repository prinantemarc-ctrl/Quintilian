"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { UserIcon, LogOut, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push("/")
  }

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link href="/auth/login">Se connecter</Link>
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-transparent hover:bg-muted/50 h-10 px-3"
      >
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email} />
          <AvatarFallback className="text-xs">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-sm font-medium">{user.email?.split("@")[0]}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-full right-0 mt-1 z-50 shadow-lg border-border/60 min-w-[200px]">
            <CardContent className="p-2">
              <div className="flex items-center gap-3 p-2 border-b border-border/40 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="text-xs text-muted-foreground">Utilisateur connecté</span>
                </div>
              </div>

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2 h-auto py-2 px-3 font-normal"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/dashboard">
                    <UserIcon className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2 h-auto py-2 px-3 font-normal"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/dashboard/credits">
                    <UserIcon className="h-4 w-4" />
                    Mes crédits
                  </Link>
                </Button>

                <div className="border-t border-border/40 my-1" />

                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-2 h-auto py-2 px-3 font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
