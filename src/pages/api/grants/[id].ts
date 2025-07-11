import type { NextApiRequest, NextApiResponse } from 'next';
// import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - TODO: Uncomment when ready to use real database
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

interface GrantDetail {
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
  matchScore?: number;
  // Additional fields for detailed view
  fullDescription: string;
  requirements: string[];
  applicationProcess: string;
  contactInfo: string;
  websiteUrl: string;
  documents: string[];
}

interface GrantDetailResponse {
  success: boolean;
  grant?: GrantDetail;
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

// Mock detailed grant data for development
const mockGrantDetails: { [key: string]: GrantDetail } = {
  '1': {
    grant_id: '1',
    title: 'Advanced Research in Artificial Intelligence',
    abstract: 'Supporting cutting-edge research in AI, machine learning, and related computational technologies to advance scientific understanding and practical applications.',
    funding_amount: 500000,
    start_date: '2024-01-15T10:00:00Z',
    status: 'ACTIVE',
    principal_investigators: [{ name: 'Principal Investigator' }],
    institution: {
      name: 'Research Institution',
      city: 'Unknown',
      state: 'Unknown',
      country: 'USA'
    },
    research_areas: ['Technology', 'Research', 'Innovation'],
    agency: 'National Science Foundation',
    created_at: '2024-01-15T10:00:00Z',
    source_id: '1',
    matchScore: 92,
    fullDescription: 'This comprehensive funding opportunity is designed to support innovative research and development in Artificial Intelligence, Machine Learning, and related computational technologies. The program aims to foster collaboration between academic institutions, industry partners, and government agencies to address critical challenges in AI research and advance scientific knowledge. Successful applicants will have access to additional resources including mentorship programs, networking opportunities, and potential follow-up funding for exceptional projects. The initiative specifically focuses on breakthrough research that can lead to practical applications in healthcare, education, transportation, and other critical sectors.',
    requirements: [
      'Principal Investigator must hold a PhD in Computer Science, Mathematics, or related field',
      'Institution must be eligible to receive federal funding',
      'Detailed budget justification with itemized expenses required',
      'Preliminary data or proof of concept demonstrating feasibility',
      'Collaboration letters from industry or academic partners',
      'Ethical considerations and AI safety protocols must be addressed',
      'Data management and sharing plan required',
      'Environmental impact assessment if applicable'
    ],
    applicationProcess: 'Applications must be submitted through the NSF FastLane system or Research.gov portal. The review process includes initial administrative review for completeness, peer review by subject matter experts in AI and machine learning, and final selection by the program committee. Applicants may be invited for virtual presentations or interviews during the review process. The typical review timeline is 4-6 months from submission deadline.',
    contactInfo: 'Dr. Sarah Chen, Program Officer - AI Research Division - sarah.chen@nsf.gov - (703) 292-8900',
    websiteUrl: 'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504984',
    documents: [
      'NSF AI Research Program Guidelines (PDF)',
      'Budget Template and Instructions (Excel)',
      'Evaluation Criteria and Review Process (PDF)',
      'Sample Successful AI Research Proposal (PDF)',
      'Data Management Plan Template (Word)',
      'Ethical AI Guidelines (PDF)'
    ]
  },
  '2': {
    grant_id: '2',
    title: 'Sustainable Energy Solutions Initiative',
    abstract: 'Funding for innovative renewable energy technologies and sustainable energy systems to address climate change and energy security challenges.',
    funding_amount: 1000000,
    start_date: '2024-01-10T09:00:00Z',
    status: 'ACTIVE',
    principal_investigators: [{ name: 'Principal Investigator' }],
    institution: {
      name: 'Research Institution',
      city: 'Unknown',
      state: 'Unknown',
      country: 'USA'
    },
    research_areas: ['Environment', 'Energy', 'Technology'],
    agency: 'Department of Energy',
    created_at: '2024-01-10T09:00:00Z',
    source_id: '2',
    matchScore: 88,
    fullDescription: 'The Sustainable Energy Solutions Initiative represents a comprehensive approach to addressing the global energy challenge through innovative research and development. This program supports breakthrough technologies in renewable energy, energy storage, grid modernization, and energy efficiency. The initiative emphasizes practical solutions that can be deployed at scale to reduce carbon emissions and enhance energy security. Successful projects will demonstrate clear pathways to commercialization and significant environmental impact. The program encourages interdisciplinary collaboration and industry partnerships to accelerate the transition to sustainable energy systems.',
    requirements: [
      'Principal Investigator must have demonstrated expertise in energy systems',
      'Minimum 25% cost-sharing from participating organizations',
      'Detailed technical feasibility study required',
      'Environmental impact assessment and mitigation plan',
      'Commercialization strategy and market analysis',
      'Industry partnership agreements preferred',
      'Intellectual property management plan',
      'Safety protocols for energy research must be established'
    ],
    applicationProcess: 'Applications are submitted through the Department of Energy EERE Exchange platform. The review process consists of technical merit review, economic viability assessment, and potential impact evaluation. Selected applicants will present their proposals to a review panel including DOE officials, industry experts, and academic reviewers. The evaluation timeline is approximately 6 months with potential for expedited review for exceptional proposals.',
    contactInfo: 'Dr. Michael Rodriguez, Program Manager - Renewable Energy Division - michael.rodriguez@doe.gov - (202) 586-9220',
    websiteUrl: 'https://www.energy.gov/eere/funding/sustainable-energy-solutions-initiative',
    documents: [
      'DOE Energy Research Program Guidelines (PDF)',
      'Cost-Sharing Requirements and Documentation (PDF)',
      'Technical Merit Evaluation Criteria (PDF)',
      'Environmental Impact Assessment Template (Word)',
      'Commercialization Plan Template (Word)',
      'Sample Energy Research Proposal (PDF)'
    ]
  },
  '3': {
    grant_id: '3',
    title: 'Healthcare Innovation and Digital Health',
    abstract: 'Supporting research and development in digital health technologies, telemedicine, and innovative healthcare delivery systems.',
    funding_amount: 750000,
    start_date: '2024-01-08T13:45:00Z',
    status: 'ACTIVE',
    principal_investigators: [{ name: 'Principal Investigator' }],
    institution: {
      name: 'Research Institution',
      city: 'Unknown',
      state: 'Unknown',
      country: 'USA'
    },
    research_areas: ['Healthcare', 'Technology', 'Innovation'],
    agency: 'National Institutes of Health',
    created_at: '2024-01-08T13:45:00Z',
    source_id: '3',
    matchScore: 85,
    fullDescription: 'The Healthcare Innovation and Digital Health program addresses the rapidly evolving landscape of digital healthcare technologies. This initiative supports research in telemedicine, health informatics, wearable health devices, AI-powered diagnostics, and digital therapeutics. The program aims to improve healthcare access, reduce costs, and enhance patient outcomes through innovative technology solutions. Special emphasis is placed on addressing health disparities and improving care for underserved populations. Projects should demonstrate potential for clinical implementation and measurable health impact.',
    requirements: [
      'Principal Investigator must have clinical or health informatics expertise',
      'IRB approval required for studies involving human subjects',
      'HIPAA compliance and data security measures mandatory',
      'Clinical validation plan for digital health interventions',
      'Healthcare partner institution involvement required',
      'Patient engagement and user experience considerations',
      'Regulatory pathway analysis (FDA approval if applicable)',
      'Health outcome measurement and evaluation plan'
    ],
    applicationProcess: 'Applications are submitted through NIH grants.gov system following standard NIH submission guidelines. The review process includes scientific merit review by the Digital Health Study Section, clinical relevance assessment, and potential impact evaluation. Special attention is given to innovation, clinical significance, and implementation feasibility. The standard NIH review timeline of 6-9 months applies.',
    contactInfo: 'Dr. Jennifer Park, Program Officer - Digital Health Research - jennifer.park@nih.gov - (301) 496-4000',
    websiteUrl: 'https://www.nih.gov/research-training/digital-health-innovation-program',
    documents: [
      'NIH Digital Health Research Guidelines (PDF)',
      'Clinical Study Design Requirements (PDF)',
      'HIPAA Compliance Checklist (PDF)',
      'Digital Health Validation Framework (PDF)',
      'Patient Engagement Best Practices (PDF)',
      'Sample Digital Health Research Proposal (PDF)'
    ]
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GrantDetailResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { id } = req.query;
    const grantId = id as string;

    if (!grantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Grant ID is required' 
      });
    }

    console.log(`Fetching grant detail for ID: ${grantId}`);

    // Extract Authorization header from request
    const authHeader = req.headers.authorization;
    
    // Check if authorization header is present
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization header required' 
      });
    }

    // First, try to get the grant from the external API
    try {
      const externalApiUrl = process.env.EXTERNAL_GRANTS_API_URL || 'http://127.0.0.1:5000/match-grants';
      
      // Get all grants to find the specific one
      const apiResponse = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          dimension: 1536, // Default dimension
          top_k: 100, // Get more grants to find the specific one
          offset: 0
        })
      });

      if (apiResponse.ok) {
        const externalGrants: ExternalGrantResponse[] = await apiResponse.json();
        
        // Find the specific grant by ID
        const targetGrant = externalGrants.find(grant => grant.grant_uid === grantId);
        
                 if (targetGrant) {
           // Map external grant to our GrantDetail format
           const grantDetail: GrantDetail = {
             grant_id: targetGrant.grant_uid,
             title: targetGrant.title,
             abstract: `Research grant in ${targetGrant.research_areas.join(', ')} from ${targetGrant.agency}. This grant focuses on advancing knowledge and innovation in these key research areas.`,
             funding_amount: parseInt(targetGrant.funding_amount) || 0,
             start_date: new Date().toISOString().split('T')[0], // Default to today since start_date not provided
             status: 'ACTIVE',
             principal_investigators: [{ name: 'Principal Investigator' }], // Default since not provided
             institution: {
               name: 'Research Institution',
               city: 'Unknown',
               state: 'Unknown',
               country: 'USA'
             },
             research_areas: targetGrant.research_areas,
             agency: targetGrant.agency,
             created_at: new Date().toISOString(),
             source_id: targetGrant.grant_uid,
             matchScore: targetGrant.match_score,
             // Enhanced details for the detailed view
             fullDescription: `This is a comprehensive grant opportunity from ${targetGrant.agency}. The grant supports innovative research and development in ${targetGrant.research_areas.join(', ')}. This funding opportunity aims to advance scientific knowledge and practical applications in the specified research areas.`,
             requirements: [
               'Principal Investigator must hold appropriate academic credentials',
               'Institution must be eligible to receive funding',
               'Detailed project proposal with clear objectives',
               'Budget justification and financial documentation',
               'Timeline and milestones for project completion',
               'Risk assessment and mitigation strategies',
               'Collaboration and partnership agreements if applicable',
               'Compliance with all applicable regulations and guidelines'
             ],
             applicationProcess: 'Applications are submitted through the standard grant application portal. The review process includes initial administrative review, technical evaluation by subject matter experts, and final selection by the program committee. Applicants may be invited for presentations or interviews during the review process. The typical review timeline is 4-6 months from submission deadline.',
             contactInfo: `Program Officer - ${targetGrant.agency} - program.officer@agency.gov - (555) 123-4567`,
             websiteUrl: `https://www.${targetGrant.agency.toLowerCase().replace(/\s+/g, '')}.gov/funding-opportunities`,
             documents: [
               'Grant Application Guidelines (PDF)',
               'Budget Template and Instructions (Excel)',
               'Evaluation Criteria and Review Process (PDF)',
               'Sample Successful Proposal (PDF)',
               'Technical Requirements Document (PDF)',
               'Compliance Checklist (PDF)'
             ]
           };

          return res.status(200).json({
            success: true,
            grant: grantDetail
          });
        }
      }
    } catch (externalApiError) {
      console.error('Error fetching from external API:', externalApiError);
      // Continue to fallback logic
    }

    // Fallback to mock data if external API fails or grant not found
    let grantDetail = mockGrantDetails[grantId];

    if (!grantDetail) {
      // Generate fallback grant detail for any ID
      grantDetail = {
        grant_id: grantId,
        title: `Grant ${grantId}`,
        abstract: `This is a grant with ID ${grantId}. Detailed information will be available when connected to the actual database.`,
        funding_amount: 500000,
        start_date: new Date().toISOString(),
        status: 'ACTIVE',
        principal_investigators: [{ name: 'Principal Investigator' }],
        institution: {
          name: 'Research Institution',
          city: 'Unknown',
          state: 'Unknown',
          country: 'USA'
        },
        research_areas: ['Research', 'Innovation', 'Development'],
        agency: 'Funding Agency',
        created_at: new Date().toISOString(),
        source_id: grantId,
        matchScore: 85,
        fullDescription: `This is a comprehensive grant opportunity with ID ${grantId}. The full description includes detailed information about the research objectives, methodology, expected outcomes, and impact. This grant supports innovative research and development in various fields including technology, healthcare, environment, and education. Successful applicants will have access to funding, resources, and support to advance their research goals.`,
        requirements: [
          'Principal Investigator must hold appropriate academic credentials',
          'Institution must be eligible to receive funding',
          'Detailed project proposal with clear objectives',
          'Budget justification and financial documentation',
          'Timeline and milestones for project completion',
          'Risk assessment and mitigation strategies',
          'Collaboration and partnership agreements if applicable',
          'Compliance with all applicable regulations and guidelines'
        ],
        applicationProcess: 'Applications are submitted through the standard grant application portal. The review process includes initial administrative review, technical evaluation by subject matter experts, and final selection by the program committee. Applicants may be invited for presentations or interviews during the review process. The typical review timeline is 4-6 months from submission deadline.',
        contactInfo: 'Program Officer - program.officer@agency.gov - (555) 123-4567',
        websiteUrl: 'https://www.agency.gov/funding-opportunities',
        documents: [
          'Grant Application Guidelines (PDF)',
          'Budget Template and Instructions (Excel)',
          'Evaluation Criteria and Review Process (PDF)',
          'Sample Successful Proposal (PDF)',
          'Technical Requirements Document (PDF)',
          'Compliance Checklist (PDF)'
        ]
      };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return res.status(200).json({
      success: true,
      grant: grantDetail
    });

  } catch (error) {
    console.error('Error fetching grant detail:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

// TODO: Implement actual database queries
/*
Real implementation would look like:

// Fetch grant details from database
const { data: grantDetail, error } = await supabase
  .from('grant_opportunities')
  .select(`
    *,
    grant_requirements (requirement),
    grant_documents (document_name, document_url),
    grant_contacts (contact_name, contact_email, contact_phone)
  `)
  .eq('id', grantId)
  .single();

if (error) {
  console.error('Database error:', error);
  return res.status(500).json({ 
    success: false, 
    message: 'Database error' 
  });
}

// If user is authenticated, calculate personalized match score
const userId = req.headers.authorization; // Extract from JWT
if (userId) {
  const matchScore = await calculatePersonalizedMatchScore(userId, grantId);
  grantDetail.matchScore = matchScore;
}

// Track grant view for analytics
await supabase
  .from('grant_views')
  .insert([
    {
      grant_id: grantId,
      user_id: userId,
      viewed_at: new Date().toISOString()
    }
  ]);
*/ 