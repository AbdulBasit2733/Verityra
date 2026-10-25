"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

/**
 * AdaptiveDialog - Renders Dialog on desktop (≥1024px), Drawer on mobile (<1024px)
 *
 * This component automatically adapts based on viewport size:
 * - Desktop: Centered modal dialog with backdrop blur
 * - Mobile: Bottom sheet drawer with swipe-to-dismiss
 *
 * Usage:
 * ```tsx
 * <AdaptiveDialog open={open} onOpenChange={setOpen}>
 *   <AdaptiveDialogTrigger asChild>
 *     <Button>Open</Button>
 *   </AdaptiveDialogTrigger>
 *   <AdaptiveDialogContent>
 *     <AdaptiveDialogHeader>
 *       <AdaptiveDialogTitle>Title</AdaptiveDialogTitle>
 *       <AdaptiveDialogDescription>Description</AdaptiveDialogDescription>
 *     </AdaptiveDialogHeader>
 *     <div>Content</div>
 *     <AdaptiveDialogFooter>
 *       <Button>Action</Button>
 *     </AdaptiveDialogFooter>
 *   </AdaptiveDialogContent>
 * </AdaptiveDialog>
 * ```
 */

interface BaseProps {
  children: React.ReactNode
}

interface RootAdaptiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const AdaptiveDialog = ({ children, open, onOpenChange }: RootAdaptiveDialogProps) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render Dialog on server to prevent structural mismatch
  if (!mounted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    )
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer>
  )
}

const AdaptiveDialogTrigger = ({ children, ...props }: BaseProps & any) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render DialogTrigger on server to prevent structural mismatch
  if (!mounted) {
    return <DialogTrigger {...props}>{children}</DialogTrigger>
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return <DialogTrigger {...props}>{children}</DialogTrigger>
  }

  return <DrawerTrigger {...props}>{children}</DrawerTrigger>
}

const AdaptiveDialogContent = ({ children, className, ...props }: BaseProps & { className?: string }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render DialogContent on server to prevent structural mismatch
  if (!mounted) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    )
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    )
  }

  return (
    <DrawerContent className={className} {...props}>
      <div className="max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </DrawerContent>
  )
}

const AdaptiveDialogHeader = ({ children, className, ...props }: BaseProps & { className?: string }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render DialogHeader on server to prevent structural mismatch
  if (!mounted) {
    return (
      <DialogHeader className={className} {...props}>
        {children}
      </DialogHeader>
    )
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return (
      <DialogHeader className={className} {...props}>
        {children}
      </DialogHeader>
    )
  }

  return (
    <DrawerHeader className={className} {...props}>
      {children}
    </DrawerHeader>
  )
}

const AdaptiveDialogTitle = ({ children, className, ...props }: BaseProps & { className?: string }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render DialogTitle on server to prevent structural mismatch
  if (!mounted) {
    return (
      <DialogTitle className={className} {...props}>
        {children}
      </DialogTitle>
    )
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return (
      <DialogTitle className={className} {...props}>
        {children}
      </DialogTitle>
    )
  }

  return (
    <DrawerTitle className={className} {...props}>
      {children}
    </DrawerTitle>
  )
}

const AdaptiveDialogDescription = ({ children, className, ...props }: BaseProps & { className?: string }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render DialogDescription on server to prevent structural mismatch
  if (!mounted) {
    return (
      <DialogDescription className={className} {...props}>
        {children}
      </DialogDescription>
    )
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return (
      <DialogDescription className={className} {...props}>
        {children}
      </DialogDescription>
    )
  }

  return (
    <DrawerDescription className={className} {...props}>
      {children}
    </DrawerDescription>
  )
}

const AdaptiveDialogFooter = ({ children, className, ...props }: BaseProps & { className?: string }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render DialogFooter on server to prevent structural mismatch
  if (!mounted) {
    return (
      <DialogFooter className={className} {...props}>
        {children}
      </DialogFooter>
    )
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    return (
      <DialogFooter className={className} {...props}>
        {children}
      </DialogFooter>
    )
  }

  return (
    <DrawerFooter className={className} {...props}>
      {children}
    </DrawerFooter>
  )
}

const AdaptiveDialogClose = ({ children, ...props }: BaseProps & any) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Always render Dialog behavior on server to prevent structural mismatch
  if (!mounted) {
    // Dialog uses DialogClose button in DialogFooter
    return children
  }

  // After mount, render based on actual viewport
  if (isDesktop) {
    // Dialog uses DialogClose button in DialogFooter
    return children
  }

  return <DrawerClose {...props}>{children}</DrawerClose>
}

export {
  AdaptiveDialog,
  AdaptiveDialogTrigger,
  AdaptiveDialogContent,
  AdaptiveDialogHeader,
  AdaptiveDialogTitle,
  AdaptiveDialogDescription,
  AdaptiveDialogFooter,
  AdaptiveDialogClose,
}
