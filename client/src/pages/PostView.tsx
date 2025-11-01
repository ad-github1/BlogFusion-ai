import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { type BlogPostWithAuthor } from '@shared/schema';
import { Calendar, Clock, ArrowLeft, Pencil } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import defaultImage from '@assets/generated_images/Nature_blog_post_thumbnail_bb966597.png';

export default function PostView() {
  const [, params] = useRoute('/post/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const postId = params?.id;

  const { data: post, isLoading } = useQuery<BlogPostWithAuthor>({
    queryKey: ['/api/posts', postId],
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-96 w-full" />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation('/explore')} data-testid="button-back-explore">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Button>
      </div>
    );
  }

  const isAuthor = user?.id === post.authorId;

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage || defaultImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <article className="max-w-4xl mx-auto">
          {/* Title and Meta */}
          <div className="bg-background rounded-lg p-8 md:p-12 mb-8 border">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {post.category && (
                <Badge variant="secondary" data-testid="badge-category">
                  {post.category}
                </Badge>
              )}
              {post.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" data-testid={`badge-tag-${i}`}>
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" data-testid="text-title">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={post.author.avatar || undefined} />
                  <AvatarFallback>{post.author.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold" data-testid="text-author-name">
                    {post.author.name}
                  </p>
                  <p className="text-sm text-muted-foreground">@{post.author.username}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {isAuthor && (
              <div className="mt-6">
                <Button
                  onClick={() => setLocation(`/edit/${post.id}`)}
                  variant="outline"
                  data-testid="button-edit-post"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Post
                </Button>
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="bg-background rounded-lg p-8 md:p-12 border">
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
              data-testid="text-content"
            />
          </div>
        </article>
      </div>
    </div>
  );
}
