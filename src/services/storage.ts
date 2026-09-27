import {
  Post,
  Category,
  Tag,
  User,
  MediaItem,
  StaticPage,
  MenuItem,
  SiteSettings,
  ActivityLog,
  Comment,
  RedirectRule,
  PostRevision,
} from '../types/cms';
import {
  INITIAL_POSTS,
  INITIAL_CATEGORIES,
  INITIAL_TAGS,
  INITIAL_USERS,
  INITIAL_MEDIA,
  INITIAL_PAGES,
  INITIAL_MENUS,
  INITIAL_SETTINGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_COMMENTS,
  INITIAL_REDIRECTS,
} from '../data/initialData';

const STORAGE_KEYS = {
  POSTS: 'astro_cms_posts_v2',
  CATEGORIES: 'astro_cms_categories_v1',
  TAGS: 'astro_cms_tags_v1',
  USERS: 'astro_cms_users_v1',
  CURRENT_USER_ID: 'astro_cms_current_user_v1',
  MEDIA: 'astro_cms_media_v1',
  PAGES: 'astro_cms_pages_v1',
  MENUS: 'astro_cms_menus_v1',
  SETTINGS: 'astro_cms_settings_v1',
  LOGS: 'astro_cms_logs_v1',
  COMMENTS: 'astro_cms_comments_v1',
  REDIRECTS: 'astro_cms_redirects_v1',
};

// Safe JSON parser
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
}

export class StorageService {
  static getPosts(): Post[] {
    return safeGet<Post[]>(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  }

  static savePosts(posts: Post[]): void {
    safeSet(STORAGE_KEYS.POSTS, posts);
  }

  static getCategories(): Category[] {
    return safeGet<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static saveCategories(categories: Category[]): void {
    safeSet(STORAGE_KEYS.CATEGORIES, categories);
  }

  static getTags(): Tag[] {
    return safeGet<Tag[]>(STORAGE_KEYS.TAGS, INITIAL_TAGS);
  }

  static saveTags(tags: Tag[]): void {
    safeSet(STORAGE_KEYS.TAGS, tags);
  }

  static getUsers(): User[] {
    return safeGet<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static saveUsers(users: User[]): void {
    safeSet(STORAGE_KEYS.USERS, users);
  }

  static getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = safeGet<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-superadmin');
    const found = users.find((u) => u.id === currentId);
    return found || users[0];
  }

  static setCurrentUserId(userId: string): void {
    safeSet(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static getMedia(): MediaItem[] {
    return safeGet<MediaItem[]>(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
  }

  static saveMedia(media: MediaItem[]): void {
    safeSet(STORAGE_KEYS.MEDIA, media);
  }

  static getPages(): StaticPage[] {
    return safeGet<StaticPage[]>(STORAGE_KEYS.PAGES, INITIAL_PAGES);
  }

  static savePages(pages: StaticPage[]): void {
    safeSet(STORAGE_KEYS.PAGES, pages);
  }

  static getMenus(): MenuItem[] {
    return safeGet<MenuItem[]>(STORAGE_KEYS.MENUS, INITIAL_MENUS);
  }

  static saveMenus(menus: MenuItem[]): void {
    safeSet(STORAGE_KEYS.MENUS, menus);
  }

  static getSettings(): SiteSettings {
    const loaded = safeGet<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!loaded.homepage) {
      loaded.homepage = INITIAL_SETTINGS.homepage;
    } else {
      loaded.homepage = {
        ...INITIAL_SETTINGS.homepage,
        ...loaded.homepage,
        sectionsEnabled: {
          ...INITIAL_SETTINGS.homepage.sectionsEnabled,
          ...(loaded.homepage.sectionsEnabled || {}),
        },
        hero: {
          ...INITIAL_SETTINGS.homepage.hero,
          ...(loaded.homepage.hero || {}),
        },
        announcement: {
          ...INITIAL_SETTINGS.homepage.announcement,
          ...(loaded.homepage.announcement || {}),
        },
        trending: {
          ...INITIAL_SETTINGS.homepage.trending,
          ...(loaded.homepage.trending || {}),
        },
        featuredGrid: {
          ...INITIAL_SETTINGS.homepage.featuredGrid,
          ...(loaded.homepage.featuredGrid || {}),
        },
        latestFeed: {
          ...INITIAL_SETTINGS.homepage.latestFeed,
          ...(loaded.homepage.latestFeed || {}),
        },
        newsletter: {
          ...INITIAL_SETTINGS.homepage.newsletter,
          ...(loaded.homepage.newsletter || {}),
        },
        sidebar: {
          ...INITIAL_SETTINGS.homepage.sidebar,
          ...(loaded.homepage.sidebar || {}),
        },
      };
    }
    return loaded;
  }

  static saveSettings(settings: SiteSettings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  }

  static getActivityLogs(): ActivityLog[] {
    return safeGet<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS);
  }

  static logActivity(action: string, details: string): void {
    const user = this.getCurrentUser();
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    safeSet(STORAGE_KEYS.LOGS, [newLog, ...logs].slice(0, 150));
  }

  static getComments(): Comment[] {
    return safeGet<Comment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  }

  static saveComments(comments: Comment[]): void {
    safeSet(STORAGE_KEYS.COMMENTS, comments);
  }

  static getRedirects(): RedirectRule[] {
    return safeGet<RedirectRule[]>(STORAGE_KEYS.REDIRECTS, INITIAL_REDIRECTS);
  }

  static saveRedirects(redirects: RedirectRule[]): void {
    safeSet(STORAGE_KEYS.REDIRECTS, redirects);
  }

  // Post Specific Helpers
  static getPostBySlug(slug: string): Post | undefined {
    const posts = this.getPosts();
    // Normalize slug
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    return posts.find((p) => p.slug === cleanSlug && p.status === 'published');
  }

  static getPostById(id: string): Post | undefined {
    const posts = this.getPosts();
    return posts.find((p) => p.id === id);
  }

  static incrementPostViews(postId: string): void {
    const posts = this.getPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      posts[index].views = (posts[index].views || 0) + 1;
      this.savePosts(posts);
    }
  }

  static savePostWithRevision(post: Post, note?: string): Post {
    const posts = this.getPosts();
    const user = this.getCurrentUser();
    const index = posts.findIndex((p) => p.id === post.id);

    // Create a revision snapshot
    const revision: PostRevision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName: user.name,
      title: post.title,
      content: post.content,
      blocks: JSON.parse(JSON.stringify(post.blocks || [])),
      note: note || `Snapshot before updating: ${post.title}`,
    };

    const existingRevisions = post.revisions || [];
    const updatedPost: Post = {
      ...post,
      updatedAt: new Date().toISOString(),
      revisions: [revision, ...existingRevisions].slice(0, 20),
    };

    if (index !== -1) {
      posts[index] = updatedPost;
      this.logActivity('Post Updated', `Edited post "${post.title}" (status: ${post.status})`);
    } else {
      posts.unshift(updatedPost);
      this.logActivity('Post Created', `Created post "${post.title}"`);
    }

    this.savePosts(posts);
    return updatedPost;
  }

  static resetToDefault(): void {
    localStorage.clear();
    safeSet(STORAGE_KEYS.POSTS, INITIAL_POSTS);
    safeSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    safeSet(STORAGE_KEYS.TAGS, INITIAL_TAGS);
    safeSet(STORAGE_KEYS.USERS, INITIAL_USERS);
    safeSet(STORAGE_KEYS.CURRENT_USER_ID, 'user-superadmin');
    safeSet(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
    safeSet(STORAGE_KEYS.PAGES, INITIAL_PAGES);
    safeSet(STORAGE_KEYS.MENUS, INITIAL_MENUS);
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS);
    safeSet(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    safeSet(STORAGE_KEYS.REDIRECTS, INITIAL_REDIRECTS);
    this.logActivity('Database Reset', 'Reset all CMS entities to initial production seed state.');
  }

  static exportDatabaseJson(): string {
    const dump = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      posts: this.getPosts(),
      categories: this.getCategories(),
      tags: this.getTags(),
      users: this.getUsers(),
      pages: this.getPages(),
      media: this.getMedia(),
      menus: this.getMenus(),
      settings: this.getSettings(),
      redirects: this.getRedirects(),
    };
    return JSON.stringify(dump, null, 2);
  }

  static importDatabaseJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.posts && Array.isArray(data.posts)) this.savePosts(data.posts);
      if (data.categories && Array.isArray(data.categories)) this.saveCategories(data.categories);
      if (data.tags && Array.isArray(data.tags)) this.saveTags(data.tags);
      if (data.users && Array.isArray(data.users)) this.saveUsers(data.users);
      if (data.pages && Array.isArray(data.pages)) this.savePages(data.pages);
      if (data.media && Array.isArray(data.media)) this.saveMedia(data.media);
      if (data.menus && Array.isArray(data.menus)) this.saveMenus(data.menus);
      if (data.settings) this.saveSettings(data.settings);
      if (data.redirects && Array.isArray(data.redirects)) this.saveRedirects(data.redirects);

      this.logActivity('Database Imported', 'Restored complete database from JSON backup file.');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}
