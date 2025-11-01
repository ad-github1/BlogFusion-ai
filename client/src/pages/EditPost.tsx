import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { updateBlogPostSchema, type UpdateBlogPost, type BlogPostWithAuthor, type AIWritingRequest } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Loader2, Sparkles, Wand2, RotateCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EditPost() {
  const { user, isLoading: authLoading } = useAuth();
  const [, params] = useRoute('/edit/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const postId = params?.id;
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [authLoading, user, setLocation]);

  const { data: post, isLoading } = useQuery<BlogPostWithAuthor>({
    queryKey: ['/api/posts', postId],
    enabled: !!postId && !!user,
  });

  const form = useForm<UpdateBlogPost>({
    resolver: zodResolver(updateBlogPostSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      category: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        coverImage: post.coverImage || '',
        category: post.category || '',
        tags: post.tags || [],
      });
    }
  }, [post, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateBlogPost) => {
      return apiRequest('PATCH', `/api/posts/${postId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/my'] });
      toast({
        title: 'Post updated!',
        description: 'Your post has been updated successfully.',
      });
      setLocation(`/post/${postId}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update post. Please try again.',
        variant: 'destructive',
      });
    },
  });

  async function handleAiAssist(action: 'improve' | 'expand' | 'summarize') {
    const content = form.getValues('content');
    if (!content || !content.trim()) {
      toast({
        title: 'No content',
        description: 'Please write some content first.',
        variant: 'destructive',
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const request: AIWritingRequest = { content, action, tone: 'professional' };
      const result = await apiRequest('POST', '/api/ai/assist', request);
      setAiSuggestion(result.suggestion);
      toast({
        title: 'AI suggestion ready',
        description: 'Review the suggestion below and apply if you like it.',
      });
    } catch (error) {
      toast({
        title: 'AI Error',
        description: 'Failed to get AI assistance. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  }

  function applySuggestion() {
    if (aiSuggestion) {
      form.setValue('content', aiSuggestion);
      setAiSuggestion('');
      toast({
        title: 'Applied',
        description: 'AI suggestion has been applied to your content.',
      });
    }
  }

  async function onSubmit(data: UpdateBlogPost) {
    const tags = data.tags && typeof data.tags === 'string' 
      ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
      : data.tags || [];

    updateMutation.mutate({
      ...data,
      tags,
    });
  }

  if (authLoading || isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!post || post.authorId !== user.id) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to edit this post.</p>
        <Button onClick={() => setLocation('/dashboard')} data-testid="button-back-dashboard">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Post</h1>
          <p className="text-muted-foreground">
            Update your story with AI-powered assistance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Your Story</CardTitle>
                <CardDescription>Make changes to your blog post</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your post title..."
                              className="text-lg"
                              data-testid="input-title"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief summary of your post..."
                              className="resize-none"
                              rows={2}
                              data-testid="input-excerpt"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your story here..."
                              className="resize-none font-serif text-lg leading-relaxed"
                              rows={16}
                              data-testid="input-content"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Technology, Lifestyle, etc."
                                data-testid="input-category"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                data-testid="input-cover-image"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="AI, blogging, writing"
                              data-testid="input-tags"
                              {...field}
                              value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={updateMutation.isPending}
                        data-testid="button-update"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Post'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation(`/post/${postId}`)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Writing Assistant
                </CardTitle>
                <CardDescription>Enhance your content with AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAiAssist('improve')}
                    disabled={isAiLoading}
                    data-testid="button-ai-improve"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Improve Writing
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAiAssist('expand')}
                    disabled={isAiLoading}
                    data-testid="button-ai-expand"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Expand Content
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAiAssist('summarize')}
                    disabled={isAiLoading}
                    data-testid="button-ai-summarize"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Summarize
                  </Button>
                </div>

                {isAiLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {aiSuggestion && !isAiLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">AI Suggestion</Badge>
                      <Button
                        size="sm"
                        onClick={applySuggestion}
                        data-testid="button-apply-suggestion"
                      >
                        Apply
                      </Button>
                    </div>
                    <div
                      className="p-4 bg-muted rounded-lg text-sm border"
                      data-testid="text-ai-suggestion"
                    >
                      {aiSuggestion}
                    </div>
                  </div>
                )}

                {!aiSuggestion && !isAiLoading && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Use AI to enhance your content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}