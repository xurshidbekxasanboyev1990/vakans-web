import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import type { Job } from '../../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { REGIONS, getJobCategories } from '../../lib/constants';

const PAYMENT_TYPES_I18N = {
  'daily': { uz: 'Kunlik', uzk: 'Кунлик', ru: 'Ежедневно', en: 'Daily' },
  'weekly': { uz: 'Haftalik', uzk: 'Ҳафталик', ru: 'Еженедельно', en: 'Weekly' },
  'monthly': { uz: 'Oylik', uzk: 'Ойлик', ru: 'Ежемесячно', en: 'Monthly' },
  'total': { uz: 'Umumiy', uzk: 'Умумий', ru: 'Всего', en: 'Total' },
} as const;

export interface JobFilters {
  searchQuery: string;
  region: string;
  category: string;
  paymentType: string;
  minSalary: string;
  maxSalary: string;
  onlyFeatured: boolean;
}

interface JobSearchAndFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  resultsCount?: number;
}

export function JobSearchAndFilters({ 
  filters, 
  onFiltersChange,
  resultsCount = 0 
}: JobSearchAndFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const jobCategories = getJobCategories(language);
  const paymentTypes = Object.entries(PAYMENT_TYPES_I18N).map(([value, labels]) => ({
    value,
    label: labels[language]
  }));

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleFilterChange = (key: keyof JobFilters, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      region: '',
      category: '',
      paymentType: '',
      minSalary: '',
      maxSalary: '',
      onlyFeatured: false,
    });
    setIsOpen(false);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return false;
    if (typeof value === 'boolean') return value;
    return value !== '';
  }).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchJobsPlaceholder')}
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <SlidersHorizontal className="w-4 h-4" />
              {t('filter')}
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t('filters')}
              </SheetTitle>
              <SheetDescription>
                {t('selectSearchResults')}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <Label>{t('region')}</Label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('allRegions')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allRegions')}</SelectItem>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>{t('category')}</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allCategories')}</SelectItem>
                    {jobCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Type Filter */}
              <div className="space-y-2">
                <Label>{t('paymentType')}</Label>
                <Select
                  value={filters.paymentType}
                  onValueChange={(value) => handleFilterChange('paymentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allTypes')}</SelectItem>
                    {paymentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <Label>{t('salaryRange')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t('from')}
                    value={filters.minSalary}
                    onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                  />
                  <span className="flex items-center">-</span>
                  <Input
                    type="number"
                    placeholder={t('to')}
                    value={filters.maxSalary}
                    onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                  />
                </div>
              </div>

              {/* Featured Only */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={filters.onlyFeatured}
                  onChange={(e) => handleFilterChange('onlyFeatured', e.target.checked)}
                  className="w-4 h-4"
                  title={t('showOnlyVip')}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  {t('onlyVipAds')}
                </Label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1"
                  disabled={activeFiltersCount === 0}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('clear')}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  {t('applyFilters')}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results Count & Active Filters */}
      {(resultsCount > 0 || activeFiltersCount > 0) && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {resultsCount} {t('jobsFound')}
              </span>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto py-1 text-xs"
                >
                  {t('clearAllFilters')}
                </Button>
              )}
            </div>

            {/* Active Filter Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.region && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    {t('region')}: {filters.region}
                    <button
                      onClick={() => handleFilterChange('region', '')}
                      className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      title={t('clearRegionFilter')}
                      aria-label={t('clearRegionFilter')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    {jobCategories.find(c => c.value === filters.category)?.label || filters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      title={t('clearCategoryFilter')}
                      aria-label={t('clearCategoryFilter')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.paymentType && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    {paymentTypes.find(t => t.value === filters.paymentType)?.label}
                    <button
                      onClick={() => handleFilterChange('paymentType', '')}
                      className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      title={t('clearPaymentTypeFilter')}
                      aria-label={t('clearPaymentTypeFilter')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.minSalary || filters.maxSalary) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                    {t('jobSalary')}: {filters.minSalary || '0'} - {filters.maxSalary || '∞'}
                    <button
                      onClick={() => {
                        handleFilterChange('minSalary', '');
                        handleFilterChange('maxSalary', '');
                      }}
                      className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      title={t('clearSalaryFilter')}
                      aria-label={t('clearSalaryFilter')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.onlyFeatured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                    VIP
                    <button
                      onClick={() => handleFilterChange('onlyFeatured', false)}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                      title={t('clearVipFilter')}
                      aria-label={t('clearVipFilter')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Filter jobs based on filters
 */
export function filterJobs(jobs: Job[], filters: JobFilters) {
  return jobs.filter(job => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = job.title?.toLowerCase().includes(query);
      const matchesDescription = job.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Region
    if (filters.region && job.employerRegion !== filters.region) {
      return false;
    }

    // Category
    if (filters.category && job.category !== filters.category) {
      return false;
    }

    // Payment type
    if (filters.paymentType && job.paymentType !== filters.paymentType) {
      return false;
    }

    // Salary range
    const salary = job.salary ?? 0;
    if (filters.minSalary && salary < parseInt(filters.minSalary)) {
      return false;
    }
    if (filters.maxSalary && salary > parseInt(filters.maxSalary)) {
      return false;
    }

    // Featured only
    if (filters.onlyFeatured && !job.featured) {
      return false;
    }

    return true;
  });
}
