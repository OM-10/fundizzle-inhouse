import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { 
  FiArrowLeft, 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiDollarSign, 
  FiClock, 
  FiHome, 
  FiUsers,
  FiExternalLink,
  FiBookmark,
  FiX,
  FiThumbsUp,
  FiThumbsDown,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { 
  fetchGrants as fetchGrantsFromAPI, 
  fetchGrantDetail as fetchGrantDetailFromAPI,
  updateGrantReaction,
  fetchUserReactions,
  formatCurrency as formatCurrencyUtil,
  formatDate as formatDateUtil,
  getMatchScoreColor
} from '@/utils/grantsApi';

// Types
interface Grant {
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
  matchScore?: number; // Keep this for display purposes
}

interface GrantDetail extends Grant {
  fullDescription: string;
  requirements: string[];
  applicationProcess: string;
  contactInfo: string;
  websiteUrl: string;
  documents: string[];
}

interface UserReaction {
  reaction_type: 'neutral' | 'like' | 'dislike';
  is_saved: boolean;
}

// GrantCard component
interface GrantCardProps {
  grant: Grant;
  reaction: UserReaction;
  onReact: (grantId: string, type: 'like' | 'dislike' | 'neutral' | 'save') => void;
  onGrantClick: (grantId: string) => void;
}
const GrantCard: React.FC<GrantCardProps> = ({ grant, reaction, onReact, onGrantClick }) => {
  const isLiked = reaction?.reaction_type === 'like';
  const isDisliked = reaction?.reaction_type === 'dislike';
  const isSaved = reaction?.is_saved;

  return (
    <div
      key={grant.grant_id}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative flex flex-col h-full"
      onClick={() => onGrantClick(grant.grant_id)}
    >
      {grant.matchScore && (
        <div className={`absolute -top-2 -right-2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${getMatchScoreColor(grant.matchScore)}`}>
          {grant.matchScore}% Match
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {grant.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
          <FiHome className="w-4 h-4" />
          {grant.agency}
        </div>
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {grant.abstract}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiDollarSign className="w-4 h-4" />
            <span>{formatCurrencyUtil(grant.funding_amount)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar className="w-4 h-4" />
            <span>Start Date: {formatDateUtil(grant.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUsers className="w-4 h-4" />
            <span>{grant.status}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiHome className="w-4 h-4" />
            <span>{grant.institution.name}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {grant.research_areas.slice(0, 3).map((area: string, index: number) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {area}
            </span>
          ))}
          {grant.research_areas.length > 3 && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
              +{grant.research_areas.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={isLiked ? 'bg-green-100 text-green-600 border-green-300' : ''}
            onClick={(e) => {
              e.stopPropagation();
              onReact(grant.grant_id, isLiked ? 'neutral' : 'like');
            }}
          >
            <FiThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={isDisliked ? 'bg-red-100 text-red-600 border-red-300' : ''}
            onClick={(e) => {
              e.stopPropagation();
              onReact(grant.grant_id, isDisliked ? 'neutral' : 'dislike');
            }}
          >
            <FiThumbsDown className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={isSaved ? 'bg-blue-100 text-blue-600 border-blue-300' : ''}
            onClick={(e) => {
              e.stopPropagation();
              onReact(grant.grant_id, 'save');
            }}
          >
            <FiBookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const GrantsPage: React.FC = () => {
  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedGrant, setSelectedGrant] = useState<GrantDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentGrantIndex, setCurrentGrantIndex] = useState(0);
  const [embeddingDimension, setEmbeddingDimension] = useState<'1.5k' | '3k'>('1.5k');
  const [searchQuery, setSearchQuery] = useState('');
  const [userReactions, setUserReactions] = useState<{[grantId: string]: UserReaction}>({});
  const [updatingReactions, setUpdatingReactions] = useState<{[grantId: string]: boolean}>({});

  // Helper to map dimension to display name
  const getDimensionDisplayName = (dim: '1.5k' | '3k') =>
    dim === '1.5k' ? 'GrantAtlas' : 'GrantScope';

  const loadGrants = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      
      // Use the actual API utility function
      const response = await fetchGrantsFromAPI({
        page: currentPage,
        limit: 6,
        dimension: embeddingDimension,
        search: searchQuery,
        userId: user?.id
      });
      
      if (isLoadMore) {
        // Append new grants to existing ones
        setGrants(prev => [...prev, ...response.grants]);
        setPage(currentPage);
      } else {
        // Replace grants with new ones
        setGrants(response.grants);
      }
      
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [embeddingDimension, searchQuery, page, user?.id]);

  // Load grants when dependencies change or on mount
  useEffect(() => {
    // Don't load if auth is still loading
    if (authLoading) {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadGrants(false);
    }, searchQuery ? 300 : 0); // Add delay only for search

    return () => clearTimeout(timeoutId);
  }, [embeddingDimension, searchQuery, user?.id, authLoading]); // Removed loadGrants to avoid infinite loop

  // Show More functionality - now actually loads more grants
  const handleShowMore = () => {
    if (!loadingMore && hasMore) {
      loadGrants(true);
    }
  };

  const handleGrantClick = async (grantId: string) => {
    console.log('Grant clicked:', grantId);
    try {
      setLoading(true);
      // Find the index of the clicked grant
      const grantIndex = grants.findIndex(grant => grant.grant_id === grantId);
      console.log('Grant index:', grantIndex);
      setCurrentGrantIndex(grantIndex);
      
      // Find the basic grant data from the current grants list
      const basicGrant = grants[grantIndex];
      console.log('Basic grant data:', basicGrant);
      
      // Use the actual API utility function
      console.log('Fetching grant details from API...');
      const response = await fetchGrantDetailFromAPI(grantId);
      console.log('API response:', response);
      
      if (response.success && response.grant) {
        console.log('Setting selected grant with full details');
        setSelectedGrant(response.grant);
        setShowDetailModal(true);
      } else {
        console.log('API failed, using basic grant data');
        // Fallback: use basic grant data if API fails
        const fallbackGrant: GrantDetail = {
          ...basicGrant,
          fullDescription: basicGrant.abstract,
          requirements: ['Requirements not available'],
          applicationProcess: 'Application process details not available',
          contactInfo: 'Contact information not available',
          websiteUrl: '',
          documents: []
        };
        setSelectedGrant(fallbackGrant);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching grant detail:', error);
      // Fallback: use basic grant data if API throws error
      const grantIndex = grants.findIndex(grant => grant.grant_id === grantId);
      const basicGrant = grants[grantIndex];
      if (basicGrant) {
        const fallbackGrant: GrantDetail = {
          ...basicGrant,
          fullDescription: basicGrant.abstract,
          requirements: ['Requirements not available'],
          applicationProcess: 'Application process details not available',
          contactInfo: 'Contact information not available',
          websiteUrl: '',
          documents: []
        };
        setSelectedGrant(fallbackGrant);
        setShowDetailModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to previous grant
  const handlePreviousGrant = async () => {
    if (currentGrantIndex > 0) {
      const newIndex = currentGrantIndex - 1;
      const previousGrant = grants[newIndex];
      setCurrentGrantIndex(newIndex);
      try {
        setLoading(true);
        const response = await fetchGrantDetailFromAPI(previousGrant.grant_id);
        if (response.success && response.grant) {
          setSelectedGrant(response.grant);
        } else {
          // Fallback: use basic grant data if API fails
          const fallbackGrant = {
            ...previousGrant,
            fullDescription: previousGrant.abstract,
            requirements: ['Requirements not available'],
            applicationProcess: 'Application process details not available',
            contactInfo: 'Contact information not available',
            websiteUrl: '',
            documents: []
          };
          setSelectedGrant(fallbackGrant);
        }
      } catch (error) {
        console.error('Error fetching previous grant:', error);
        // Fallback: use basic grant data if API throws error
        const fallbackGrant = {
          ...previousGrant,
          fullDescription: previousGrant.abstract,
          requirements: ['Requirements not available'],
          applicationProcess: 'Application process details not available',
          contactInfo: 'Contact information not available',
          websiteUrl: '',
          documents: []
        };
        setSelectedGrant(fallbackGrant);
      } finally {
        setLoading(false);
      }
    }
  };

  // Navigate to next grant
  const handleNextGrant = async () => {
    if (currentGrantIndex < grants.length - 1) {
      const newIndex = currentGrantIndex + 1;
      const nextGrant = grants[newIndex];
      setCurrentGrantIndex(newIndex);
      try {
        setLoading(true);
        const response = await fetchGrantDetailFromAPI(nextGrant.grant_id);
        if (response.success && response.grant) {
          setSelectedGrant(response.grant);
        } else {
          // Fallback: use basic grant data if API fails
          const fallbackGrant = {
            ...nextGrant,
            fullDescription: nextGrant.abstract,
            requirements: ['Requirements not available'],
            applicationProcess: 'Application process details not available',
            contactInfo: 'Contact information not available',
            websiteUrl: '',
            documents: []
          };
          setSelectedGrant(fallbackGrant);
        }
      } catch (error) {
        console.error('Error fetching next grant:', error);
        // Fallback: use basic grant data if API throws error
        const fallbackGrant = {
          ...nextGrant,
          fullDescription: nextGrant.abstract,
          requirements: ['Requirements not available'],
          applicationProcess: 'Application process details not available',
          contactInfo: 'Contact information not available',
          websiteUrl: '',
          documents: []
        };
        setSelectedGrant(fallbackGrant);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load user reactions for the current grants
  const loadUserReactions = useCallback(async () => {
    if (!user?.id || grants.length === 0) return;
  
    try {
      const grantIds = grants.map(grant => grant.grant_id);
      const reactions = await fetchUserReactions(grantIds);
  
      const typedReactions: { [grantId: string]: UserReaction } = {};
      for (const [grantId, reaction] of Object.entries(reactions)) {
        typedReactions[grantId] = {
          reaction_type: ['like', 'dislike', 'neutral'].includes(reaction.reaction_type)
            ? reaction.reaction_type as 'like' | 'dislike' | 'neutral'
            : 'neutral',
          is_saved: reaction.is_saved === true
        };
      }
  
      setUserReactions(typedReactions);
    } catch (error) {
      console.error('Error loading user reactions:', error);
    }
  }, [grants, user?.id]);
  
  useEffect(() => {
    loadUserReactions();
  }, [loadUserReactions]);
  

  // Optimistic reaction handler
  const handleGrantCardReaction = async (grantId: string, type: 'like' | 'dislike' | 'neutral' | 'save') => {
    const current = userReactions[grantId] || { reaction_type: 'neutral', is_saved: false };
    let newReaction = { ...current };
    if (type === 'like' || type === 'dislike' || type === 'neutral') {
      newReaction.reaction_type = type;
    }
    if (type === 'save') {
      newReaction.is_saved = !current.is_saved;
    }
    setUserReactions(prev => ({ ...prev, [grantId]: newReaction }));
    // Update backend
    await updateGrantReaction(
      grantId,
      newReaction.reaction_type,
      newReaction.is_saved
    );
  };

  return (
    <Layout
      title="Grants Dashboard - Fundizzle"
      description="Discover and apply for grants that match your profile and research interests."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container-custom py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <FiArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Grant Finder</h1>
                  <p className="hidden lg:block text-gray-600">Discover grants that match your profile and interests</p>
                </div>
              </div>
              
              {/* Embedding Dimension Toggle */}
              <div className="flex items-center gap-3">
                {/* <span className="text-sm text-gray-600">Choose model:</span> */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setEmbeddingDimension('1.5k')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      embeddingDimension === '1.5k'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    GrantAtlas
                  </button>
                  <button
                    onClick={() => setEmbeddingDimension('3k')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      embeddingDimension === '3k'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    GrantScope
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search grants by title, agency, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="outline" size="sm">
                <FiFilter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8">
          {/* Loading State */}
          {loading && grants.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading grants...</p>
            </div>
          )}

          {/* Stats Bar */}
          {grants.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{grants.length}</span> grants
                  </div>
                  <div className="text-sm text-gray-600">
                    Dimension: <span className="font-semibold text-blue-600">{getDimensionDisplayName(embeddingDimension)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>Match Score</option>
                    <option>Deadline</option>
                    <option>Funding Amount</option>
                    <option>Recently Added</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Grants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grants.map((grant) => (
              <GrantCard
                key={grant.grant_id}
                grant={grant}
                reaction={userReactions[grant.grant_id] || { reaction_type: 'neutral', is_saved: false }}
                onReact={handleGrantCardReaction}
                onGrantClick={handleGrantClick}
              />
            ))}
          </div>

          {/* Show More Button */}
          {grants.length > 0 && hasMore && (
            <div className="text-center mt-8">
              <Button
                onClick={handleShowMore}
                disabled={loadingMore}
                size="lg"
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading More Grants...
                  </>
                ) : (
                  'Show More Grants'
                )}
              </Button>
            </div>
          )}

          {/* No More Grants Message */}
          {grants.length > 0 && !hasMore && (
            <div className="text-center mt-8">
              <p className="text-gray-600">No more grants to show</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && grants.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiSearch className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No grants found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>

        {/* Grant Detail Modal */}
        {showDetailModal && selectedGrant && (
          (() => {
            // Use userReactions for modal as well
            const reaction = userReactions[selectedGrant.grant_id] || { reaction_type: 'neutral', is_saved: false };
            return (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                {/* Navigation Arrows - hidden on mobile, visible on desktop */}
                <button
                  onClick={handlePreviousGrant}
                  disabled={currentGrantIndex === 0}
                  className={`hidden md:block fixed left-8 top-1/2 transform -translate-y-1/2 z-50 p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                    currentGrantIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
                  }`}
                >
                  <FiChevronLeft className="w-8 h-8 text-gray-600" />
                </button>
                <button
                  onClick={handleNextGrant}
                  disabled={currentGrantIndex === grants.length - 1}
                  className={`hidden md:block fixed right-8 top-1/2 transform -translate-y-1/2 z-50 p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                    currentGrantIndex === grants.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
                  }`}
                >
                  <FiChevronRight className="w-8 h-8 text-gray-600" />
                </button>
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative shadow-xl">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Grant Details</h2>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {currentGrantIndex + 1} of {grants.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                    {/* Like/Dislike/Save Buttons */}
                    <div className="flex items-center gap-2 mt-3 sm:mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGrantCardReaction(selectedGrant.grant_id, reaction.reaction_type === 'like' ? 'neutral' : 'like')}
                        className={`${reaction.reaction_type === 'like' ? 'bg-green-100 text-green-600 border-green-300' : ''}`}
                      >
                        <FiThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGrantCardReaction(selectedGrant.grant_id, reaction.reaction_type === 'dislike' ? 'neutral' : 'dislike')}
                        className={`${reaction.reaction_type === 'dislike' ? 'bg-red-100 text-red-600 border-red-300' : ''}`}
                      >
                        <FiThumbsDown className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGrantCardReaction(selectedGrant.grant_id, 'save')}
                        className={`${reaction.is_saved ? 'bg-blue-100 text-blue-600 border-blue-300' : ''}`}
                      >
                        <FiBookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-8">
                    {/* Loading indicator for navigation */}
                    {loading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    {/* Title and Agency */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
                        {selectedGrant.title}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <FiHome className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">{selectedGrant.agency}</span>
                      </div>
                    </div>

                    {/* Two-column grid for details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Funding Amount</h4>
                        <p className="text-lg font-bold text-green-600 mb-4">
                          {formatCurrency(selectedGrant.funding_amount)}
                        </p>
                        <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                        <p className="text-base text-green-700 mb-4">
                          {selectedGrant.status}
                        </p>
                        <h4 className="font-semibold text-gray-900 mb-1">Institution</h4>
                        <p className="text-base text-gray-900 mb-1">
                          {selectedGrant.institution.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedGrant.institution.city}, {selectedGrant.institution.state}, {selectedGrant.institution.country}
                        </p>
                        <h4 className="font-semibold text-gray-900 mb-1">Start Date</h4>
                        <p className="text-base text-blue-600 mb-4">
                          {formatDate(selectedGrant.start_date)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Research Areas</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedGrant.research_areas.map((area, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">Principal Investigators</h4>
                        <ul className="list-disc list-inside text-gray-600 mb-4">
                          {selectedGrant.principal_investigators.map((pi, index) => (
                            <li key={index}>{pi.name}</li>
                          ))}
                        </ul>
                        <h4 className="font-semibold text-gray-900 mb-1">Contact Information</h4>
                        <p className="text-gray-600 mb-4">{selectedGrant.contactInfo}</p>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div className="mb-6 sm:mb-8">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Full Description</h4>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {selectedGrant.fullDescription}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div className="mb-6 sm:mb-8">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Eligibility Requirements</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm sm:text-base">
                        {selectedGrant.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Application Process */}
                    <div className="mb-6 sm:mb-8">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Application Process</h4>
                      <p className="text-gray-600 text-sm sm:text-base">{selectedGrant.applicationProcess}</p>
                    </div>

                    {/* Documents */}
                    {selectedGrant.documents && selectedGrant.documents.length > 0 && (
                      <div className="mb-6 sm:mb-8">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Documents</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm sm:text-base">
                          {selectedGrant.documents.map((doc, index) => (
                            <li key={index}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* External Links */}
                    {selectedGrant.websiteUrl && (
                      <div className="mt-6 sm:mt-8">
                        <a
                          href={selectedGrant.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-blue-700 bg-white hover:bg-blue-50 font-medium transition-colors text-base sm:text-lg"
                        >
                          <FiExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Official Page
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </Layout>
  );
};

export default GrantsPage; 