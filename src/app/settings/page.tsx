"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';

import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  maxConcurrentDownloads: z.number().min(1).max(5),
  showNotifications: z.boolean(),
  ytDlpPath: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [settings, setSettings] = useLocalStorage<SettingsFormValues>('app-settings', {
    theme: 'dark',
    maxConcurrentDownloads: 3,
    showNotifications: true,
    ytDlpPath: '',
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(settings.theme);
  }, [settings.theme]);


  function onSubmit(data: SettingsFormValues) {
    setSettings(data);
    toast({
      title: 'Settings Saved',
      description: 'Your new settings have been applied.',
    });
  }

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the application theme. 'System' will follow your OS preference.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Downloads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="maxConcurrentDownloads"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Concurrent Downloads</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="5" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                    </FormControl>
                     <FormDescription>
                      Set the maximum number of simultaneous downloads (1-5).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormDescription>
                 Files are saved to a `downloads` folder in the project directory.
               </FormDescription>
            </CardContent>
          </Card>
          
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="showNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show Notifications</FormLabel>
                      <FormDescription>
                        Receive desktop notifications for download events.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Separator />

          <Card>
            <CardHeader>
                <CardTitle>Advanced</CardTitle>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="ytDlpPath"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>yt-dlp Path (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Leave empty to use system PATH" {...field} />
                        </FormControl>
                        <FormDescription>
                            Specify a custom path to your yt-dlp executable if it's not in your PATH.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>
          
          <Button type="submit">Save Settings</Button>
        </form>
      </Form>
    </div>
  );
}
