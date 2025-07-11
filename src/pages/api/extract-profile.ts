import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, returning mock data');
      
      // Return mock data if OpenAI is not configured
      const mockStructuredData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        headline: 'Software Engineer at TechCorp',
        summary: 'Experienced software engineer with 5+ years in full-stack development, passionate about creating innovative solutions and mentoring teams.',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'TechCorp',
            location: 'San Francisco, California, United States',
            startDate: '2020-01',
            endDate: 'Present',
            description: 'Led development of key features for the main product. Mentored junior developers and improved team productivity by 30%.'
          }
        ],
        education: [
          {
            institution: 'Stanford University',
            degree: 'Master of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2016',
            endDate: '2018',
            description: 'Focus on Machine Learning and Distributed Systems'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker'],
        certifications: [],
        languages: [
          { language: 'English', proficiency: 'Native' }
        ]
      };

      return res.status(200).json(mockStructuredData);
    }

    const prompt = `
      Extract the following information from this LinkedIn profile text and return it as a JSON object:
      
      Required fields:
      - firstName: string
      - lastName: string  
      - email: string (extract from contact info)
      - phone: string (extract from contact info)
      - location: string
      - headline: string (professional title/headline)
      - summary: string (about section or summary)
      - experience: array of objects with: title, company, location, startDate, endDate, description
      - education: array of objects with: institution, degree, fieldOfStudy, startDate, endDate, description
      - skills: array of strings
      - certifications: array of objects with: name, organization, issueDate, expirationDate
      - languages: array of objects with: language, proficiency

      Important notes:
      - For dates, use format "YYYY-MM" or "YYYY" for years only
      - Use "Present" for current positions
      - If information is not available, use empty string or empty array
      - Return ONLY valid JSON, no additional text or formatting

      LinkedIn Profile Text:
      ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "You are a professional profile extractor. Extract structured data from LinkedIn profiles and return only valid JSON without any additional text or formatting."
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

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'headline', 'summary', 'experience', 'education', 'skills'];
    for (const field of requiredFields) {
      if (!(field in extractedData)) {
        extractedData[field] = field === 'experience' || field === 'education' || field === 'skills' ? [] : '';
      }
    }

    res.status(200).json(extractedData);
  } catch (error) {
    console.error('Error extracting profile:', error);
    res.status(500).json({ error: 'Failed to extract profile data' });
  }
} 