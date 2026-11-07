import { Plus_Jakarta_Sans, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider"
import { ErrorDialogProvider } from "@/components/providers/error-dialog-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import Script from "next/script"
import { SiteChrome } from "@/components/common/site-chrome"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata = {
  title: "Verityra — Premier Subjective Test Series & Evaluation Cloud",
  description:
    "A high-integrity subjective test series for authentic pen-and-paper practice, rubric feedback, and three-attempt diagnostic mastery.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", plusJakartaSans.variable, inter.variable)}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <ThemeProvider>
          <AuthProvider>
            <ConfirmDialogProvider>
              <ErrorDialogProvider>
                <SiteChrome>{children}</SiteChrome>
                <Toaster />
              </ErrorDialogProvider>
            </ConfirmDialogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
