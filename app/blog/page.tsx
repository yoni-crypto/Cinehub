'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import blogPosts from '@/data/blog-posts.json';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">CineHub Blog</h1>
          <p className="text-muted-foreground text-lg mb-12">Expert insights, streaming guides, and the latest in entertainment</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="border border-border rounded-lg overflow-hidden hover:border-red-600/50 transition-all h-full bg-card flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-3 group-hover:text-red-600 transition line-clamp-2">{post.title}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-muted-foreground">By {post.author}</span>
                      <span className="text-red-600 text-sm font-medium group-hover:translate-x-1 transition-transform">Read more →</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
