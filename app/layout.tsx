import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider"
import { ErrorDialogProvider } from "@/components/providers/error-dialog-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata = {
  title: "Verityra — Premier Subjective Test Series & Evaluation",
  description:
    "Rigorous test preparation with handwritten answer sheets, official templates, detailed rubrics, and comprehensive performance feedback.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("antialiased", poppins.variable)}>
      <body className="min-h-screen bg-background text-foreground">
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

