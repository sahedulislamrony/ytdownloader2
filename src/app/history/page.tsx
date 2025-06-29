"use client";

import { useState } from 'react';
import { DownloadCloud, CheckCircle, XCircle, HardDrive, RefreshCw, Download } from 'lucide-react';
import { useDownloadQueue } from '@/context/download-queue-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
  const { history, clearHistory } = useDownloadQueue();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalDownloads = history.length;
  const successfulDownloads = history.filter(h => h.status === 'Completed').length;
  const successRate = totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0;
  const totalSize = history.reduce((acc, item) => acc + (item.fileSize || 0), 0);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-3xl font-bold font-headline">Download History</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <DownloadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="destructive" onClick={clearHistory}>Clear History</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Completed' ? 'success' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">{formatBytes(item.fileSize)}</TableCell>
                    <TableCell className="text-right">
                       {item.status === 'Completed' && item.fileName && (
                         <Button variant="ghost" size="icon" asChild>
                           <a href={`/api/download?file=${encodeURIComponent(item.fileName)}`} download>
                              <Download className="h-4 w-4" />
                           </a>
                         </Button>
                       )}
                       {item.status === 'Failed' && (
                         <Button variant="ghost" size="icon" disabled>
                            <RefreshCw className="h-4 w-4" />
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
