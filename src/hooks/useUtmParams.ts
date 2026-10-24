import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface UtmParams {
  src: string | null;
  sck: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

const UTM_STORAGE_KEY = "magnetize_utm_params";

// Capture UTM params from URL and persist them
export const useUtmCapture = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const utmKeys = ["src", "sck", "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"];
    const hasUtmParams = utmKeys.some(key => searchParams.get(key));

    if (hasUtmParams) {
      const utmParams: UtmParams = {
        src: searchParams.get("src"),
        sck: searchParams.get("sck"),
        utm_source: searchParams.get("utm_source"),
        utm_campaign: searchParams.get("utm_campaign"),
        utm_medium: searchParams.get("utm_medium"),
        utm_content: searchParams.get("utm_content"),
        utm_term: searchParams.get("utm_term"),
      };
      
      // Only save if at least one param exists
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
      console.log("UTM params captured:", utmParams);
    }
  }, [searchParams]);
};

// Get stored UTM params
export const getStoredUtmParams = (): UtmParams | null => {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading UTM params from storage:", error);
  }
  return null;
};

// Build URL with UTM params appended
export const appendUtmToUrl = (baseUrl: string): string => {
  const utmParams = getStoredUtmParams();
  if (!utmParams) return baseUrl;

  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.pathname + url.search;
};

// Hook to get UTM params for use in components
export const useUtmParams = () => {
  const [utmParams, setUtmParams] = useState<UtmParams | null>(null);

  useEffect(() => {
    setUtmParams(getStoredUtmParams());
  }, []);

  return utmParams;
};
