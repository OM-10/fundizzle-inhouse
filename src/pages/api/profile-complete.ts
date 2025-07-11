import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    // Calculate completion percentage
    let completionPercentage = 0;
    let completedFields = 0;
    let totalFields = 0;

    if (profile) {
      // Define required fields for profile completion
      const requiredFields = [
        'first_name',
        'last_name',
        'email',
        'headline',
        'summary',
        'location',
        'skills',
        'keywords'
      ];

      // Define optional fields that add to completion
      const optionalFields = [
        'website',
        'phone',
        'experience',
        'education',
        'publications',
        'languages'
      ];

      totalFields = requiredFields.length + optionalFields.length;

      // Check required fields
      requiredFields.forEach(field => {
        const value = profile[field];
        if (value && (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : true)) {
          completedFields++;
        }
      });

      // Check optional fields (count as 0.5 each)
      optionalFields.forEach(field => {
        const value = profile[field];
        if (value && (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : true)) {
          completedFields += 0.5;
        }
      });

      completionPercentage = Math.round((completedFields / totalFields) * 100);
    }

    res.status(200).json({ 
      success: true,
      completionPercentage: Math.min(completionPercentage, 100),
      completedFields,
      totalFields
    });

  } catch (error) {
    console.error('Error calculating profile completion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 