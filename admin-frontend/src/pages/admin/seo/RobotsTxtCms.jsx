/**
 * RobotsTxtCms — Robots.txt visual editor.
 * Backend status: No robots.txt model. Saved to localStorage.
 */
import { useState, useMemo } from 'react';
import { Bot, Check, Copy, Loader2, Save } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { useToast } from '@/components/ui/use-toast';

const DRAFT_KEY = 'robots_txt_draft';
const loadDraft = () => { try { return localStorage.getItem(DRAFT_KEY) ?? null; } catch { return null; } };
const saveDraft = (v) => { try { localStorage.setItem(DRAFT_KEY, v); } catch { /**/ } };

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml

# Block AI crawlers
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /`;

function parseRobots(content) {
  const lines = content.split('\n');
  const crawlers = {};
  let currentAgent = null;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('User-agent:')) {
      currentAgent = trimmed.replace('User-agent:', '').trim();
      if (!crawlers[currentAgent]) crawlers[currentAgent] = { allows: [], disallows: [] };
    } else if (trimmed.startsWith('Disallow:') && currentAgent) {
      crawlers[currentAgent].disallows.push(trimmed.replace('Disallow:', '').trim());
    } else if (trimmed.startsWith('Allow:') && currentAgent) {
      crawlers[currentAgent].allows.push(trimmed.replace('Allow:', '').trim());
    }
  });
  return crawlers;
}

const KNOWN_CRAWLERS = ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'GPTBot', 'CCBot'];

export default function RobotsTxtCms() {
  const { toast } = useToast();
  const [content, setContent] = useState(() => loadDraft() ?? DEFAULT_ROBOTS);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    setSaving(true);
    saveDraft(content);
    setTimeout(() => { setSaving(false); toast({ title: 'Robots.txt saved' }); }, 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const crawlerStatus = useMemo(() => {
    const parsed = parseRobots(content);
    return KNOWN_CRAWLERS.map((name) => {
      const data = parsed[name] ?? parsed['*'];
      const isBlocked = data?.disallows?.some((d) => d === '/');
      return { name, status: isBlocked ? 'Blocked' : 'Allowed' };
    });
  }, [content]);

  const isValid = useMemo(() => {
    return content.includes('User-agent:') && (content.includes('Allow:') || content.includes('Disallow:'));
  }, [content]);

  return (
    <div>
      <PageHeader
        title="Robots.txt Editor"
        description="Control how search engine crawlers access your website"
        onAdd={null} filters={null} onFilter={null} activeFilter={null}
        onSort={null} onExport={null} onImport={null} onSearch={null}
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <span className="shrink-0 font-bold mt-0.5">⚠</span>
        <span><strong>Saved locally.</strong> A robots.txt settings endpoint is needed to persist to the database.</span>
      </div>

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
              spellCheck={false}
            />
          </div>
        </div>

        {/* Info + status */}
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Syntax Guide</h3>
            <div className="space-y-3 text-sm">
              {[
                { directive: 'User-agent: *', desc: 'Apply rule to all crawlers' },
                { directive: 'User-agent: Googlebot', desc: 'Apply rule to Googlebot only' },
                { directive: 'Allow: /', desc: 'Allow crawling of all paths' },
                { directive: 'Disallow: /admin/', desc: 'Block crawling of /admin/' },
                { directive: 'Sitemap: https://...', desc: 'Point crawlers to sitemap' },
              ].map(({ directive, desc }) => (
                <div key={directive}>
                  <p className="font-mono text-xs text-foreground bg-muted/40 px-2 py-0.5 rounded">{directive}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 pl-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Validation</h3>
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${isValid ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
              <Check className={`w-4 h-4 ${isValid ? 'text-success' : 'text-destructive'}`} />
              <p className={`text-xs font-medium ${isValid ? 'text-success' : 'text-destructive'}`}>
                {isValid ? 'Valid robots.txt format' : 'Missing User-agent or Allow/Disallow directives'}
              </p>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1.5 rounded border border-border break-all">
                yourdomain.com/robots.txt
              </p>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Crawler Status</h3>
            <div className="space-y-1.5">
              {crawlerStatus.map(({ name, status }) => (
                <div key={name} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{name}</span>
                  <span className={status === 'Allowed' ? 'text-xs text-success font-medium' : 'text-xs text-destructive font-medium'}>
                    {status}
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
