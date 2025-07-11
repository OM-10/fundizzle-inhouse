import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

interface UserPreferences {
  // 1. Eligibility & Career-Stage Constraints
  eligibility: {
    careerStage: string;
    citizenship: string[];
    residencyStatus: string;
    institutionType: string;
    previousMajorAwards: string[];
    yearsOfExperience: number;
  };
  
  // 2. Preferred Funding Mechanisms
  fundingMechanisms: {
    grantTypes: string[];
    specificMechanisms: string[];
    durationPreference: string[];
    renewabilityPreference: string;
  };
  
  // 3. Budget Parameters
  budgetParameters: {
    minAmount: number;
    maxAmount: number;
    indirectCostRate: number;
    costSharingAbility: boolean;
    costSharingPercentage: number;
    budgetCategoriesNeeded: string[];
  };
  
  // 4. Timing & Workload Considerations
  timing: {
    projectReadiness: string;
    earliestStartDate: string;
    preferredStartWindow: string;
    multiStageApplicationTolerance: string;
    timeToSubmit: string;
  };
  
  // 5. Thematic & Strategic Fit
  thematicFit: {
    researchKeywords: string[];
    focusAreas: string[];
    societalPriorities: string[];
    targetPopulations: string[];
    translationalStage: string;
  };
  
  // 6. Collaboration & Partnership Preferences
  collaboration: {
    desiredCollaborators: string[];
    mandatoryCollaborators: string[];
    leadershipPreference: string;
    dataSharingStance: string;
    openScienceStance: string;
  };
  
  // 7. Compliance, Ethics & Regulatory Factors
  compliance: {
    humanSubjectsApproval: boolean;
    animalUseApproval: boolean;
    ipConstraintsComfort: string;
    environmentalConsiderations: boolean;
    dualUseResearchConcerns: boolean;
  };
  
  // 8. Historical Performance & Feedback
  historicalPerformance: {
    pastSubmissionOutcomes: string[];
    confidenceRating: number;
    futureFundingStrategy: string;
    fundingGoals: string[];
  };
  
  // Additional useful fields
  additional: {
    geographicPreferences: string[];
    languageRequirements: string[];
    reviewTimelinePreference: string;
    preferredFundingAgencies: string[];
    excludedFundingAgencies: string[];
    contactPreferences: {
      email: string;
      frequency: string;
      types: string[];
    };
  };
}

const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    eligibility: {
      careerStage: '',
      citizenship: [],
      residencyStatus: '',
      institutionType: '',
      previousMajorAwards: [],
      yearsOfExperience: 0,
    },
    fundingMechanisms: {
      grantTypes: [],
      specificMechanisms: [],
      durationPreference: [],
      renewabilityPreference: '',
    },
    budgetParameters: {
      minAmount: 0,
      maxAmount: 0,
      indirectCostRate: 0,
      costSharingAbility: false,
      costSharingPercentage: 0,
      budgetCategoriesNeeded: [],
    },
    timing: {
      projectReadiness: '',
      earliestStartDate: '',
      preferredStartWindow: '',
      multiStageApplicationTolerance: '',
      timeToSubmit: '',
    },
    thematicFit: {
      researchKeywords: [],
      focusAreas: [],
      societalPriorities: [],
      targetPopulations: [],
      translationalStage: '',
    },
    collaboration: {
      desiredCollaborators: [],
      mandatoryCollaborators: [],
      leadershipPreference: '',
      dataSharingStance: '',
      openScienceStance: '',
    },
    compliance: {
      humanSubjectsApproval: false,
      animalUseApproval: false,
      ipConstraintsComfort: '',
      environmentalConsiderations: false,
      dualUseResearchConcerns: false,
    },
    historicalPerformance: {
      pastSubmissionOutcomes: [],
      confidenceRating: 3,
      futureFundingStrategy: '',
      fundingGoals: [],
    },
    additional: {
      geographicPreferences: [],
      languageRequirements: [],
      reviewTimelinePreference: '',
      preferredFundingAgencies: [],
      excludedFundingAgencies: [],
      contactPreferences: {
        email: '',
        frequency: '',
        types: [],
      },
    },
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const sections = [
    'Eligibility & Career Stage',
    'Funding Mechanisms',
    'Budget Parameters',
    'Timing & Workload',
    'Thematic & Strategic Fit',
    'Collaboration Preferences',
    'Compliance & Ethics',
    'Historical Performance',
    'Additional Preferences'
  ];

  const handleInputChange = (section: keyof UserPreferences, field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleArrayAdd = (section: keyof UserPreferences, field: string, value: string) => {
    if (!value.trim()) return;
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: [...((prev[section] as any)[field] as string[]), value.trim()],
      },
    }));
  };

  const handleArrayRemove = (section: keyof UserPreferences, field: string, index: number) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: ((prev[section] as any)[field] as string[]).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async (saveType: 'draft' | 'final') => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save preferences
      console.log('Saving preferences:', preferences, saveType);
      
      // Placeholder API call
      const response = await fetch('/api/save-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          saveType,
        }),
      });
      
      if (response.ok) {
        alert(`Preferences saved as ${saveType}!`);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Eligibility & Career Stage
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Stage / Role
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.eligibility.careerStage}
                onChange={(e) => handleInputChange('eligibility', 'careerStage', e.target.value)}
              >
                <option value="">Select career stage</option>
                <option value="undergraduate">Undergraduate Student</option>
                <option value="graduate">Graduate Student (PhD)</option>
                <option value="postdoc">Postdoctoral Researcher</option>
                <option value="assistant">Assistant Professor</option>
                <option value="associate">Associate Professor</option>
                <option value="full">Full Professor</option>
                <option value="clinician-scientist">Clinician-Scientist</option>
                <option value="industry-researcher">Industry Researcher</option>
                <option value="government-researcher">Government Researcher</option>
                <option value="independent-researcher">Independent Researcher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Research Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.eligibility.yearsOfExperience}
                onChange={(e) => handleInputChange('eligibility', 'yearsOfExperience', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Residency Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.eligibility.residencyStatus}
                onChange={(e) => handleInputChange('eligibility', 'residencyStatus', e.target.value)}
              >
                <option value="">Select residency status</option>
                <option value="us-citizen">US Citizen</option>
                <option value="us-permanent-resident">US Permanent Resident</option>
                <option value="us-temporary-resident">US Temporary Resident (Visa)</option>
                <option value="eu-citizen">EU Citizen</option>
                <option value="uk-citizen">UK Citizen</option>
                <option value="canadian-citizen">Canadian Citizen</option>
                <option value="international">International (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.eligibility.institutionType}
                onChange={(e) => handleInputChange('eligibility', 'institutionType', e.target.value)}
              >
                <option value="">Select institution type</option>
                <option value="r1-university">R1 Research University</option>
                <option value="r2-university">R2 Research University</option>
                <option value="teaching-college">Teaching College/University</option>
                <option value="community-college">Community College</option>
                <option value="hospital">Hospital/Medical Center</option>
                <option value="government-lab">Government Laboratory</option>
                <option value="nonprofit">Nonprofit Organization</option>
                <option value="startup">Startup Company</option>
                <option value="industry">Industry/Corporation</option>
                <option value="independent">Independent Institution</option>
              </select>
            </div>
          </div>
        );

      case 1: // Funding Mechanisms
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Grant Types (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Research Project',
                  'Exploratory/Seed',
                  'Equipment',
                  'Training/Fellowship',
                  'Conference/Workshop',
                  'Travel',
                  'Core Facility',
                  'SBIR/STTR',
                  'Cooperative Agreement',
                  'Prize/Competition',
                  'Career Development',
                  'Infrastructure'
                ].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={preferences.fundingMechanisms.grantTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('fundingMechanisms', 'grantTypes', [...preferences.fundingMechanisms.grantTypes, type]);
                        } else {
                          handleInputChange('fundingMechanisms', 'grantTypes', preferences.fundingMechanisms.grantTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration Preference
              </label>
              <div className="space-y-2">
                {[
                  { value: 'short', label: 'Short-term (≤1 year)' },
                  { value: 'medium', label: 'Medium-term (2-3 years)' },
                  { value: 'long', label: 'Long-term (4-5+ years)' }
                ].map((duration) => (
                  <label key={duration.value} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={preferences.fundingMechanisms.durationPreference.includes(duration.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('fundingMechanisms', 'durationPreference', [...preferences.fundingMechanisms.durationPreference, duration.value]);
                        } else {
                          handleInputChange('fundingMechanisms', 'durationPreference', preferences.fundingMechanisms.durationPreference.filter(d => d !== duration.value));
                        }
                      }}
                    />
                    {duration.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewability Preference
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.fundingMechanisms.renewabilityPreference}
                onChange={(e) => handleInputChange('fundingMechanisms', 'renewabilityPreference', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="one-time">One-time funding preferred</option>
                <option value="renewable">Renewable funding preferred</option>
                <option value="both">Open to both</option>
              </select>
            </div>
          </div>
        );

      case 2: // Budget Parameters
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Funding Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.budgetParameters.minAmount}
                  onChange={(e) => handleInputChange('budgetParameters', 'minAmount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Funding Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.budgetParameters.maxAmount}
                  onChange={(e) => handleInputChange('budgetParameters', 'maxAmount', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Indirect Cost Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.budgetParameters.indirectCostRate}
                onChange={(e) => handleInputChange('budgetParameters', 'indirectCostRate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={preferences.budgetParameters.costSharingAbility}
                  onChange={(e) => handleInputChange('budgetParameters', 'costSharingAbility', e.target.checked)}
                />
                Institution can provide cost-sharing/matching funds
              </label>
            </div>

            {preferences.budgetParameters.costSharingAbility && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Cost-Sharing Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.budgetParameters.costSharingPercentage}
                  onChange={(e) => handleInputChange('budgetParameters', 'costSharingPercentage', parseInt(e.target.value) || 0)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Categories Needed
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Personnel/Salaries',
                  'Equipment',
                  'Travel',
                  'Supplies',
                  'Subawards/Subcontracts',
                  'Other Direct Costs',
                  'Student Support',
                  'Computing Resources'
                ].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={preferences.budgetParameters.budgetCategoriesNeeded.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('budgetParameters', 'budgetCategoriesNeeded', [...preferences.budgetParameters.budgetCategoriesNeeded, category]);
                        } else {
                          handleInputChange('budgetParameters', 'budgetCategoriesNeeded', preferences.budgetParameters.budgetCategoriesNeeded.filter(c => c !== category));
                        }
                      }}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Timing & Workload
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Readiness Level
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.timing.projectReadiness}
                onChange={(e) => handleInputChange('timing', 'projectReadiness', e.target.value)}
              >
                <option value="">Select readiness level</option>
                <option value="concept">Early concept stage</option>
                <option value="preliminary">Preliminary data available</option>
                <option value="advanced">Advanced planning with substantial data</option>
                <option value="ready">Fully developed and ready to execute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Earliest Preferred Start Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.timing.earliestStartDate}
                onChange={(e) => handleInputChange('timing', 'earliestStartDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Available to Prepare Proposal
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.timing.timeToSubmit}
                onChange={(e) => handleInputChange('timing', 'timeToSubmit', e.target.value)}
              >
                <option value="">Select timeline</option>
                <option value="immediate">Ready to submit immediately (0-2 weeks)</option>
                <option value="short">Short preparation (2-8 weeks)</option>
                <option value="medium">Medium preparation (2-6 months)</option>
                <option value="long">Long preparation (6+ months)</option>
                <option value="flexible">Flexible timeline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Multi-Stage Application Tolerance
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.timing.multiStageApplicationTolerance}
                onChange={(e) => handleInputChange('timing', 'multiStageApplicationTolerance', e.target.value)}
              >
                <option value="">Select preference</option>
                <option value="single">Prefer single-stage applications</option>
                <option value="two-stage">Comfortable with two-stage (LOI + full)</option>
                <option value="multi-stage">Open to multi-stage processes</option>
                <option value="any">No preference</option>
              </select>
            </div>
          </div>
        );

      // Continue with remaining sections...
      case 4: // Thematic & Strategic Fit
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Keywords (Add relevant keywords)
              </label>
              <TagInput
                values={preferences.thematicFit.researchKeywords}
                onAdd={(value) => handleArrayAdd('thematicFit', 'researchKeywords', value)}
                onRemove={(index) => handleArrayRemove('thematicFit', 'researchKeywords', index)}
                placeholder="Enter research keyword and press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Translational Stage
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.thematicFit.translationalStage}
                onChange={(e) => handleInputChange('thematicFit', 'translationalStage', e.target.value)}
              >
                <option value="">Select stage</option>
                <option value="basic-science">Basic Science</option>
                <option value="preclinical">Preclinical Research</option>
                <option value="clinical-trial">Clinical Trial</option>
                <option value="implementation">Implementation Science</option>
                <option value="policy">Policy Research</option>
                <option value="mixed">Mixed/Multiple Stages</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Societal/SDG Priorities
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Global Health',
                  'Climate Action',
                  'Education',
                  'Economic Development',
                  'Environmental Protection',
                  'Social Justice',
                  'Technology Innovation',
                  'Food Security',
                  'Energy Security',
                  'Digital Inclusion'
                ].map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={preferences.thematicFit.societalPriorities.includes(priority)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('thematicFit', 'societalPriorities', [...preferences.thematicFit.societalPriorities, priority]);
                        } else {
                          handleInputChange('thematicFit', 'societalPriorities', preferences.thematicFit.societalPriorities.filter(p => p !== priority));
                        }
                      }}
                    />
                    {priority}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Collaboration & Partnership Preferences
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desired Collaborator Types
              </label>
              <TagInput
                values={preferences.collaboration.desiredCollaborators}
                onAdd={(value) => handleArrayAdd('collaboration', 'desiredCollaborators', value)}
                onRemove={(index) => handleArrayRemove('collaboration', 'desiredCollaborators', index)}
                placeholder="Enter collaborator type (e.g., 'Industry Partners', 'International Researchers')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mandatory Collaborators (if any)
              </label>
              <TagInput
                values={preferences.collaboration.mandatoryCollaborators}
                onAdd={(value) => handleArrayAdd('collaboration', 'mandatoryCollaborators', value)}
                onRemove={(index) => handleArrayRemove('collaboration', 'mandatoryCollaborators', index)}
                placeholder="Enter mandatory collaborator requirements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leadership Preference
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.collaboration.leadershipPreference}
                onChange={(e) => handleInputChange('collaboration', 'leadershipPreference', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="lead-pi">Prefer to be Lead PI</option>
                <option value="co-pi">Comfortable as Co-PI</option>
                <option value="collaborator">Prefer collaborator role</option>
                <option value="flexible">Flexible with role</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Sharing Stance
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.collaboration.dataSharingStance}
                onChange={(e) => handleInputChange('collaboration', 'dataSharingStance', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="open">Strongly support open data sharing</option>
                <option value="conditional">Conditional data sharing</option>
                <option value="restricted">Prefer restricted data sharing</option>
                <option value="proprietary">Require proprietary data protection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Open Science Stance
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.collaboration.openScienceStance}
                onChange={(e) => handleInputChange('collaboration', 'openScienceStance', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="advocate">Strong advocate for open science</option>
                <option value="supportive">Supportive of open science</option>
                <option value="selective">Selective about open science</option>
                <option value="traditional">Prefer traditional publication model</option>
              </select>
            </div>
          </div>
        );

      case 6: // Compliance, Ethics & Regulatory Factors
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Human Subjects Research
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={preferences.compliance.humanSubjectsApproval}
                    onChange={(e) => handleInputChange('compliance', 'humanSubjectsApproval', e.target.checked)}
                  />
                  My research involves human subjects (requires IRB approval)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Research
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={preferences.compliance.animalUseApproval}
                    onChange={(e) => handleInputChange('compliance', 'animalUseApproval', e.target.checked)}
                  />
                  My research involves animal subjects (requires IACUC approval)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intellectual Property Constraints Comfort
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.compliance.ipConstraintsComfort}
                onChange={(e) => handleInputChange('compliance', 'ipConstraintsComfort', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="comfortable">Comfortable with IP constraints</option>
                <option value="moderate">Moderate IP constraints acceptable</option>
                <option value="minimal">Prefer minimal IP constraints</option>
                <option value="none">No IP constraints preferred</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environmental Considerations
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={preferences.compliance.environmentalConsiderations}
                    onChange={(e) => handleInputChange('compliance', 'environmentalConsiderations', e.target.checked)}
                  />
                  My research has environmental impact considerations
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dual Use Research Concerns
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={preferences.compliance.dualUseResearchConcerns}
                    onChange={(e) => handleInputChange('compliance', 'dualUseResearchConcerns', e.target.checked)}
                  />
                  My research may have dual-use implications
                </label>
              </div>
            </div>
          </div>
        );

      case 7: // Historical Performance & Feedback
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Past Grant Submission Outcomes
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Mostly Successful',
                  'Mixed Results',
                  'Few Successes',
                  'Early Career (Limited History)',
                  'Resubmissions Common',
                  'Strong Track Record'
                ].map((outcome) => (
                  <label key={outcome} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={preferences.historicalPerformance.pastSubmissionOutcomes.includes(outcome)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('historicalPerformance', 'pastSubmissionOutcomes', [...preferences.historicalPerformance.pastSubmissionOutcomes, outcome]);
                        } else {
                          handleInputChange('historicalPerformance', 'pastSubmissionOutcomes', preferences.historicalPerformance.pastSubmissionOutcomes.filter(o => o !== outcome));
                        }
                      }}
                    />
                    {outcome}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence in Grant Writing (1-5 scale)
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Low</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="flex-1"
                  value={preferences.historicalPerformance.confidenceRating}
                  onChange={(e) => handleInputChange('historicalPerformance', 'confidenceRating', parseInt(e.target.value))}
                />
                <span className="text-sm text-gray-500">High</span>
                <span className="text-sm font-medium text-gray-700 ml-2">
                  {preferences.historicalPerformance.confidenceRating}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Funding Strategy
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.historicalPerformance.futureFundingStrategy}
                onChange={(e) => handleInputChange('historicalPerformance', 'futureFundingStrategy', e.target.value)}
              >
                <option value="">Select strategy</option>
                <option value="diversified">Diversified funding portfolio</option>
                <option value="focused">Focus on specific agencies</option>
                <option value="opportunistic">Opportunistic applications</option>
                <option value="strategic">Strategic long-term planning</option>
                <option value="collaborative">Collaborative approach</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Funding Goals
              </label>
              <TagInput
                values={preferences.historicalPerformance.fundingGoals}
                onAdd={(value) => handleArrayAdd('historicalPerformance', 'fundingGoals', value)}
                onRemove={(index) => handleArrayRemove('historicalPerformance', 'fundingGoals', index)}
                placeholder="Enter funding goal (e.g., 'Establish independent research program')"
              />
            </div>
          </div>
        );

      case 8: // Additional Preferences
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Preferences
              </label>
              <TagInput
                values={preferences.additional.geographicPreferences}
                onAdd={(value) => handleArrayAdd('additional', 'geographicPreferences', value)}
                onRemove={(index) => handleArrayRemove('additional', 'geographicPreferences', index)}
                placeholder="Enter geographic preference (e.g., 'US only', 'International welcome')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language Requirements
              </label>
              <TagInput
                values={preferences.additional.languageRequirements}
                onAdd={(value) => handleArrayAdd('additional', 'languageRequirements', value)}
                onRemove={(index) => handleArrayRemove('additional', 'languageRequirements', index)}
                placeholder="Enter language requirement (e.g., 'English only', 'Multilingual')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Timeline Preference
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.additional.reviewTimelinePreference}
                onChange={(e) => handleInputChange('additional', 'reviewTimelinePreference', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="fast">Fast review (≤3 months)</option>
                <option value="standard">Standard review (3-6 months)</option>
                <option value="extended">Extended review acceptable (6+ months)</option>
                <option value="rolling">Rolling review preferred</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Funding Agencies
              </label>
              <TagInput
                values={preferences.additional.preferredFundingAgencies}
                onAdd={(value) => handleArrayAdd('additional', 'preferredFundingAgencies', value)}
                onRemove={(index) => handleArrayRemove('additional', 'preferredFundingAgencies', index)}
                placeholder="Enter preferred agency (e.g., 'NIH', 'NSF', 'Gates Foundation')"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excluded Funding Agencies
              </label>
              <TagInput
                values={preferences.additional.excludedFundingAgencies}
                onAdd={(value) => handleArrayAdd('additional', 'excludedFundingAgencies', value)}
                onRemove={(index) => handleArrayRemove('additional', 'excludedFundingAgencies', index)}
                placeholder="Enter agency to exclude (e.g., 'DoD', 'Industry-specific')"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@institution.edu"
                    value={preferences.additional.contactPreferences.email}
                    onChange={(e) => handleInputChange('additional', 'contactPreferences', {
                      ...preferences.additional.contactPreferences,
                      email: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={preferences.additional.contactPreferences.frequency}
                    onChange={(e) => handleInputChange('additional', 'contactPreferences', {
                      ...preferences.additional.contactPreferences,
                      frequency: e.target.value
                    })}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily updates</option>
                    <option value="weekly">Weekly digest</option>
                    <option value="monthly">Monthly summary</option>
                    <option value="quarterly">Quarterly updates</option>
                    <option value="on-demand">On-demand only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Types
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'New Grant Opportunities',
                      'Deadline Reminders',
                      'Funding Updates',
                      'Success Stories',
                      'Strategy Tips',
                      'Agency News'
                    ].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={preferences.additional.contactPreferences.types.includes(type)}
                          onChange={(e) => {
                            const currentTypes = preferences.additional.contactPreferences.types;
                            if (e.target.checked) {
                              handleInputChange('additional', 'contactPreferences', {
                                ...preferences.additional.contactPreferences,
                                types: [...currentTypes, type]
                              });
                            } else {
                              handleInputChange('additional', 'contactPreferences', {
                                ...preferences.additional.contactPreferences,
                                types: currentTypes.filter(t => t !== type)
                              });
                            }
                          }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section under construction...</div>;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Grant Preferences & Profile Setup
          </h1>
          <p className="text-gray-600">
            Configure your preferences to receive personalized grant recommendations
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {Math.round(((currentSection + 1) / sections.length) * 100)}%
            </span>
            <span className="text-sm text-gray-500">
              Section {currentSection + 1} of {sections.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Section navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  index === currentSection
                    ? 'bg-blue-600 text-white'
                    : index < currentSection
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Current section content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {sections[currentSection]}
          </h2>
          {renderSection()}
        </div>

        {/* Navigation and save buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="px-6 py-2"
          >
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => handleSave('draft')}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700"
            >
              {isLoading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={() => handleSave('final')}
              disabled={isLoading}
              className="px-6 py-2"
            >
              {isLoading ? 'Saving...' : 'Save & Complete'}
            </Button>
          </div>

          <Button
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            disabled={currentSection === sections.length - 1}
            className="px-6 py-2"
          >
            Next
          </Button>
        </div>
      </div>
    </Layout>
  );
};

// Helper component for tag input
const TagInput: React.FC<{
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}> = ({ values, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue);
      setInputValue('');
    }
  };

  return (
    <div>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {value}
            <button
              onClick={() => onRemove(index)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default PreferencesPage; 