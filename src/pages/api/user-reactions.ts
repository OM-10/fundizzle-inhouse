import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { grant_ids } = req.body;

    if (!grant_ids || !Array.isArray(grant_ids)) {
      return res.status(400).json({ error: 'grant_ids array is required' });
    }

    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('User authenticated:', user.id);
    console.log('Grant IDs:', grant_ids);

    // First, let's check if the user_reaction table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_reaction')
        .select('count')
        .limit(1);

      if (tableError) {
        console.error('Table check error:', tableError);
        return res.status(500).json({ 
          error: 'user_reaction table does not exist or is not accessible',
          details: tableError.message 
        });
      }
    } catch (tableCheckError) {
      console.error('Table check failed:', tableCheckError);
      return res.status(500).json({ 
        error: 'Failed to access user_reaction table',
        details: tableCheckError instanceof Error ? tableCheckError.message : 'Unknown error'
      });
    }

    // Fetch user reactions for the specified grants
    const { data: reactions, error } = await supabase
      .from('user_reaction')
      .select('grant_uid, reaction_type, is_saved')
      .eq('user_id', user.id)
      .in('grant_uid', grant_ids);

    if (error) {
      console.error('Error fetching user reactions:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch user reactions',
        details: error.message 
      });
    }

    console.log('Fetched reactions:', reactions);

    // Transform the data to match the expected format
    const reactionsMap: { [grantId: string]: { reaction_type: string; is_saved: boolean } } = {};
    
    reactions?.forEach(reaction => {
      reactionsMap[reaction.grant_uid] = {
        reaction_type: reaction.reaction_type || 'neutral',
        is_saved: reaction.is_saved || false
      };
    });

    // Add default values for grants without reactions
    grant_ids.forEach(grantId => {
      if (!reactionsMap[grantId]) {
        reactionsMap[grantId] = {
          reaction_type: 'neutral',
          is_saved: false
        };
      }
    });

    console.log('Final reactions map:', reactionsMap);

    return res.status(200).json({ 
      success: true, 
      reactions: reactionsMap 
    });

  } catch (error) {
    console.error('Error in user-reactions API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 