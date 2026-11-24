import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider"
import { ErrorDialogProvider } from "@/components/providers/error-dialog-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import Script from "next/script"
import { SiteChrome } from "@/components/common/site-chrome"
import { BRAND_CONFIG } from "@/lib/brand"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata = {
  title: BRAND_CONFIG.title,
  description: BRAND_CONFIG.description,
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
      className={cn("antialiased", poppins.variable)}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans text-foreground"
      >
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
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
