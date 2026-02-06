import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <div className="group relative">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 16 }: { count?: number }) {
  return (
    <section className="py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 my-6">
        {Array.from({ length: count }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
