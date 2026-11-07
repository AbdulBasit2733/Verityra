import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() { return <div className="space-y-6"><Skeleton className="h-16 w-full" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-[32rem]" /></div></div> }
