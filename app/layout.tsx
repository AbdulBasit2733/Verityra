import { Plus_Jakarta_Sans, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider"
import { ErrorDialogProvider } from "@/components/providers/error-dialog-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import Script from "next/script"

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
    "Next-generation evaluation cloud for subjective examinations. Authentic pen-and-paper answer booklets, instant AI rubric grading, and 3-attempt diagnostic mastery.",
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
      <body className="min-h-screen bg-background text-foreground font-sans">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <ThemeProvider>
          <AuthProvider>
            <ConfirmDialogProvider>
              <ErrorDialogProvider>
                {children}
                <Toaster />
              </ErrorDialogProvider>
            </ConfirmDialogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

