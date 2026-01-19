/**
 * 워드프레스 REST API 클라이언트
 */

import axios from "axios";
import type {
  WordPressConfig,
  WordPressPost,
  WordPressPostResponse,
  BlogPost,
} from "@/types";
import { createApiError } from "@/types";

/**
 * Basic Auth 헤더 생성
 */
function createAuthHeader(username: string, applicationPassword: string): string {
  const credentials = Buffer.from(`${username}:${applicationPassword}`).toString(
    "base64"
  );
  return `Basic ${credentials}`;
}

/**
 * 워드프레스에 포스트 생성
 */
export async function createWordPressPost(
  config: WordPressConfig,
  post: WordPressPost
): Promise<WordPressPostResponse> {
  const url = `${config.url.replace(/\/$/, "")}/wp-json/wp/v2/posts`;

  try {
    const response = await axios.post(
      url,
      {
        title: post.title,
        content: post.content,
        status: post.status,
        date: post.date,
        meta: post.meta,
      },
      {
        headers: {
          Authorization: createAuthHeader(
            config.username,
            config.applicationPassword
          ),
          "Content-Type": "application/json",
        },
      }
    );

    return {
      id: response.data.id,
      link: response.data.link,
      date: response.data.date,
      status: response.data.status,
      title: response.data.title,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "워드프레스 포스트 생성에 실패했습니다.";
      throw createApiError(
        "WORDPRESS_API_ERROR",
        message,
        error.response?.status
      );
    }
    throw error;
  }
}

/**
 * BlogPost를 WordPressPost로 변환
 */
export function prepareWordPressPost(
  blogPost: BlogPost,
  scheduledDate: Date
): WordPressPost {
  return {
    title: blogPost.title,
    content: blogPost.content,
    status: "future",
    date: scheduledDate.toISOString(),
    meta: {
      rank_math_focus_keyword: blogPost.focusKeyword,
      rank_math_description: blogPost.metaDescription,
    },
  };
}

/**
 * 워드프레스 연결 테스트
 */
export async function testWordPressConnection(
  config: WordPressConfig
): Promise<boolean> {
  const url = `${config.url.replace(/\/$/, "")}/wp-json/wp/v2/users/me`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: createAuthHeader(
          config.username,
          config.applicationPassword
        ),
      },
    });

    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * 워드프레스 API 클라이언트 클래스
 */
export class WordPressApiClient {
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
  }

  async createPost(post: WordPressPost): Promise<WordPressPostResponse> {
    return createWordPressPost(this.config, post);
  }

  async publishBlogPost(
    blogPost: BlogPost,
    scheduledDate: Date
  ): Promise<WordPressPostResponse> {
    const wpPost = prepareWordPressPost(blogPost, scheduledDate);
    return this.createPost(wpPost);
  }

  async testConnection(): Promise<boolean> {
    return testWordPressConnection(this.config);
  }
}

export default WordPressApiClient;
