import { type User, type InsertUser, type BlogPost, type InsertBlogPost, type UpdateBlogPost, type BlogPostWithAuthor } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog post methods
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostWithAuthor(id: string): Promise<BlogPostWithAuthor | undefined>;
  getAllBlogPosts(): Promise<BlogPostWithAuthor[]>;
  getBlogPostsByAuthor(authorId: string): Promise<BlogPostWithAuthor[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: UpdateBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private blogPosts: Map<string, BlogPost>;

  constructor() {
    this.users = new Map();
    this.blogPosts = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Blog post methods
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostWithAuthor(id: string): Promise<BlogPostWithAuthor | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const author = this.users.get(post.authorId);
    if (!author) return undefined;
    
    return { ...post, author };
  }

  async getAllBlogPosts(): Promise<BlogPostWithAuthor[]> {
    const posts = Array.from(this.blogPosts.values());
    const postsWithAuthors: BlogPostWithAuthor[] = [];
    
    for (const post of posts) {
      const author = this.users.get(post.authorId);
      if (author) {
        postsWithAuthors.push({ ...post, author });
      }
    }
    
    return postsWithAuthors.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBlogPostsByAuthor(authorId: string): Promise<BlogPostWithAuthor[]> {
    const author = this.users.get(authorId);
    if (!author) return [];
    
    const posts = Array.from(this.blogPosts.values()).filter(
      post => post.authorId === authorId
    );
    
    return posts.map(post => ({ ...post, author })).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const now = new Date();
    const post: BlogPost = {
      ...insertPost,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updatePost: UpdateBlogPost): Promise<BlogPost | undefined> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost: BlogPost = {
      ...existingPost,
      ...updatePost,
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }
}

export const storage = new MemStorage();
