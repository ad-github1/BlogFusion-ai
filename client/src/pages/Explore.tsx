import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { type BlogPostWithAuthor } from '@shared/schema';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import defaultImage from '@assets/generated_images/AI_technology_blog_thumbnail_2a966c91.png';

export default function Explore() {
  const { data: posts, isLoading } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ['/api/posts'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Explore Stories</h1>
        <p className="text-xl text-muted-foreground">
          Discover amazing content from our community of writers
        </p>
      </div>

      {posts && posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your story with the community!
            </p>
            <Link href="/write" data-testid="link-write-first">
              <span className="text-primary hover:underline cursor-pointer font-medium">
                Write your first post
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} data-testid={`link-post-${post.id}`}>
              <Card className="overflow-hidden hover-elevate transition-all cursor-pointer h-full">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${post.coverImage || defaultImage})`,
                  }}
                />
                <CardContent className="p-6 space-y-4">
                  {post.category && (
                    <Badge variant="secondary" data-testid={`badge-category-${post.id}`}>
                      {post.category}
                    </Badge>
                  )}
                  <h3 className="text-xl font-semibold line-clamp-2" data-testid={`text-title-${post.id}`}>
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3" data-testid={`text-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatar || undefined} />
                      <AvatarFallback>{post.author.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-author-${post.id}`}>
                        {post.author.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
