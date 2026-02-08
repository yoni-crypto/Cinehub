import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Calendar, Clock, User, ArrowLeft, Star } from 'lucide-react';
import blogDetails from '@/data/blog-details.json';

type ContentBlock = {
  type: 'paragraph' | 'heading' | 'movie' | 'image';
  text?: string;
  movieId?: number;
  title?: string;
  image?: string;
  year?: string;
  rating?: string;
  url?: string;
  alt?: string;
  caption?: string;
};

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
  imageAlt: string;
  content: ContentBlock[];
  tags: string[];
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = (blogDetails as Record<string, BlogPost>)[params.slug];

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} | CineHub Blog`,
    description: post.excerpt,
    keywords: [...post.tags, 'cinehub', 'streaming', 'movies', 'tv shows'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://cinehub1.vercel.app/blog/${post.slug}`,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt }],
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: {
      canonical: `https://cinehub1.vercel.app/blog/${post.slug}`,
    },
  };
}

export function generateStaticParams() {
  const posts = Object.keys(blogDetails);
  return posts.map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = (blogDetails as Record<string, BlogPost>)[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-red-600 mb-8 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="mb-8">
            <span className="inline-block bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          <div className="aspect-video relative overflow-hidden rounded-xl mb-12">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg max-w-none">
            {post.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className="text-muted-foreground leading-relaxed mb-6 text-lg">
                    {block.text}
                  </p>
                );
              }
              
              if (block.type === 'heading') {
                return (
                  <h2 key={index} className="text-3xl font-bold mt-12 mb-6">
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'movie' && block.movieId) {
                return (
                  <Link key={index} href={`/movies/${block.movieId}`} className="block my-8 group">
                    <div className="border border-border rounded-lg overflow-hidden hover:border-red-600 transition-all bg-card">
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-36 relative flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={block.image || ''}
                            alt={block.title || ''}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition">
                            {block.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{block.year}</span>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{block.rating}</span>
                            </div>
                          </div>
                          <span className="text-red-600 text-sm font-medium mt-2 group-hover:translate-x-1 transition-transform inline-block">
                            Watch Now →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }

              if (block.type === 'image' && block.url) {
                return (
                  <figure key={index} className="my-8">
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <Image
                        src={block.url}
                        alt={block.alt || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="text-sm text-muted-foreground text-center mt-2">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              return null;
            })}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-muted text-sm px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-border">
            <Link href="/blog" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition">
              <ArrowLeft className="w-4 h-4" />
              Back to all posts
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
