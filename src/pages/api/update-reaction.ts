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
    const { grant_uid, reaction_type, is_saved, reason } = req.body;

    console.log('Update reaction request:', { grant_uid, reaction_type, is_saved, reason });

    // Validate required fields
    if (!grant_uid) {
      return res.status(400).json({ error: 'grant_uid is required' });
    }

    if (!['neutral', 'like', 'dislike'].includes(reaction_type)) {
      return res.status(400).json({ error: 'reaction_type must be neutral, like, or dislike' });
    }

    if (typeof is_saved !== 'string') {
      return res.status(400).json({ error: 'is_saved must be a string' });
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

    // Convert is_saved string to boolean
    const isSavedBoolean = is_saved === 'true';

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

    // Check if reaction already exists
    const { data: existingReaction, error: checkError } = await supabase
      .from('user_reaction')
      .select('id')
      .eq('user_id', user.id)
      .eq('grant_uid', grant_uid)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing reaction:', checkError);
      return res.status(500).json({ 
        error: 'Failed to check existing reaction',
        details: checkError.message 
      });
    }

    console.log('Existing reaction:', existingReaction);

    let result;
    if (existingReaction) {
      // Update existing reaction
      const { data, error } = await supabase
        .from('user_reaction')
        .update({
          reaction_type,
          is_saved: isSavedBoolean,
          reason: reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReaction.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reaction:', error);
        return res.status(500).json({ 
          error: 'Failed to update reaction',
          details: error.message 
        });
      }

      result = data;
      console.log('Updated reaction:', result);
    } else {
      // Insert new reaction
      const { data, error } = await supabase
        .from('user_reaction')
        .insert({
          user_id: user.id,
          grant_uid,
          reaction_type,
          is_saved: isSavedBoolean,
          reason: reason || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting reaction:', error);
        return res.status(500).json({ 
          error: 'Failed to insert reaction',
          details: error.message 
        });
      }

      result = data;
      console.log('Inserted reaction:', result);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Reaction updated successfully',
      reaction: result
    });

  } catch (error) {
    console.error('Error in update-reaction API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 