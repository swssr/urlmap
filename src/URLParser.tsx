import React, { useState, useEffect } from "react";
import { ParsedURL } from "./models/ParsedURL";
import { ColorMap } from "./models/ColorMap";

const URLParser: React.FC = () => {
  const [urlList, setUrlList] = useState<string[]>([
    "https://username:password@example.com:8080/path/to/page?query=string&foo=bar#fragment",
    "https://www.differentsite.org:443/another/path?query=different#section",
  ]);
  const [parsedUrls, setParsedUrls] = useState<ParsedURL[]>([]);
  const [activeTab, setActiveTab] = useState<
    "visual" | "components" | "params" | "diff"
  >("visual");

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
      description: "TCP port number",
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

      // For easier component analysis, extract the auth part
      let auth = "";
      if (parsed.username || parsed.password) {
        auth = `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`;
      }

      return {
        href: parsed.href,
        protocol: parsed.protocol,
        auth: auth,
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

  // Parse all URLs whenever the URL list changes
  useEffect(() => {
    const results = urlList.map(parseUrl);
    setParsedUrls(results);
  }, [urlList]);

  // Handle adding a new URL input
  const handleAddUrl = () => {
    setUrlList([...urlList, ""]);
  };

  // Handle removing a URL input
  const handleRemoveUrl = (index: number) => {
    if (urlList.length > 1) {
      const newList = [...urlList];
      newList.splice(index, 1);
      setUrlList(newList);
    }
  };

  // Handle URL input change
  const handleUrlChange = (index: number, value: string) => {
    const newList = [...urlList];
    newList[index] = value;
    setUrlList(newList);
  };

  // Get differences between URLs for a specific component
  const getComponentDiffs = (key: keyof ParsedURL): Record<number, boolean> => {
    if (parsedUrls.length === 0) return {};

    const values = parsedUrls.map((url) =>
      url[key] !== undefined ? url[key] : "",
    );
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
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">URL {index + 1}</div>
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

  // Improved DiffChecker-style Component
  const DiffCheckerView = () => {
    if (parsedUrls.length < 2) {
      return (
        <div className="text-center text-gray-500 p-4">
          Need at least 2 URLs for comparison
        </div>
      );
    }

    // Generate a clean list of component names for comparison
    const componentsToCompare = [
      { key: "protocol", label: "Protocol" },
      { key: "auth", label: "Authentication" },
      { key: "hostname", label: "Hostname" },
      { key: "port", label: "Port" },
      { key: "pathname", label: "Path" },
      { key: "search", label: "Query String" },
      { key: "hash", label: "Fragment" },
    ];

    // Check if there are any differences at all
    const hasDifferences = componentsToCompare.some((comp) => {
      const diffs = getComponentDiffs(comp.key as keyof ParsedURL);
      return Object.values(diffs).some((isDiff) => isDiff);
    });

    // Gather all unique search parameter keys
    const allSearchParams = new Set<string>();
    parsedUrls.forEach((url) => {
      if (url.searchParams) {
        Object.keys(url.searchParams).forEach((key) =>
          allSearchParams.add(key),
        );
      }
    });

    return (
      <div>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          {hasDifferences ? (
            <div className="flex items-center text-blue-700">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Differences found between URLs. Different values are highlighted
              in red.
            </div>
          ) : (
            <div className="flex items-center text-green-700">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              No differences found between URLs.
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium">URL Components Comparison</h3>
          </div>

          {/* Component Comparison Table */}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                  Component
                </th>
                {parsedUrls.map((_, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                  >
                    URL {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {componentsToCompare.map((component) => {
                const diffs = getComponentDiffs(
                  component.key as keyof ParsedURL,
                );
                const componentKey = component.key as keyof ParsedURL;

                return (
                  <tr key={component.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${colorMap[componentKey as keyof ColorMap]?.bg || "bg-gray-200"}`}
                        ></span>
                        {component.label}
                      </div>
                    </td>
                    {parsedUrls.map((url, i) => {
                      const value = url[componentKey] || "";
                      const isDifferent = diffs[i];

                      return (
                        <td
                          key={i}
                          className={`px-4 py-3 text-sm font-mono ${isDifferent ? "bg-red-50 text-red-800" : "text-gray-500"}`}
                        >
                          {value === "" ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Search Parameters Comparison */}
          {allSearchParams.size > 0 && (
            <div>
              <div className="p-4 bg-gray-50 border-t border-b border-gray-200">
                <h3 className="font-medium">Query Parameters Comparison</h3>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                      Parameter
                    </th>
                    {parsedUrls.map((_, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                      >
                        URL {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.from(allSearchParams).map((param) => {
                    // Check if any of the URLs have different values for this param
                    const values = parsedUrls.map(
                      (url) => url.searchParams?.[param] || null,
                    );
                    const firstValue = values[0];
                    const hasDiff = values.some((v) => v !== firstValue);

                    return (
                      <tr key={param} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                          <div className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-2 bg-orange-100"></span>
                            {param}
                          </div>
                        </td>
                        {parsedUrls.map((url, i) => {
                          const value = url.searchParams?.[param] || null;
                          const isDifferent = value !== firstValue;

                          return (
                            <td
                              key={i}
                              className={`px-4 py-3 text-sm font-mono ${isDifferent ? "bg-red-50 text-red-800" : "text-gray-500"}`}
                            >
                              {value === null ? (
                                <span className="text-gray-400">-</span>
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component Table View
  const ComponentTable = () => {
    // Get all the components we want to display
    const components = [
      "protocol",
      "username",
      "password",
      "hostname",
      "port",
      "pathname",
      "search",
      "hash",
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border border-gray-300">
                Component
              </th>
              {parsedUrls.map((_, i) => (
                <th key={i} className="text-left p-3 border border-gray-300">
                  URL {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {components.map((component) => {
              const diffs = getComponentDiffs(component as keyof ParsedURL);
              const colorStyle = colorMap[component as keyof ColorMap];

              return (
                <tr key={component} className="hover:bg-gray-50">
                  <td
                    className={`p-3 font-medium ${colorStyle.text} border border-gray-300`}
                  >
                    {colorStyle.label}
                  </td>
                  {parsedUrls.map((url, i) => {
                    const value = url[component as keyof ParsedURL] || "-";
                    const isDifferent = diffs[i];

                    return (
                      <td
                        key={i}
                        className={`p-3 font-mono border border-gray-300 ${
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
          </tbody>
        </table>
      </div>
    );
  };

  // Query Parameters View
  const QueryParamsView = () => {
    // Get all unique search parameter keys
    const allSearchParams = new Set<string>();
    parsedUrls.forEach((url) => {
      if (url.searchParams) {
        Object.keys(url.searchParams).forEach((key) =>
          allSearchParams.add(key),
        );
      }
    });

    if (allSearchParams.size === 0) {
      return (
        <div className="text-center text-gray-500 p-4">
          No query parameters found in any URL
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Query Parameters Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border border-gray-300">
                  Parameter
                </th>
                {parsedUrls.map((_, i) => (
                  <th key={i} className="text-left p-3 border border-gray-300">
                    URL {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(allSearchParams).map((param) => {
                // Check if any of the URLs have different values for this param
                const values = parsedUrls.map(
                  (url) => url.searchParams?.[param] || null,
                );
                const firstValue = values[0];
                const hasDiff = values.some((v) => v !== firstValue);

                return (
                  <tr key={param} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-orange-800 border border-gray-300 bg-orange-50">
                      {param}
                    </td>
                    {parsedUrls.map((url, i) => {
                      const value = url.searchParams?.[param] || null;
                      const isDifferent = value !== firstValue && hasDiff;

                      return (
                        <td
                          key={i}
                          className={`p-3 font-mono border border-gray-300 ${
                            isDifferent
                              ? "bg-red-50 text-red-800"
                              : "text-gray-600"
                          }`}
                        >
                          {value === null ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
        URL Parser & Comparison Tool
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Parse, visualize, and compare multiple URLs in a diffchecker-style
        interface
      </p>

      {/* URL Input Section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-medium mb-4">Enter URLs for Analysis</h2>

        {urlList.map((url, index) => (
          <div key={index} className="flex items-center mb-3">
            <div className="flex-grow mr-2">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium text-gray-600">
                  URL {index + 1}
                </span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              {parsedUrls[index]?.error && (
                <div className="mt-1 text-xs text-red-600">
                  {parsedUrls[index].error}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleRemoveUrl(index)}
              disabled={urlList.length <= 1}
              className={`p-2 rounded-full ${
                urlList.length <= 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-500 hover:bg-red-50"
              }`}
              title="Remove URL"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}

        <div className="mt-4 flex">
          <button
            type="button"
            onClick={handleAddUrl}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Add Another URL
          </button>
        </div>
      </div>

      {/* Check if we have at least one valid URL to parse */}
      {parsedUrls.some((url) => !url.error) && (
        <div>
          <URLPartsLegend />

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab("visual")}
                className={`${
                  activeTab === "visual"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
              >
                Visual Breakdown
              </button>
              <button
                onClick={() => setActiveTab("components")}
                className={`${
                  activeTab === "components"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab("params")}
                className={`${
                  activeTab === "params"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
              >
                Query Parameters
              </button>
              <button
                onClick={() => setActiveTab("diff")}
                className={`${
                  activeTab === "diff"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
              >
                DiffChecker
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {activeTab === "visual" && (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Visual URL Breakdown
                </h3>
                {parsedUrls.map(
                  (url, index) =>
                    !url.error && (
                      <ColorizedURL key={index} url={url} index={index} />
                    ),
                )}
              </div>
            )}

            {activeTab === "components" && <ComponentTable />}

            {activeTab === "params" && <QueryParamsView />}

            {activeTab === "diff" && <DiffCheckerView />}
          </div>
        </div>
      )}
    </div>
  );
};

export default URLParser;

