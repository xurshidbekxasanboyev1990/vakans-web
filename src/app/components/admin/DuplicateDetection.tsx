import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Copy,
  AlertTriangle,
  CheckCircle,
  Search,
  Eye,
  Trash2,
  Link,
  FileText,
  Calendar,
  MapPin,
  Building,
  RefreshCw,
  Filter,
  XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import type { Job } from '../../../lib/types';

interface DuplicateGroup {
  id: string;
  similarity: number;
  jobs: Job[];
  reason: string;
}

interface DuplicateDetectionProps {
  jobs: Job[];
  onDeleteJob?: (jobId: string) => void;
  onViewJob?: (job: Job) => void;
}

export function DuplicateDetection({ jobs, onDeleteJob, onViewJob }: DuplicateDetectionProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [minSimilarity, setMinSimilarity] = useState(70);

  // Levenshtein distance for string similarity
  const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 100;
    const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return Math.round((1 - distance / maxLen) * 100);
  };

  // Detect duplicates
  const duplicateGroups = useMemo(() => {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    jobs.forEach((job1, i) => {
      if (processed.has(job1.id)) return;

      const similarJobs: Job[] = [job1];
      let maxSimilarity = 0;
      let reason = '';

      jobs.forEach((job2, j) => {
        if (i >= j || processed.has(job2.id)) return;

        // Check title similarity
        const titleSim = calculateSimilarity(job1.title, job2.title);
        
        // Check description similarity
        const descSim = calculateSimilarity(
          job1.description?.substring(0, 200) || '',
          job2.description?.substring(0, 200) || ''
        );

        // Check same employer
        const sameEmployer = job1.employerId === job2.employerId || 
                           job1.employerName === job2.employerName;

        // Check same phone
        const samePhone = job1.employerPhone === job2.employerPhone;

        // Calculate overall similarity
        let similarity = 0;
        let reasons: string[] = [];

        if (titleSim >= 80) {
          similarity += 40;
          reasons.push(`Sarlavha ${titleSim}% o'xshash`);
        } else if (titleSim >= 60) {
          similarity += 25;
          reasons.push(`Sarlavha ${titleSim}% o'xshash`);
        }

        if (descSim >= 70) {
          similarity += 30;
          reasons.push(`Tavsif ${descSim}% o'xshash`);
        } else if (descSim >= 50) {
          similarity += 15;
          reasons.push(`Tavsif ${descSim}% o'xshash`);
        }

        if (sameEmployer) {
          similarity += 20;
          reasons.push('Bir xil ish beruvchi');
        }

        if (samePhone) {
          similarity += 10;
          reasons.push('Bir xil telefon');
        }

        if (similarity >= minSimilarity) {
          similarJobs.push(job2);
          processed.add(job2.id);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            reason = reasons.join(', ');
          }
        }
      });

      if (similarJobs.length > 1) {
        groups.push({
          id: `group-${i}`,
          similarity: maxSimilarity,
          jobs: similarJobs,
          reason,
        });
        processed.add(job1.id);
      }
    });

    return groups.sort((a, b) => b.similarity - a.similarity);
  }, [jobs, minSimilarity]);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsScanning(false);
    toast.success(`${duplicateGroups.length} ta dublikat guruhi topildi`);
  };

  const handleDeleteDuplicate = (jobId: string) => {
    if (onDeleteJob) {
      onDeleteJob(jobId);
      toast.success('Dublikat o\'chirildi');
    }
  };

  const stats = {
    totalJobs: jobs.length,
    duplicateGroups: duplicateGroups.length,
    totalDuplicates: duplicateGroups.reduce((sum, g) => sum + g.jobs.length - 1, 0),
    highSimilarity: duplicateGroups.filter(g => g.similarity >= 90).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Copy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dublikat aniqlash</h1>
            <p className="text-sm text-muted-foreground">Takroriy ish e'lonlarini topish va boshqarish</p>
          </div>
        </div>
        <Button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-gradient-to-r from-amber-500 to-orange-500"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Skanlanmoqda...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Qayta skanerlash
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami e'lonlar</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalJobs}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dublikat guruhlar</p>
                <p className="text-2xl font-bold text-amber-500">{stats.duplicateGroups}</p>
              </div>
              <Copy className="w-8 h-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami dublikatlar</p>
                <p className="text-2xl font-bold text-red-500">{stats.totalDuplicates}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yuqori o'xshashlik</p>
                <p className="text-2xl font-bold text-purple-500">{stats.highSimilarity}</p>
              </div>
              <Link className="w-8 h-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Minimal o'xshashlik:</span>
            <div className="flex items-center gap-2">
              {[50, 70, 80, 90].map(value => (
                <Button
                  key={value}
                  variant={minSimilarity === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMinSimilarity(value)}
                  className={minSimilarity === value ? 'bg-amber-500' : ''}
                >
                  {value}%+
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Groups */}
      {duplicateGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-emerald-500/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Dublikat topilmadi</h3>
            <p className="text-muted-foreground">
              {minSimilarity}% dan yuqori o'xshashlikdagi e'lonlar yo'q
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map(group => (
            <Card key={group.id} className="border-amber-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      group.similarity >= 90 ? 'bg-red-500/20 text-red-400' :
                      group.similarity >= 80 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {group.similarity}% o'xshash
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {group.jobs.length} ta e'lon
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowCompareDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Taqqoslash
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
                  {group.reason}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.jobs.map((job, index) => (
                    <div 
                      key={job.id}
                      className={`p-4 rounded-xl border ${
                        index === 0 
                          ? 'bg-emerald-500/5 border-emerald-500/20' 
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <Badge className="bg-emerald-500/20 text-emerald-400">Original</Badge>
                            )}
                            {index > 0 && (
                              <Badge className="bg-red-500/20 text-red-400">Dublikat</Badge>
                            )}
                            <span className="font-medium">{job.title}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {job.employerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.employerRegion}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(job.createdAt).toLocaleDateString('uz-UZ')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {onViewJob && (
                            <Button variant="ghost" size="icon" onClick={() => onViewJob(job)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {index > 0 && onDeleteJob && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => handleDeleteDuplicate(job.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E'lonlarni taqqoslash</DialogTitle>
            <DialogDescription>
              {selectedGroup?.similarity}% o'xshashlik • {selectedGroup?.reason}
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {selectedGroup.jobs.slice(0, 2).map((job, index) => (
                <div key={job.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400">Original</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400">Dublikat</Badge>
                    )}
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Sarlavha</label>
                      <p className="font-medium">{job.title}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Ish beruvchi</label>
                      <p>{job.employerName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Joylashuv</label>
                      <p>{job.employerRegion}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Maosh</label>
                      <p>{job.salary}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Tavsif</label>
                      <p className="text-sm">{job.description}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Yaratilgan</label>
                      <p className="text-sm">{new Date(job.createdAt).toLocaleString('uz-UZ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
              Yopish
            </Button>
            {selectedGroup && selectedGroup.jobs.length > 1 && onDeleteJob && (
              <Button 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  handleDeleteDuplicate(selectedGroup.jobs[1].id);
                  setShowCompareDialog(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Dublikatni o'chirish
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
