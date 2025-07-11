import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiUser, 
  FiLoader, 
  FiCheck, 
  FiAlertCircle,
  FiExternalLink
} from 'react-icons/fi';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

interface ParsedProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  orcidId: string;
  website: string;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  publications: {
    title: string;
    journal: string;
    year: string;
    doi: string;
    authors: string;
  }[];
  skills: string[];
  keywords: string[];
  languages: {
    language: string;
    proficiency: string;
  }[];
}

export default function ORCIDImportPage() {
  const [orcidId, setOrcidId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedProfile | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'education' | 'publications' | 'skills'>('basic');

  const validateOrcidId = (id: string): boolean => {
    // ORCID ID format: 0000-0000-0000-0000
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    return orcidRegex.test(id);
  };

  const fetchORCIDProfile = async () => {
    if (!orcidId.trim()) {
      setError('Please enter an ORCID ID');
      return;
    }

    const cleanedId = orcidId.trim().replace(/https?:\/\/(orcid\.org\/)?/, '');
    
    if (!validateOrcidId(cleanedId)) {
      setError('Please enter a valid ORCID ID (format: 0000-0000-0000-0000)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Fetch ORCID data
      const orcidResponse = await fetch('/api/fetch-orcid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcidId: cleanedId }),
      });

      if (!orcidResponse.ok) {
        throw new Error('Failed to fetch ORCID profile');
      }

      const { data } = await orcidResponse.json();

      // Step 2: Send to OpenAI for structured extraction
      const extractResponse = await fetch('/api/extract-orcid-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcidData: data, orcidId: cleanedId }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract profile data');
      }

      const structuredData = await extractResponse.json();
      setParsedData(structuredData);
    } catch (err) {
      console.error('Error fetching ORCID profile:', err);
      setError('Failed to fetch ORCID profile. Please check the ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (section: keyof ParsedProfile, field: string, value: string | string[], index?: number) => {
    if (!parsedData) return;

    setParsedData(prev => {
      if (!prev) return null;
      
      if (index !== undefined && Array.isArray(prev[section])) {
        const updatedArray = [...(prev[section] as any[])];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...prev, [section]: updatedArray };
      } else {
        return { ...prev, [section]: value };
      }
    });
  };

  const saveProfile = async () => {
    if (!parsedData) return;

    try {
      // Get auth token
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/save-orcid-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      alert('ORCID profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Layout
      title="ORCID Import - Fundizzle"
      description="Import your ORCID profile to automatically populate your research information."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container-custom py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ORCID Profile Import</h1>
                <p className="text-gray-600">Import your research profile from ORCID to showcase your academic work</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {!parsedData ? (
            <div className="max-w-2xl mx-auto">
              {/* ORCID ID Input Section */}
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiUser className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Enter Your ORCID ID</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  ORCID provides a persistent digital identifier for researchers. Enter your public ORCID ID to import your academic profile.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ORCID ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={orcidId}
                        onChange={(e) => setOrcidId(e.target.value)}
                        placeholder="0000-0000-0000-0000 or https://orcid.org/0000-0000-0000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        onKeyDown={(e) => e.key === 'Enter' && fetchORCIDProfile()}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Format: 0000-0000-0000-0000 (you can also paste the full ORCID URL)
                    </p>
                  </div>

                  <Button 
                    onClick={fetchORCIDProfile} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Fetching Profile...
                      </>
                    ) : (
                      'Import ORCID Profile'
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}
              </div>

              {/* ORCID Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center gap-2">
                  <FiExternalLink className="w-5 h-5" />
                  What is ORCID?
                </h3>
                <div className="space-y-3 text-green-800">
                  <p>ORCID (Open Researcher and Contributor ID) provides a persistent digital identifier for researchers.</p>
                  <div>
                    <p className="font-medium mb-2">We can import:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Basic profile information (name, bio, keywords)</li>
                      <li>Educational background and qualifications</li>
                      <li>Employment and work experience</li>
                      <li>Publications and research outputs</li>
                      <li>Research interests and expertise areas</li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    Don't have an ORCID ID? <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-medium">Create one for free</a>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Profile Form with Tabs */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">ORCID Profile Successfully Imported</h2>
                      <p className="text-gray-600">Review and edit the information below</p>
                    </div>
                  </div>
                  <Button onClick={saveProfile}>Save Profile</Button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('basic')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'basic'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Basic info
                    </button>
                    <button
                      onClick={() => setActiveTab('experience')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'experience'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      experience
                    </button>
                    <button
                      onClick={() => setActiveTab('education')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'education'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      education
                    </button>
                    <button
                      onClick={() => setActiveTab('publications')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'publications'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      publications
                    </button>
                    <button
                      onClick={() => setActiveTab('skills')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'skills'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      keywords & skills
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                  {activeTab === 'basic' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            value={parsedData.firstName}
                            onChange={(e) => handleFieldChange('firstName', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            value={parsedData.lastName}
                            onChange={(e) => handleFieldChange('lastName', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ORCID ID</label>
                          <input
                            type="text"
                            value={parsedData.orcidId}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={parsedData.email}
                            onChange={(e) => handleFieldChange('email', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                          <input
                            type="url"
                            value={parsedData.website}
                            onChange={(e) => handleFieldChange('website', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={parsedData.location}
                            onChange={(e) => handleFieldChange('location', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Professional Headline</label>
                          <input
                            type="text"
                            value={parsedData.headline}
                            onChange={(e) => handleFieldChange('headline', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
                          <textarea
                            value={parsedData.summary}
                            onChange={(e) => handleFieldChange('summary', '', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'experience' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Professional Experience</h3>
                      <div className="space-y-6">
                        {parsedData.experience.length > 0 ? parsedData.experience.map((exp, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Position Title</label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) => handleFieldChange('experience', 'title', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleFieldChange('experience', 'company', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                  type="text"
                                  value={exp.startDate}
                                  onChange={(e) => handleFieldChange('experience', 'startDate', e.target.value, index)}
                                  placeholder="YYYY-MM"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                  type="text"
                                  value={exp.endDate}
                                  onChange={(e) => handleFieldChange('experience', 'endDate', e.target.value, index)}
                                  placeholder="YYYY-MM or Present"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                  value={exp.description}
                                  onChange={(e) => handleFieldChange('experience', 'description', e.target.value, index)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-500 text-center py-8">No experience data found in ORCID profile.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'education' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Education</h3>
                      <div className="space-y-6">
                        {parsedData.education.length > 0 ? parsedData.education.map((edu, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => handleFieldChange('education', 'institution', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => handleFieldChange('education', 'degree', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                                <input
                                  type="text"
                                  value={edu.fieldOfStudy}
                                  onChange={(e) => handleFieldChange('education', 'fieldOfStudy', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Years</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={edu.startDate}
                                    onChange={(e) => handleFieldChange('education', 'startDate', e.target.value, index)}
                                    placeholder="Start"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                  />
                                  <input
                                    type="text"
                                    value={edu.endDate}
                                    onChange={(e) => handleFieldChange('education', 'endDate', e.target.value, index)}
                                    placeholder="End"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-500 text-center py-8">No education data found in ORCID profile.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'publications' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Publications</h3>
                      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                        {parsedData.publications.length > 0 ? parsedData.publications.map((pub, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                  type="text"
                                  value={pub.title}
                                  onChange={(e) => handleFieldChange('publications', 'title', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Journal/Conference</label>
                                <input
                                  type="text"
                                  value={pub.journal}
                                  onChange={(e) => handleFieldChange('publications', 'journal', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                                <input
                                  type="text"
                                  value={pub.year}
                                  onChange={(e) => handleFieldChange('publications', 'year', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">DOI</label>
                                <input
                                  type="text"
                                  value={pub.doi}
                                  onChange={(e) => handleFieldChange('publications', 'doi', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
                                <input
                                  type="text"
                                  value={pub.authors}
                                  onChange={(e) => handleFieldChange('publications', 'authors', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-500 text-center py-8">No publications found in ORCID profile.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Skills & Interests</h3>
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-3">Your Skills & Interests</h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Array.from(new Set([...(parsedData.keywords || []), ...(parsedData.skills || [])])).map((item, index) => (
                              <span
                                key={item + index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {item}
                                <button
                                  type="button"
                                  className="ml-2 text-blue-500 hover:text-red-600 focus:outline-none"
                                  onClick={() => {
                                    // Remove from both keywords and skills
                                    const newKeywords = (parsedData.keywords || []).filter((k) => k !== item);
                                    const newSkills = (parsedData.skills || []).filter((s) => s !== item);
                                    handleFieldChange('keywords', '', newKeywords);
                                    handleFieldChange('skills', '', newSkills);
                                  }}
                                  aria-label={`Remove ${item}`}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Add a skill or interest and press Enter"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                // Split input by commas, trim, and filter out empty strings
                                const values = e.currentTarget.value
                                  .split(',')
                                  .map(v => v.trim())
                                  .filter(Boolean);
                                if (values.length > 0) {
                                  const allSkills = Array.from(new Set([...(parsedData.keywords || []), ...(parsedData.skills || []), ...values]));
                                  handleFieldChange('keywords', '', allSkills);
                                  handleFieldChange('skills', '', allSkills);
                                }
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button - Always visible */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
                  <Link href="/dashboard">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button onClick={saveProfile}>Save Profile</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 