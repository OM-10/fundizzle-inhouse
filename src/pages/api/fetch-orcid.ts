import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orcidId } = req.body;

    if (!orcidId) {
      return res.status(400).json({ error: 'ORCID ID is required' });
    }

    // Validate ORCID ID format
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    if (!orcidRegex.test(orcidId)) {
      return res.status(400).json({ error: 'Invalid ORCID ID format' });
    }

    // Fetch from ORCID public API
    const orcidUrl = `https://pub.orcid.org/v3.0/${orcidId}`;
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'Fundizzle/1.0 (mailto:support@fundizzle.com)'
    };

    const response = await fetch(orcidUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'ORCID profile not found or not public' });
      }
      throw new Error(`ORCID API error: ${response.status}`);
    }

    const orcidData = await response.json();

    // Also fetch detailed sections
    const sections = ['works', 'educations', 'employments', 'person'];
    const detailedData: any = { profile: orcidData };

    console.log('=== ORCID FETCH DEBUG ===');
    console.log('Fetching sections for ORCID:', orcidId);

    for (const section of sections) {
      try {
        const sectionUrl = `https://pub.orcid.org/v3.0/${orcidId}/${section}`;
        console.log(`Fetching ${section} from:`, sectionUrl);
        const sectionResponse = await fetch(sectionUrl, { headers });
        if (sectionResponse.ok) {
          const sectionData = await sectionResponse.json();
          detailedData[section] = sectionData;
          console.log(`✓ ${section} fetched, data keys:`, Object.keys(sectionData));
          
          // Log specific structure for works
          if (section === 'works' && sectionData.group) {
            console.log(`Works groups count: ${sectionData.group.length}`);
            const totalWorks = sectionData.group.reduce((acc: number, group: any) => {
              return acc + (group['work-summary']?.length || 0);
            }, 0);
            console.log(`Total works across all groups: ${totalWorks}`);
          }
          
          // Log structure for affiliations
          if ((section === 'educations' || section === 'employments') && sectionData['affiliation-group']) {
            console.log(`${section} groups count: ${sectionData['affiliation-group'].length}`);
          }
        } else {
          console.log(`✗ Failed to fetch ${section}:`, sectionResponse.status);
          detailedData[section] = null;
        }
      } catch (err) {
        console.warn(`Failed to fetch ${section} for ${orcidId}:`, err);
        detailedData[section] = null;
      }
    }

    console.log('Final detailed data keys:', Object.keys(detailedData));

    res.status(200).json({ 
      data: detailedData,
      message: 'ORCID profile fetched successfully',
      orcidId
    });
  } catch (error) {
    console.error('Error fetching ORCID profile:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return res.status(404).json({ error: 'ORCID profile not found or not public' });
      }
      if (error.message.includes('fetch')) {
        return res.status(503).json({ error: 'Unable to connect to ORCID. Please try again later.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch ORCID profile. Please try again.' });
  }
} 