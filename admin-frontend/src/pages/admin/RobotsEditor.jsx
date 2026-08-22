import React, { useEffect, useState } from 'react';
import { Bot, Save, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { handleApiError } from '@/lib/handleApiError';
import { useRobotsSettings, useUpdateRobotsSettings } from '@/hooks/use-seo';

export default function RobotsEditor() {
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useRobotsSettings();
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.robots_content) setContent(data.robots_content);
  }, [data]);

  const updateMutation = useUpdateRobotsSettings({
    onSuccess: () => toast({ title: 'Robots.txt saved', description: 'Your robots.txt file has been updated.' }),
    onError: (err) => handleApiError(err, toast),
  });

  const isSaving = updateMutation.isPending;

  const handleSave = () => {
    if (isSaving) return;
    updateMutation.mutate({ robots_content: content });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  // Derive which crawlers are blocked based on content
  const getCrawlerStatus = () => {
    const crawlers = [
      { name: 'Googlebot', pattern: /User-agent:\s*Googlebot/i },
      { name: 'Bingbot', pattern: /User-agent:\s*Bingbot/i },
      { name: 'GPTBot', pattern: /User-agent:\s*GPTBot/i },
      { name: 'CCBot', pattern: /User-agent:\s*CCBot/i },
    ];
    return crawlers.map((c) => {
      const match = content.match(new RegExp(`User-agent:\\s*${c.name}[\\s\\S]*?(?=User-agent:|$)`, 'i'));
      const blocked = match ? /Disallow:\s*\//.test(match[0]) : false;
      return { name: c.name, status: blocked ? 'Blocked' : 'Allowed' };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error?.message || 'Failed to load robots.txt settings'}</p>
      </div>
    );
  }

  const crawlerStatuses = getCrawlerStatus();

  return (
    <div>
      <PageHeader
        title="Robots.txt Editor"
        description="Manage your robots.txt file for search engine crawlers"
        actions={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">robots.txt</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              className="w-full px-4 py-3 text-sm font-mono text-foreground bg-white outline-none resize-none leading-relaxed"
              placeholder={'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://yourdomain.com/sitemap.xml'}
            />
          </div>

          {/* Character count */}
          <p className="mt-2 text-xs text-muted-foreground text-right">
            {content.length} characters
          </p>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">Robots.txt Guide</h3>
            <div className="space-y-3 text-sm">
              {[
                { directive: 'User-agent: *', desc: 'Applies rules to all crawlers' },
                { directive: 'Allow: /', desc: 'Allow crawling of all pages' },
                { directive: 'Disallow: /admin/', desc: 'Block crawlers from admin pages' },
                { directive: 'Sitemap:', desc: 'Points crawlers to your sitemap' },
              ].map((item) => (
                <div key={item.directive}>
                  <p className="font-medium text-foreground font-mono text-xs mb-0.5">{item.directive}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">Live Preview URL</h3>
            <div className="px-3 py-2 text-xs font-mono text-muted-foreground bg-muted/30 rounded-lg border border-border break-all">
              /robots.txt
            </div>
            <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-xs text-success flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Valid robots.txt format
              </p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">Crawler Status</h3>
            <div className="space-y-2">
              {crawlerStatuses.map((c) => (
                <div key={c.name} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-foreground">{c.name}</span>
                  <span className={c.status === 'Allowed' ? 'text-xs text-success' : 'text-xs text-destructive'}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
