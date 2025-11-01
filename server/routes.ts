import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, generateToken, type AuthRequest } from "./middleware/auth";
import { getAIWritingAssistance } from "./services/openai";
import { 
  loginSchema, 
  registerSchema, 
  insertBlogPostSchema, 
  updateBlogPostSchema,
  type AIWritingRequest,
} from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      const token = generateToken(user.id);
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message || 'Login failed' });
    }
  });

  // Blog post routes
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error: any) {
      console.error('Get posts error:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.get('/api/posts/my', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const posts = await storage.getBlogPostsByAuthor(userId);
      res.json(posts);
    } catch (error: any) {
      console.error('Get my posts error:', error);
      res.status(500).json({ message: 'Failed to fetch your posts' });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const post = await storage.getBlogPostWithAuthor(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    } catch (error: any) {
      console.error('Get post error:', error);
      res.status(500).json({ message: 'Failed to fetch post' });
    }
  });

  app.post('/api/posts', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const post = await storage.createBlogPost(validatedData);
      res.json(post);
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(400).json({ message: error.message || 'Failed to create post' });
    }
  });

  app.patch('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const postId = req.params.id;
      
      const existingPost = await storage.getBlogPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (existingPost.authorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const validatedData = updateBlogPostSchema.parse(req.body);
      const updatedPost = await storage.updateBlogPost(postId, validatedData);
      
      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(updatedPost);
    } catch (error: any) {
      console.error('Update post error:', error);
      res.status(400).json({ message: error.message || 'Failed to update post' });
    }
  });

  app.delete('/api/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const postId = req.params.id;
      
      const existingPost = await storage.getBlogPost(postId);
      if (!existingPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (existingPost.authorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const deleted = await storage.deleteBlogPost(postId);
      if (!deleted) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
      console.error('Delete post error:', error);
      res.status(500).json({ message: 'Failed to delete post' });
    }
  });

  // AI assistance route
  app.post('/api/ai/assist', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const request: AIWritingRequest = req.body;
      
      if (!request.content || !request.action) {
        return res.status(400).json({ message: 'Content and action are required' });
      }

      const result = await getAIWritingAssistance(request);
      res.json(result);
    } catch (error: any) {
      console.error('AI assist error:', error);
      res.status(500).json({ message: error.message || 'AI assistance failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
