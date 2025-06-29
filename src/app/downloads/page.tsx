"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDownloadQueue } from "@/context/download-queue-context";
import DownloadItem from "@/components/download-item";
import { AnimatePresence, motion } from "framer-motion";

export default function DownloadsPage() {
  const { downloads } = useDownloadQueue();

  const pending = downloads.filter(d => d.status === 'Pending');
  const inProgress = downloads.filter(d => d.status === 'InProgress' || d.status === 'Paused');

  const renderDownloadList = (items: typeof downloads) => {
    if (items.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-16">
          <p>No downloads in this category.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <DownloadItem item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold font-headline mb-6">Downloads</h1>
      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-2">
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="mt-6">
          {renderDownloadList(inProgress)}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          {renderDownloadList(pending)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
