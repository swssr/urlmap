import React, { useState, FormEvent } from "react";
import { ParsedURL } from "./models/ParsedURL";
import { ColorMap } from "./models/ColorMap";

const URLParser: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    "https://username:password@example.com:8080/path/to/page?query=string&foo=bar#fragment\nhttps://www.differentsite.org:443/another/path?query=different#section",
  );
  const [urls, setUrls] = useState<string[]>([]);
  const [parsedUrls, setParsedUrls] = useState<ParsedURL[]>([]);
  const [activeTab, setActiveTab] = useState<"visual" | "table" | "raw">(
    "visual",
  );

  // Color schema for URL components with more distinct colors
  const colorMap: ColorMap = {
    protocol: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      label: "Protocol",
      description: "Specifies the protocol used (e.g., http:, https:)",
    },
    username: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      label: "Username",
      description: "Username for authentication",
    },
    password: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      label: "Password",
      description: "Password for authentication",
    },
    hostname: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      label: "Hostname",
      description: "Domain name or IP address",
    },
    port: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      label: "Port",
      description: "TCP port number (default: 80 for HTTP, 443 for HTTPS)",
    },
    pathname: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      label: "Path",
      description: "Path to resource on server",
    },
    search: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      label: "Query",
      description: "Parameters passed to the server",
    },
    hash: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      label: "Fragment",
      description: "Anchor or hash identifier",
    },
  };

  const parseUrl = (inputUrl: string): ParsedURL => {
    try {
      const parsed = new URL(inputUrl);

      const searchParams: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      return {
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
        hash: parsed.hash,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { error: errorMessage };
    }
  };

  const handleCompare = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const list = inputText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    const results = list.map(parseUrl);
    setUrls(list);
    setParsedUrls(results);
  };

  const getDiffMap = (key: keyof ParsedURL): Record<number, boolean> => {
    const values = parsedUrls.map((url) => url[key] || "-");
    const baseValue = values[0];
    return values.reduce(
      (map, val, i) => {
        map[i] = val !== baseValue;
        return map;
      },
      {} as Record<number, boolean>,
    );
  };

  // Component to render a colorized URL with each part in its own color
  const ColorizedURL = ({ url, index }: { url: ParsedURL; index: number }) => {
    if (url.error) {
      return <div className="text-red-600">Invalid URL: {url.error}</div>;
    }

    // Build the URL parts with appropriate styling
    return (
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-xs text-gray-500 mb-2">URL {index + 1}</div>
        <div className="flex flex-wrap items-center text-sm font-mono break-all">
          {/* Protocol */}
          <span
            className={`${colorMap.protocol.bg} ${colorMap.protocol.text} px-1 py-0.5 rounded mr-1 mb-1`}
          >
            {url.protocol}//
          </span>

          {/* Username & Password if present */}
          {url.username && (
            <span
              className={`${colorMap.username.bg} ${colorMap.username.text} px-1 py-0.5 rounded mr-1 mb-1`}
            >
              {url.username}
            </span>
          )}
          {url.password && (
            <>
              <span className="mx-0.5 text-gray-500">:</span>
              <span
                className={`${colorMap.password.bg} ${colorMap.password.text} px-1 py-0.5 rounded mr-1 mb-1`}
              >
                {url.password}
              </span>
            </>
          )}
          {(url.username || url.password) && (
            <span className="mx-0.5 text-gray-500">@</span>
          )}

          {/* Hostname */}
          <span
            className={`${colorMap.hostname.bg} ${colorMap.hostname.text} px-1 py-0.5 rounded mr-1 mb-1`}
          >
            {url.hostname}
          </span>

          {/* Port if present */}
          {url.port && (
            <>
              <span className="mx-0.5 text-gray-500">:</span>
              <span
                className={`${colorMap.port.bg} ${colorMap.port.text} px-1 py-0.5 rounded mr-1 mb-1`}
              >
                {url.port}
              </span>
            </>
          )}

          {/* Pathname */}
          <span
            className={`${colorMap.pathname.bg} ${colorMap.pathname.text} px-1 py-0.5 rounded mr-1 mb-1`}
          >
            {url.pathname}
          </span>

          {/* Search params */}
          {url.search && (
            <span
              className={`${colorMap.search.bg} ${colorMap.search.text} px-1 py-0.5 rounded mr-1 mb-1`}
            >
              {url.search}
            </span>
          )}

          {/* Hash/fragment */}
          {url.hash && (
            <span
              className={`${colorMap.hash.bg} ${colorMap.hash.text} px-1 py-0.5 rounded mr-1 mb-1`}
            >
              {url.hash}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Generate a component map for a URL's parts
  const generatePartMap = (url: ParsedURL): Record<string, string> => {
    if (url.error) return {};
    return {
      protocol: url.protocol || "",
      auth: url.username
        ? `${url.username}${url.password ? `:${url.password}` : ""}@`
        : "",
      hostname: url.hostname || "",
      port: url.port ? `:${url.port}` : "",
      pathname: url.pathname || "",
      search: url.search || "",
      hash: url.hash || "",
    };
  };

  // Side-by-side diff view component
  const SideBySideDiff = () => {
    if (parsedUrls.length !== 2) {
      return (
        <div className="text-center text-gray-500 p-4">
          Side-by-side comparison requires exactly 2 URLs
        </div>
      );
    }

    const url1Parts = generatePartMap(parsedUrls[0]);
    const url2Parts = generatePartMap(parsedUrls[1]);

    // Parts to display in order
    const parts = [
      "protocol",
      "auth",
      "hostname",
      "port",
      "pathname",
      "search",
      "hash",
    ];

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-xs text-gray-500 mb-2">URL 1</div>
          <div className="font-mono text-sm">
            {parts.map((part) => {
              const isDifferent = url1Parts[part] !== url2Parts[part];
              return (
                <span
                  key={part}
                  className={`${isDifferent ? "bg-red-100" : ""} ${part in colorMap ? colorMap[part as keyof ColorMap].text : ""}`}
                >
                  {url1Parts[part]}
                </span>
              );
            })}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-xs text-gray-500 mb-2">URL 2</div>
          <div className="font-mono text-sm">
            {parts.map((part) => {
              const isDifferent = url1Parts[part] !== url2Parts[part];
              return (
                <span
                  key={part}
                  className={`${isDifferent ? "bg-red-100" : ""} ${part in colorMap ? colorMap[part as keyof ColorMap].text : ""}`}
                >
                  {url2Parts[part]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // URL Parts Legend component
  const URLPartsLegend = () => {
    return (
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {Object.entries(colorMap).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <span
              className={`${value.bg} ${value.text} px-2 py-1 rounded mr-2 text-xs`}
            >
              {value.label}
            </span>
            <span className="text-xs text-gray-600">{value.description}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
        URL Analyzer & Comparison Tool
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Parse, visualize, and compare URLs to understand their components
      </p>

      <form onSubmit={handleCompare} className="mb-6">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter URLs (one per line):
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/path?query=string#fragment"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm font-medium transition-colors"
        >
          Analyze & Compare
        </button>
      </form>

      {parsedUrls.length > 0 && (
        <div>
          <URLPartsLegend />

          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("visual")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "visual"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Visual Breakdown
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "table"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Component Table
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "raw"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Raw Data
              </button>
            </div>

            <div className="mt-4">
              {activeTab === "visual" && (
                <div>
                  <div className="mb-6">
                    {parsedUrls.map((url, index) => (
                      <ColorizedURL key={index} url={url} index={index} />
                    ))}
                  </div>

                  {parsedUrls.length >= 2 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">
                        URL Comparison
                      </h2>
                      <SideBySideDiff />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-mono border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border border-gray-300">
                          Component
                        </th>
                        {urls.map((_, i) => (
                          <th
                            key={i}
                            className="text-left p-2 border border-gray-300"
                          >
                            URL {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(colorMap).map((key) => {
                        const diffMap = getDiffMap(key as keyof ParsedURL);
                        const colorStyle = colorMap[key as keyof ColorMap];

                        return (
                          <tr key={key} className="hover:bg-gray-50">
                            <td
                              className={`p-2 font-bold ${colorStyle.text} border border-gray-300`}
                            >
                              {colorStyle.label}
                            </td>
                            {parsedUrls.map((url, i) => {
                              const value = url[key as keyof ParsedURL] || "-";
                              const isDifferent = diffMap[i];

                              return (
                                <td
                                  key={i}
                                  className={`p-2 border border-gray-300 ${
                                    isDifferent
                                      ? "bg-red-50 text-red-800"
                                      : `${colorStyle.bg} ${colorStyle.text}`
                                  }`}
                                >
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* Add searchParams as expandable rows if any URL has query parameters */}
                      {parsedUrls.some(
                        (url) =>
                          url.searchParams &&
                          Object.keys(url.searchParams || {}).length > 0,
                      ) && (
                        <tr>
                          <td
                            colSpan={urls.length + 1}
                            className="p-2 border border-gray-300 bg-gray-50"
                          >
                            <details>
                              <summary className="cursor-pointer font-medium">
                                Query Parameters (Expanded)
                              </summary>
                              <table className="w-full mt-2 text-xs">
                                <thead>
                                  <tr>
                                    <th className="text-left p-1">Parameter</th>
                                    {urls.map((_, i) => (
                                      <th key={i} className="text-left p-1">
                                        URL {i + 1}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Get all unique parameter names across all URLs */}
                                  {Array.from(
                                    new Set(
                                      parsedUrls.flatMap((url) =>
                                        Object.keys(url.searchParams || {}),
                                      ),
                                    ),
                                  ).map((param) => (
                                    <tr key={param}>
                                      <td className="p-1 font-medium">
                                        {param}
                                      </td>
                                      {parsedUrls.map((url, i) => {
                                        const value =
                                          url.searchParams?.[param] || "-";
                                        const allValues = parsedUrls.map(
                                          (u) => u.searchParams?.[param] || "-",
                                        );
                                        const isDifferent = allValues.some(
                                          (v) => v !== allValues[0],
                                        );

                                        return (
                                          <td
                                            key={i}
                                            className={`p-1 ${isDifferent ? "bg-red-50 text-red-800" : ""}`}
                                          >
                                            {value}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </details>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "raw" && (
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <pre className="text-xs overflow-x-auto font-mono">
                    {JSON.stringify(parsedUrls, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLParser;

