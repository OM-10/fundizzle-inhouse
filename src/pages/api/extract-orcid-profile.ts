import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to safely truncate large data
function truncateORCIDData(orcidData: any): any {
  console.log('=== TRUNCATE ORCID DATA DEBUG ===');
  console.log('Input data keys:', Object.keys(orcidData));
  console.log('Data type:', typeof orcidData);
  
  // Handle nested data structure from API response
  const data = orcidData.data || orcidData;
  console.log('Processed data keys:', Object.keys(data));
  
  // Check the actual structure we're getting
  console.log('=== DETAILED STRUCTURE ANALYSIS ===');
  if (data.works) {
    console.log('✓ Works section found');
    console.log('Works type:', typeof data.works);
    console.log('Works keys:', Object.keys(data.works));
    
    if (data.works.group) {
      console.log('✓ Works has group property');
      console.log('Groups count:', data.works.group.length);
      if (data.works.group.length > 0) {
        console.log('First group keys:', Object.keys(data.works.group[0]));
        const firstGroup = data.works.group[0];
        ['work-summary', 'summary', 'works'].forEach(key => {
          if (firstGroup[key]) {
            console.log(`✓ First group has ${key}:`, Array.isArray(firstGroup[key]) ? firstGroup[key].length : 'not array');
          }
        });
      }
    } else {
      console.log('✗ No group property in works');
    }
  } else {
    console.log('✗ No works section found');
  }

  if (data.educations) {
    console.log('✓ Educations section found');
    console.log('Educations keys:', Object.keys(data.educations));
    if (data.educations['affiliation-group']) {
      console.log('✓ Educations has affiliation-group:', data.educations['affiliation-group'].length);
    }
  }

  if (data.employments) {
    console.log('✓ Employments section found');
    console.log('Employments keys:', Object.keys(data.employments));
    if (data.employments['affiliation-group']) {
      console.log('✓ Employments has affiliation-group:', data.employments['affiliation-group'].length);
    }
  }
  
  // Store complete data for later reconstruction
  // Handle multiple possible ORCID API response structures
  const extractWorks = (worksData: any) => {
    if (Array.isArray(worksData)) return worksData;
    if (worksData?.group && Array.isArray(worksData.group)) {
      // Take only the FIRST work summary from each group (matches ORCID website display)
      // This prevents duplicates and matches the count shown on ORCID profile page
      const works = worksData.group.map((group: any) => {
        const summaries = group['work-summary'] || group.summary || group.works || [];
        return summaries.length > 0 ? summaries[0] : null;
      }).filter((work: any) => work !== null);
      
      console.log('Groups processed:', worksData.group.length, '→ Works extracted:', works.length);
      return works;
    }
    if (worksData?.['activities-summary']) {
      return extractWorks(worksData['activities-summary']);
    }
    return [];
  };

  const extractAffiliations = (affiliationData: any) => {
    if (Array.isArray(affiliationData)) return affiliationData;
    if (affiliationData?.['affiliation-group'] && Array.isArray(affiliationData['affiliation-group'])) {
      return affiliationData['affiliation-group'].flatMap((group: any) => 
        group.summaries || group.summary || group.affiliations || []
      );
    }
    // Handle direct summary arrays
    if (affiliationData?.summary) return Array.isArray(affiliationData.summary) ? affiliationData.summary : [affiliationData.summary];
    return [];
  };

  const completeData = {
    works: extractWorks(data.works),
    educations: extractAffiliations(data.educations),
    employments: extractAffiliations(data.employments)
  };
  
  console.log('Complete data extracted:');
  console.log('- Works:', completeData.works.length);
  console.log('- Educations:', completeData.educations.length);
  console.log('- Employments:', completeData.employments.length);

  try {
    // START: Smart Data Optimization for AI Processing
    // (Use the completeData already extracted above)
    
    // Create publication analytics summary (instead of sending all publications)
    const publicationAnalytics = {
      totalPublications: completeData.works.length,
      yearRange: completeData.works.length > 0 ? {
        earliest: Math.min(...completeData.works.map((w: any) => w['publication-date']?.year?.value || 9999)),
        latest: Math.max(...completeData.works.map((w: any) => w['publication-date']?.year?.value || 0))
      } : null,
      sampleRecentPublications: completeData.works
        .sort((a: any, b: any) => {
          const yearA = a['publication-date']?.year?.value || 0;
          const yearB = b['publication-date']?.year?.value || 0;
          return yearB - yearA;
        })
        .slice(0, 15) // Only send 15 most recent publications to AI
    };
    
    // Create optimized payload for AI processing
    const optimizedData = {
      profile: (orcidData.data || orcidData).profile,
      person: (orcidData.data || orcidData).person,
      publicationAnalytics,
      educations: completeData.educations.slice(0, 5),
      employments: completeData.employments.slice(0, 5),
      // Keep complete data for later reconstruction
      _completeData: completeData
    };
    
    console.log('Optimized data structure:');
    console.log('- Profile:', !!optimizedData.profile);
    console.log('- Person:', !!optimizedData.person);
    console.log('- Publication analytics samples:', optimizedData.publicationAnalytics.sampleRecentPublications.length);
    console.log('- Complete data preserved:', optimizedData._completeData.works.length);
    
    return optimizedData;
    
  } catch (error) {
    console.error('Error optimizing ORCID data:', error);
    // Return minimal safe structure if anything fails
    return {
      orcidId: '',
      basicInfo: { name: {}, biography: '' },
      education: [],
      employment: [],
      publicationAnalytics: { totalCount: 0, sampleRecent: [] },
      fundings: [],
      achievements: [],
      _completeData: { works: [] }
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orcidData, orcidId } = req.body;

    if (!orcidData) {
      return res.status(400).json({ error: 'ORCID data is required' });
    }

    console.log('=== ORCID PROCESSING DEBUG ===');
    console.log('Raw orcidData keys:', Object.keys(orcidData));
    console.log('orcidData type:', typeof orcidData);
    
    // Log first few characters to see what we're getting
    const rawDataString = JSON.stringify(orcidData);
    console.log('Data size:', rawDataString.length, 'characters');
    console.log('Data preview:', rawDataString.substring(0, 200) + '...');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, returning mock data');
      
      // Return mock data if OpenAI is not configured
      const mockStructuredData = {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        email: '',
        phone: '',
        location: 'Stanford, CA',
        headline: 'Research Scientist at Stanford University',
        summary: 'Experienced researcher in computational biology with focus on machine learning applications in genomics.',
        orcidId: orcidId || '0000-0000-0000-0000',
        website: 'https://example.com',
        experience: [
          {
            title: 'Research Scientist',
            company: 'Stanford University',
            location: 'Stanford, CA',
            startDate: '2020-01',
            endDate: 'Present',
            description: 'Leading research in computational biology and machine learning applications.'
          }
        ],
        education: [
          {
            institution: 'MIT',
            degree: 'PhD',
            fieldOfStudy: 'Computer Science',
            startDate: '2016',
            endDate: '2020',
            description: 'Dissertation on machine learning applications in biological systems'
          }
        ],
        publications: [
          {
            title: 'Machine Learning Applications in Genomics',
            journal: 'Nature Biotechnology',
            year: '2023',
            doi: '10.1038/s41587-023-01234-5',
            authors: 'Smith, J., et al.'
          }
        ],
        skills: ['Machine Learning', 'Python', 'Bioinformatics', 'Statistical Analysis'],
        keywords: ['Computational Biology', 'Genomics', 'Machine Learning', 'Data Science'],
        languages: [
          { language: 'English', proficiency: 'Native' }
        ]
      };

      return res.status(200).json(mockStructuredData);
    }

    // Truncate the data to avoid token limits
    const truncatedData = truncateORCIDData(orcidData);
    
    console.log('=== AFTER OPTIMIZATION ===');
    console.log('Truncated data keys:', Object.keys(truncatedData));
    console.log('Complete data works length:', (truncatedData as any)._completeData?.works?.length || 0);
    
    // Final safety check: estimate tokens and truncate further if needed
    const optimizedDataString = JSON.stringify(truncatedData);
    console.log('Optimized data size:', optimizedDataString.length, 'characters');
    const estimatedTokens = Math.ceil(optimizedDataString.length / 2.5); // More realistic estimate: 1 token ≈ 2.5 characters
    console.log('Estimated tokens:', estimatedTokens);

    // If still too large, use only basic profile info  
    let finalData: any = truncatedData;
    if (estimatedTokens > 8000) { // Much more aggressive limit to stay under 16K tokens
      console.warn(`ORCID data still too large (${estimatedTokens} tokens), using minimal data`);
      
      // Create super minimal data with only essential person info
      const person = truncatedData.person || {};
      const profile = truncatedData.profile || {};
      
      finalData = {
        profile: {
          'orcid-identifier': profile['orcid-identifier'] || {}
        },
        person: {
          name: person.name || {},
          emails: person.emails || {},
          biography: person.biography || null,
          'researcher-urls': person['researcher-urls'] || {},
          addresses: person.addresses || {},
          keywords: person.keywords || {}
        },
        publicationAnalytics: { totalCount: (truncatedData as any)._completeData?.works?.length || 0, sampleRecent: [] },
        employment: [], // Will be enhanced post-processing
        education: []   // Will be enhanced post-processing
      };
      
      // Debug minimal data structure
      console.log('=== MINIMAL DATA DEBUG ===');
      console.log('Final data size:', JSON.stringify(finalData).length, 'characters');
      console.log('Final estimated tokens:', Math.ceil(JSON.stringify(finalData).length / 4));
      console.log('Person name:', finalData.person.name);
      console.log('Person emails:', finalData.person.emails);
      console.log('Person biography:', finalData.person.biography);
    }

    const prompt = `
      Extract and structure the following information from this ORCID profile data and return it as a JSON object:
      
      Required fields:
      - firstName: string (from person.name.given-names.value or person.name['given-names'].value)
      - lastName: string (from person.name.family-name.value or person.name['family-name'].value)
      - email: string (from person.emails.email[0].email or similar nested structure)
      - phone: string (from contact details if available, empty if not)
      - location: string (from person.addresses.address[0].country.value or similar)
      - headline: string (create professional headline from current position/research area)
      - summary: string (from person.biography.value or create from research interests)
      - orcidId: string (from profile.orcid-identifier.path or profile['orcid-identifier'].path)
      - website: string (from person.researcher-urls.researcher-url[0].url.value or similar)
      - experience: array of objects with: title, company, location, startDate, endDate, description (from employments)
      - education: array of objects with: institution, degree, fieldOfStudy, startDate, endDate, description (from educations)
      - publications: array of objects with: title, journal, year, doi, authors (analyze from publicationAnalytics)
      - skills: array of strings (extract from research areas, keywords, or work descriptions)
      - keywords: array of strings (from person.keywords.keyword[].value or researcher keywords)
      - languages: array of objects with: language, proficiency (if available)

      Important notes:
      - ORCID data has nested structures with .value properties, extract carefully
      - For dates, use format "YYYY-MM" or "YYYY" for years only
      - Use "Present" for current positions
      - If information is not available, use empty string or empty array
      - Extract research keywords and technical skills separately
      - Create meaningful descriptions for experience and education
      - For publications, analyze the publicationAnalytics summary and sample recent publications
      - Return ONLY valid JSON without any additional text or formatting

      ORCID Profile Data:
      ${JSON.stringify(finalData, null, 2)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Changed from gpt-4 to handle larger inputs
      messages: [
        {
          role: "system", 
          content: "You are a professional profile extractor specializing in academic and research profiles. Extract structured data from ORCID profiles and return only valid JSON without any additional text or formatting. Also give at least 25 additional relevant research keywords and at least 25 technical skills that are not already present in the user's profile."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const extractedData = JSON.parse(responseContent);

    // POST-PROCESSING: Enhance structured data with complete data
    console.log('Enhancing with complete data...');
    const completeData = (truncatedData as any)._completeData;
    console.log('Complete data available:', !!completeData);
    console.log('Complete works length:', completeData?.works?.length || 0);
    console.log('Complete educations length:', completeData?.educations?.length || 0);
    console.log('Complete employments length:', completeData?.employments?.length || 0);
    
    // Initialize arrays if they don't exist (for minimal data cases)
    if (!extractedData.publications) extractedData.publications = [];
    if (!extractedData.education) extractedData.education = [];
    if (!extractedData.experience) extractedData.experience = [];
    
    // Enhance publications data - always populate even if minimal data was used
    if (completeData?.works && completeData.works.length > 0) {
      // Replace the sample publications with complete publications from summarizedData
      console.log('=== PUBLICATION ENHANCEMENT DEBUG ===');
      console.log('Sample work structure:', JSON.stringify(completeData.works[0], null, 2));
      
      extractedData.publications = completeData.works.map((work: any) => {
        // Handle ORCID's deeply nested title structure
        const extractTitle = (titleData: any) => {
          if (typeof titleData === 'string') return titleData;
          if (titleData?.title?.value) return titleData.title.value;
          if (titleData?.title) return titleData.title;
          if (titleData?.value) return titleData.value;
          return '';
        };

        // Handle ORCID external IDs structure for DOI
        const extractDOI = (externalIds: any) => {
          if (!externalIds) return '';
          if (externalIds['external-id'] && Array.isArray(externalIds['external-id'])) {
            const doiId = externalIds['external-id'].find((id: any) => id['external-id-type'] === 'doi');
            return doiId?.['external-id-value'] || '';
          }
          return '';
        };

        // Handle publication date structure
        const extractYear = (pubDate: any) => {
          if (!pubDate) return '';
          if (pubDate.year?.value) return pubDate.year.value.toString();
          if (pubDate.year) return pubDate.year.toString();
          return '';
        };

        // Handle journal title structure
        const extractJournal = (work: any) => {
          if (work['journal-title']?.value) return work['journal-title'].value;
          if (work.journal) return work.journal;
          return '';
        };

        return {
          title: extractTitle(work.title),
          subtitle: extractTitle(work.subtitle) || '',
          journal: extractJournal(work),
          year: extractYear(work['publication-date']),
          type: work.type || '',
          doi: extractDOI(work['external-ids']),
          authors: Array.isArray(work.authors) && work.authors.length > 0 ? work.authors.join(', ') : ''
        };
      }).filter((pub: any) => pub.title && pub.title.trim && pub.title.trim());
      
      console.log(`Enhanced with ${extractedData.publications.length} complete publications`);
    } else {
      console.log('Skipping publication enhancement - no data available');
      console.log('extractedData.publications exists:', !!extractedData.publications);
      console.log('completeData exists:', !!completeData);
      console.log('completeData.works exists:', !!completeData?.works);
      console.log('completeData.works.length:', completeData?.works?.length || 0);
    }

    // Enhance education data - always populate even if minimal data was used
    if (completeData?.educations && completeData.educations.length > 0) {
      console.log('=== EDUCATION ENHANCEMENT DEBUG ===');
      console.log('Sample education structure:', JSON.stringify(completeData.educations[0], null, 2));
      
      extractedData.education = completeData.educations.map((edu: any) => {
        // Handle ORCID education structure - data is nested under 'education-summary'
        const summary = edu['education-summary'] || edu;
        
        const extractEducationField = (fieldData: any) => {
          if (typeof fieldData === 'string') return fieldData;
          if (fieldData?.value) return fieldData.value;
          return '';
        };

        return {
          institution: extractEducationField(summary.organization?.name) || '',
          degree: extractEducationField(summary['role-title']) || '',
          fieldOfStudy: extractEducationField(summary['department-name']) || '',
          startDate: summary['start-date']?.year?.value || '',
          endDate: summary['end-date']?.year?.value || 'Present',
          description: extractEducationField(summary.description) || ''
        };
      }).filter((edu: any) => edu.institution && edu.institution.trim());
      
      console.log(`Enhanced with ${extractedData.education.length} complete education entries`);
    }

    // Enhance employment data - always populate even if minimal data was used
    if (completeData?.employments && completeData.employments.length > 0) {
      console.log('=== EMPLOYMENT ENHANCEMENT DEBUG ===');
      console.log('Sample employment structure:', JSON.stringify(completeData.employments[0], null, 2));
      
      extractedData.experience = completeData.employments.map((emp: any) => {
        // Handle ORCID employment structure - data is nested under 'employment-summary'
        const summary = emp['employment-summary'] || emp;
        
        const extractEmploymentField = (fieldData: any) => {
          if (typeof fieldData === 'string') return fieldData;
          if (fieldData?.value) return fieldData.value;
          return '';
        };

        return {
          title: extractEmploymentField(summary['role-title']) || extractEmploymentField(summary['department-name']) || '',
          company: extractEmploymentField(summary.organization?.name) || '',
          location: summary.organization?.address ? `${summary.organization.address.city || ''}, ${summary.organization.address.region || ''}, ${summary.organization.address.country || ''}`.replace(/^,\s*|,\s*$/g, '') : '',
          startDate: summary['start-date']?.year?.value || '',
          endDate: summary['end-date']?.year?.value || 'Present',
          description: extractEmploymentField(summary.description) || extractEmploymentField(summary['department-name']) || ''
        };
      }).filter((emp: any) => emp.company && emp.company.trim());
      
      console.log(`Enhanced with ${extractedData.experience.length} complete employment entries`);
    }

    // Validate and set ORCID ID
    extractedData.orcidId = orcidId || extractedData.orcidId || '';

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'headline', 'summary', 'orcidId', 'website', 'experience', 'education', 'publications', 'skills', 'keywords'];
    for (const field of requiredFields) {
      if (!(field in extractedData)) {
        if (['experience', 'education', 'publications', 'skills', 'keywords', 'languages'].includes(field)) {
          extractedData[field] = [];
        } else {
          extractedData[field] = '';
        }
      }
    }

    res.status(200).json(extractedData);
  } catch (error) {
    console.error('Error extracting ORCID profile:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
      }
      if (error.message.includes('quota') || error.message.includes('rate_limit')) {
        return res.status(429).json({ error: 'AI service quota exceeded. Please try again later.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to extract profile data. Please try again.' });
  }
}