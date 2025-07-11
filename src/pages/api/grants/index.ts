import { NextApiRequest, NextApiResponse } from 'next';
// import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - TODO: Uncomment when ready to use real database
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

interface Grant {
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

interface GrantsResponse {
  success: boolean;
  grants: Grant[];
  hasMore: boolean;
  total: number;
  page: number;
  message?: string;
}

// API Response interface from your external API
interface ExternalGrantResponse {
  agency: string;
  end_date: string;
  funding_amount: string;
  grant_uid: string;
  match_score: number;
  rank: number;
  research_areas: string[];
  similarity: number;
  title: string;
}

// Map external API response to our Grant interface
const mapExternalGrantToGrant = (externalGrant: ExternalGrantResponse): Grant => {
  return {
    grant_id: externalGrant.grant_uid,
    title: externalGrant.title,
    abstract: `Research grant in ${externalGrant.research_areas.join(', ')} from ${externalGrant.agency}. This grant focuses on advancing knowledge and innovation in these key research areas.`,
    funding_amount: parseInt(externalGrant.funding_amount) || 0,
    start_date: new Date().toISOString().split('T')[0], // Default to today since start_date not provided
    status: "ACTIVE",
    principal_investigators: [{ name: "Principal Investigator" }], // Default since not provided
    institution: {
      name: "Research Institution",
      city: "Unknown",
      state: "Unknown",
      country: "USA"
    },
    research_areas: externalGrant.research_areas,
    agency: externalGrant.agency,
    created_at: new Date().toISOString(),
    source_id: externalGrant.grant_uid,
    matchScore: externalGrant.match_score
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GrantsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      grants: [], 
      hasMore: false, 
      total: 0, 
      page: 0,
      message: 'Method not allowed' 
    });
  }

  try {
    const { 
      page = '1', 
      limit = '6', // Changed default to 6 as requested
      dimension = '1.5k',
      search = '',
      userId 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const embeddingDimension = dimension as string;
    const searchQuery = search as string;

    console.log(`Fetching grants - Page: ${pageNum}, Limit: ${limitNum}, Dimension: ${embeddingDimension}`);

    // Map dimension to API dimension value
    const apiDimension = embeddingDimension === '3k' ? 3072 : 1536; // Assuming 1.5k maps to 1536
    
    // Calculate offset for pagination
    const offset = (pageNum - 1) * limitNum;

    // Prepare API request body
    const requestBody = {
      dimension: apiDimension,
      top_k: limitNum,
      offset: offset
    };

    // Extract Authorization header from request
    const authHeader = req.headers.authorization;
    
    // Check if authorization header is present
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        grants: [], 
        hasMore: false, 
        total: 0, 
        page: 0,
        message: 'Authorization header required' 
      });
    }

    // Make API call to external grants API using the user's token
    const externalApiUrl = process.env.EXTERNAL_GRANTS_API_URL || 'http://127.0.0.1:5000/match-grants';
    const apiResponse = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const externalGrants: ExternalGrantResponse[] = await apiResponse.json();
    
    // Map external grants to our Grant interface
    let grants = externalGrants.map(mapExternalGrantToGrant);

    // Apply search filter if provided
    if (searchQuery) {
      grants = grants.filter(grant =>
        grant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grant.research_areas.some(area => 
          area.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // For hasMore, we'll check if we got the full requested amount
    // If we got less than requested, there are no more grants
    const hasMore = grants.length === limitNum;
    
    // Since we don't have total count from API, we'll estimate based on pagination
    const total = hasMore ? (pageNum * limitNum) + 1 : (pageNum - 1) * limitNum + grants.length;

    console.log(`Fetched ${grants.length} grants from API`);

    return res.status(200).json({
      success: true,
      grants: grants,
      hasMore,
      total,
      page: pageNum
    });

  } catch (error) {
    console.error('Error fetching grants from API:', error);
    return res.status(500).json({ 
      success: false, 
      grants: [], 
      hasMore: false, 
      total: 0, 
      page: 0,
      message: `Failed to fetch grants: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
}

// TODO: Implement actual database queries
/*
Real implementation would look like:

// For 1.5k dimension embeddings
const { data: grants1_5k } = await supabase
  .from('grant_opportunities_1_5k')
  .select('*')
  .range(startIndex, endIndex - 1);

// For 3k dimension embeddings  
const { data: grants3k } = await supabase
  .from('grant_opportunities_3k')
  .select('*')
  .range(startIndex, endIndex - 1);

// For user-specific matching
const { data: userPreferences } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', userId)
  .single();

// Calculate embedding similarity and match scores
const matchScores = await calculateEmbeddingSimilarity(
  userPreferences.embedding,
  grants.map(g => g.embedding)
);
*/ 