// Utility functions for grants API calls

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-backend-service.com';

export interface Grant {
  grant_id: string;
  title: string;
  abstract: string;
  funding_amount: number;
  start_date: string;
  status: string;
  principal_investigators: Array<{ name: string }>;
  institution: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
  research_areas: string[];
  agency: string;
  created_at: string;
  source_id: string;
  matchScore?: number; // Keep this for display purposes
}

export interface GrantDetail extends Grant {
  fullDescription: string;
  requirements: string[];
  applicationProcess: string;
  contactInfo: string;
  websiteUrl: string;
  documents: string[];
}

interface GrantsResponse {
  success: boolean;
  grants: Grant[];
  hasMore: boolean;
  total: number;
  page: number;
  message?: string;
}

interface GrantDetailResponse {
  success: boolean;
  grant?: GrantDetail;
  message?: string;
}

interface FetchGrantsOptions {
  page?: number;
  limit?: number;
  dimension?: '1.5k' | '3k';
  search?: string;
  userId?: string;
}

/**
 * Fetch grants with pagination and filtering
 */
export const fetchGrants = async (options: FetchGrantsOptions = {}): Promise<GrantsResponse> => {
  const {
    page = 1,
    limit = 6, // Updated default to 6
    dimension = '1.5k',
    search = '',
    userId
  } = options;

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      dimension,
      search,
    });

    if (userId) {
      params.append('userId', userId);
    }

    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch(`/api/grants?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if available
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GrantsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching grants:', error);
    return {
      success: false,
      grants: [],
      hasMore: false,
      total: 0,
      page,
      message: 'Failed to fetch grants. Please try again.',
    };
  }
};

/**
 * Fetch detailed information for a specific grant
 */
export const fetchGrantDetail = async (grantId: string): Promise<GrantDetailResponse> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch(`/api/grants/${grantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if available
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GrantDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching grant detail:', error);
    return {
      success: false,
      message: 'Failed to fetch grant details. Please try again.',
    };
  }
};

/**
 * Save a grant to user's saved grants list
 */
export const saveGrant = async (grantId: string, userId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch('/api/grants/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify({ grantId, userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving grant:', error);
    return {
      success: false,
      message: 'Failed to save grant. Please try again.',
    };
  }
};

/**
 * Remove a grant from user's saved grants list
 */
export const unsaveGrant = async (grantId: string, userId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch('/api/grants/unsave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify({ grantId, userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error unsaving grant:', error);
    return {
      success: false,
      message: 'Failed to unsave grant. Please try again.',
    };
  }
};

/**
 * Search grants with embeddings similarity
 */
export const searchGrantsWithEmbeddings = async (
  query: string,
  dimension: '1.5k' | '3k' = '1.5k',
  limit: number = 6
): Promise<GrantsResponse> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch('/api/grants/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        query,
        dimension,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GrantsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching grants:', error);
    return {
      success: false,
      grants: [],
      hasMore: false,
      total: 0,
      page: 1,
      message: 'Failed to search grants. Please try again.',
    };
  }
};

/**
 * Get personalized grant recommendations for a user
 */
export const getGrantRecommendations = async (
  userId: string,
  dimension: '1.5k' | '3k' = '1.5k',
  limit: number = 6
): Promise<GrantsResponse> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch('/api/grants/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        userId,
        dimension,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GrantsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting grant recommendations:', error);
    return {
      success: false,
      grants: [],
      hasMore: false,
      total: 0,
      page: 1,
      message: 'Failed to get grant recommendations. Please try again.',
    };
  }
};

/**
 * Update user reaction for a specific grant
 */
export const updateGrantReaction = async (
  grantUid: string,
  reactionType: 'neutral' | 'like' | 'dislike',
  isSaved: boolean,
  reason?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch(`${BASE_URL}/update-reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        grant_uid: grantUid,
        reaction_type: reactionType,
        is_saved: isSaved.toString(),
        reason: reason || ''
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating grant reaction:', error);
    return {
      success: false,
      message: 'Failed to update reaction. Please try again.',
    };
  }
};

/**
 * Fetch user reactions for grants
 */
export const fetchUserReactions = async (grantIds: string[]): Promise<{ [grantId: string]: { reaction_type: string; is_saved: boolean } }> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    
    const response = await fetch(`${BASE_URL}/user-reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      body: JSON.stringify({ grant_uids: grantIds }),
    });
    

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user reactions:', error);
    return {};
  }
};

// Helper function to get authentication token
const getAuthToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    // Import Supabase client dynamically to avoid SSR issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
  return null;
};

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getDaysUntilDeadline = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const getDeadlineStatus = (deadline: string): 'urgent' | 'upcoming' | 'plenty' => {
  const days = getDaysUntilDeadline(deadline);
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'upcoming';
  return 'plenty';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getMatchScoreColor = (score: number): string => {
  console.log('getMatchScoreColor called with score:', score);
  let color;
  if (score >= 45) {
    color = 'bg-green-600 text-white';
  } else {
    color = 'bg-red-600 text-white';
  }
  console.log('getMatchScoreColor returning:', color);
  return color;
};

export const getFundingRangeDisplay = (amount: number): string => {
  return formatCurrency(amount);
};

// Re-export the main function with the correct name
export const fetchGrantsFromAPI = fetchGrants;
export const fetchGrantDetailFromAPI = fetchGrantDetail;

/**
 * Fetch total count of available grants
 */
export const fetchTotalGrantsCount = async (): Promise<{ success: boolean; total: number; message?: string }> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();
    const url = `${BASE_URL}/total-grants`;
    console.log('Fetching total grants from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let total = 0;
    if (typeof data === 'number') {
      total = data;
    } else if (typeof data.total === 'number') {
      total = data.total;
    } else if (typeof data.count === 'number') {
      total = data.count;
    } else if (typeof data.total_grants === 'number') {
      total = data.total_grants;
    }
    return { success: true, total };
  } catch (error) {
    console.error('Error fetching total grants count:', error);
    return {
      success: false,
      total: 0,
      message: 'Failed to fetch total grants count. Please try again.',
    };
  }
}; 