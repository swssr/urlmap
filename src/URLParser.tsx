import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { ParsedURL } from './models/ParsedURL';
import { ColorMap } from './models/ColorMap';
import { ComponentGroup } from './models/ComponentGroup';

const URLParser: React.FC = () => {
  const [url, setUrl] = useState<string>('https://username:password@example.com:8080/path/to/page?query=string&foo=bar#fragment');
  const [parsedUrl, setParsedUrl] = useState<ParsedURL | null>(null);
  
  // Color schema for URL components
  const colorMap: ColorMap = {
    protocol: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    username: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    password: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    hostname: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    port: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    pathname: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    search: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    hash: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  };
  
  const parseUrl = (inputUrl: string): ParsedURL => {
    try {
      const parsed = new URL(inputUrl);
      
      // Extract all searchParams into an object
      const searchParams: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });
      
      const result: ParsedURL = {
        href: parsed.href,
        protocol: parsed.protocol,
        username: parsed.username,
        password: parsed.password,
        host: parsed.host,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        searchParams: searchParams,
        hash: parsed.hash
      };
      
      setParsedUrl(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setParsedUrl({ error: errorMessage });
      return { error: errorMessage };
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    parseUrl(url);
  };

  // Parse on initial load
  useEffect(() => {
    parseUrl(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderUrlComponents = () => {
    if (!parsedUrl || parsedUrl.error) {
      return (
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800 mt-6">
          {parsedUrl?.error || "Invalid URL"}
        </div>
      );
    }
    
    // Group components for cleaner display
    const components: ComponentGroup[] = [
      { 
        key: "base", 
        label: "Base",
        items: [
          { key: "protocol", label: "Protocol", value: parsedUrl.protocol || "-" },
          { key: "hostname", label: "Hostname", value: parsedUrl.hostname || "-" },
          { key: "port", label: "Port", value: parsedUrl.port || "-" }
        ]
      },
      { 
        key: "auth", 
        label: "Authentication",
        items: [
          { key: "username", label: "Username", value: parsedUrl.username || "-" },
          { key: "password", label: "Password", value: parsedUrl.password ? "••••••••" : "-" }
        ]
      },
      { 
        key: "path", 
        label: "Path",
        items: [
          { key: "pathname", label: "Path", value: parsedUrl.pathname || "-" }
        ]
      },
      { 
        key: "query", 
        label: "Query",
        items: [
          { key: "search", label: "Query String", value: parsedUrl.search || "-" }
        ]
      },
      { 
        key: "fragment", 
        label: "Fragment",
        items: [
          { key: "hash", label: "Fragment", value: parsedUrl.hash || "-" }
        ]
      }
    ];

    return (
      <div className="mt-6 space-y-6">
        {/* Color legend */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(colorMap).map(([key, colors]) => (
            <div key={key} className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-1 ${colors.bg}`}></div>
              <span className="text-xs capitalize">{key}</span>
            </div>
          ))}
        </div>
        
        {/* Visual URL representation */}
        <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto border border-gray-200">
          {parsedUrl.protocol && <span className={`${colorMap.protocol.bg} ${colorMap.protocol.text} px-1 rounded`}>{parsedUrl.protocol}//</span>}
          {parsedUrl.username && <span className={`${colorMap.username.bg} ${colorMap.username.text} px-1 rounded`}>{parsedUrl.username}</span>}
          {parsedUrl.password && <><span>:</span><span className={`${colorMap.password.bg} ${colorMap.password.text} px-1 rounded`}>{parsedUrl.password}</span></>}
          {(parsedUrl.username || parsedUrl.password) && <span>@</span>}
          {parsedUrl.hostname && <span className={`${colorMap.hostname.bg} ${colorMap.hostname.text} px-1 rounded`}>{parsedUrl.hostname}</span>}
          {parsedUrl.port && <><span>:</span><span className={`${colorMap.port.bg} ${colorMap.port.text} px-1 rounded`}>{parsedUrl.port}</span></>}
          {parsedUrl.pathname && <span className={`${colorMap.pathname.bg} ${colorMap.pathname.text} px-1 rounded`}>{parsedUrl.pathname}</span>}
          {parsedUrl.search && <span className={`${colorMap.search.bg} ${colorMap.search.text} px-1 rounded`}>{parsedUrl.search}</span>}
          {parsedUrl.hash && <span className={`${colorMap.hash.bg} ${colorMap.hash.text} px-1 rounded`}>{parsedUrl.hash}</span>}
        </div>
        
        {components.map(group => (
          <div key={group.key} className="border-t border-gray-200 pt-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">{group.label}</h3>
            <div className="space-y-2">
              {group.items.map(item => (
                <div key={item.key} className="flex">
                  <div className="w-24 text-gray-500 text-sm">{item.label}</div>
                  {colorMap[item.key] && item.value !== "-" ? (
                    <div className={`font-mono text-sm ${colorMap[item.key].bg} ${colorMap[item.key].text} px-2 py-0.5 rounded`}>
                      {item.value}
                    </div>
                  ) : (
                    <div className="font-mono text-sm">{item.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Query Parameters Section */}
        {parsedUrl.searchParams && Object.keys(parsedUrl.searchParams).length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Query Parameters</h3>
            <div className={`rounded ${colorMap.search.bg} border ${colorMap.search.border}`}>
              {Object.entries(parsedUrl.searchParams).map(([key, value]) => (
                <div key={key} className="flex py-2 px-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-24 text-gray-700 text-sm">{key}</div>
                  <div className="font-mono text-sm">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-6 text-center text-gray-800">URL Parser</h1>
      
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={url}
          onChange={handleInputChange}
          className="w-full p-3 pr-20 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a URL to parse"
        />
        <button 
          type="submit" 
          className="absolute right-1 top-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Parse
        </button>
      </form>

      {renderUrlComponents()}
      
      {parsedUrl && !parsedUrl.error && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <details className="group">
            <summary className="list-none flex justify-between items-center cursor-pointer">
              <h3 className="text-xs uppercase tracking-wider text-gray-500">Raw JSON Output</h3>
              <span className="text-gray-500 text-xs">View</span>
            </summary>
            <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto font-mono border border-gray-200">
              {JSON.stringify(parsedUrl, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default URLParser;