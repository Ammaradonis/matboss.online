import { useEffect, useState } from 'react';
import { mergePosts, posts as fallbackPosts, type BlogPost } from '../data/posts';

const NEWS_API_URL = '/api/news-posts';

interface NewsApiResponse {
  posts?: BlogPost[];
}

export default function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadPosts() {
      try {
        const response = await fetch(NEWS_API_URL, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`News API returned ${response.status}`);
        }

        const data = (await response.json()) as NewsApiResponse;

        if (!isCancelled) {
          setPosts(mergePosts(data.posts ?? []));
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setPosts(mergePosts([]));
          setError(err instanceof Error ? err.message : 'Failed to load posts');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { posts, loading, error };
}
