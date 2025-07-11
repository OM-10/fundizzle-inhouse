import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { FiUpload, FiFileText, FiLoader, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

interface ParsedProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
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
  skills: string[];
  certifications: {
    name: string;
    organization: string;
    issueDate: string;
    expirationDate: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
}

export default function LinkedInImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedProfile | null>(null);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'education' | 'skills'>('basic');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const parseLinkedInPDF = async () => {
    if (!file) return;

    setIsParsing(true);
    setError('');

    try {
      // Step 1: Extract text from PDF using server-side API
      const formData = new FormData();
      formData.append('file', file);

      const pdfResponse = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to parse PDF');
      }

      const { text } = await pdfResponse.json();

      // Step 2: Send extracted text to OpenAI for structured extraction
      const openaiResponse = await fetch('/api/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!openaiResponse.ok) {
        throw new Error('Failed to extract profile data');
      }

      const structuredData = await openaiResponse.json();

      setParsedData(structuredData);
    } catch (err) {
      console.error('Error parsing LinkedIn PDF:', err);
      setError('Failed to parse the PDF. Please try again or contact support.');
    } finally {
      setIsParsing(false);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/save-linkedin-profile`, {
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
      alert('LinkedIn profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Layout
      title="LinkedIn Import - Fundizzle"
      description="Import your LinkedIn profile to automatically populate your information."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LinkedIn Profile Import</h1>
                <p className="text-gray-600">Upload your LinkedIn PDF to automatically populate your profile</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {!parsedData ? (
            <div className="max-w-2xl mx-auto">
              {/* File Upload Section */}
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload LinkedIn PDF</h2>
                <p className="text-gray-600 mb-6">
                  Export your LinkedIn profile as a PDF and upload it here. We'll automatically extract your information using AI.
                </p>

                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {file ? file.name : 'Drop your LinkedIn PDF here'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Button variant="outline" type="button" className="pointer-events-none">
                      Choose File
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    Supported format: PDF (max 10MB)
                  </p>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                {file && !error && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiFileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">{file.name}</p>
                          <p className="text-sm text-blue-700">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button onClick={parseLinkedInPDF} disabled={isParsing}>
                        {isParsing ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          'Parse Profile'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">How to export your LinkedIn profile:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>Go to your LinkedIn profile page</li>
                  <li>Click "More" button near your profile picture</li>
                  <li>Select "Save to PDF"</li>
                  <li>Download the PDF file</li>
                  <li>Upload it here for automatic parsing</li>
                </ol>
              </div>
            </div>
          ) : (
            /* Profile Form */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Profile Successfully Parsed</h2>
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
                      work experience
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
                      onClick={() => setActiveTab('skills')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'skills'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Skills
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={parsedData.email}
                            onChange={(e) => handleFieldChange('email', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={parsedData.phone}
                            onChange={(e) => handleFieldChange('phone', '', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div className="md:col-span-2">
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
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
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Work Experience</h3>
                      <div className="space-y-6">
                        {parsedData.experience.map((exp, index) => (
                          <div key={index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                                <input
                                  type="text"
                                  value={exp.title}
                                  onChange={(e) => handleFieldChange('experience', 'title', e.target.value, index)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
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
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'education' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Education</h3>
                      <div className="space-y-6">
                        {parsedData.education.map((edu, index) => (
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
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-6">Skills</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Your Skills</label>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {parsedData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Edit Skills (comma separated)
                          </label>
                          <textarea
                            value={parsedData.skills.join(', ')}
                            onChange={(e) => handleFieldChange('skills', '', e.target.value.split(', '))}
                            placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            rows={4}
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Separate each skill with a comma. Skills will appear as tags above.
                          </p>
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