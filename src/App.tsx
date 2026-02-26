import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Globe, Key, User, FileText, AlertCircle, Check, Copy } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('cf_account_id');
    const savedApiToken = localStorage.getItem('cf_api_token');
    if (savedAccountId) setAccountId(savedAccountId);
    if (savedApiToken) setApiToken(savedApiToken);
  }, []);

  const handleCopy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !accountId || !apiToken) {
      setError('Please fill in all fields.');
      return;
    }

    // Save credentials for next time
    localStorage.setItem('cf_account_id', accountId);
    localStorage.setItem('cf_api_token', apiToken);

    setLoading(true);
    setError('');
    setMarkdown('');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, accountId, apiToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape the URL');
      }

      if (data.success && data.result) {
        setMarkdown(data.result);
      } else {
        throw new Error('Unexpected response format from Cloudflare API');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while scraping.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl mb-4">
            Markdown Scraper
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Extract clean, readable Markdown from any webpage using Cloudflare's Browser Rendering API.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                Configuration
              </h2>
              
              <form onSubmit={handleScrape} className="space-y-5">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-zinc-700 mb-1">
                    Target URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="url"
                      id="url"
                      required
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="accountId" className="block text-sm font-medium text-zinc-700 mb-1">
                    Cloudflare Account ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      id="accountId"
                      required
                      placeholder="Your Account ID"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="apiToken" className="block text-sm font-medium text-zinc-700 mb-1">
                    Cloudflare API Token
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="password"
                      id="apiToken"
                      required
                      placeholder="Your API Token"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Needs "Browser Rendering - Edit" permissions.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Scraping...
                    </>
                  ) : (
                    'Extract Markdown'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-semibold mb-1">Error</p>
                    <p>{error}</p>
                    {error.includes('Authentication') && (
                      <div className="mt-2 text-xs text-red-700 space-y-1">
                        <p><strong>To fix this:</strong></p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Go to Cloudflare Dashboard &gt; My Profile &gt; API Tokens</li>
                          <li>Click "Create Token" &gt; "Create Custom Token"</li>
                          <li>Under Permissions, select: <strong>Account</strong> | <strong>Browser Rendering</strong> | <strong>Edit</strong></li>
                          <li>Select your Account under Account Resources</li>
                          <li>Ensure Browser Rendering is enabled for your account (Workers & Pages &gt; Browser Rendering)</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden h-full min-h-[500px] flex flex-col">
              <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-zinc-500" />
                  Result
                </h2>
                {markdown && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="p-6 flex-1 overflow-auto bg-white">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p>Rendering webpage and extracting content...</p>
                  </div>
                ) : markdown ? (
                  <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdown}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p>Enter a URL and credentials to see the extracted markdown here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
