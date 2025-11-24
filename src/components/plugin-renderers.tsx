import React from 'react';
import { TimeCard } from './TimeCard';

/**
 * Props passed to all plugin renderers
 */
export interface PluginRendererProps {
  result: unknown;
  toolName: string;
  toolCallId: string;
}

/**
 * Plugin renderer component type
 */
export type PluginRenderer = React.FC<PluginRendererProps>;

/**
 * Renderer for tool_now plugin output
 * Expects result format: [{ type: "text", text: "ISO8601_TIMESTAMP" }]
 */
const TimeCardRenderer: PluginRenderer = ({ result, toolName, toolCallId }) => {

  
  try {
    // Extract timestamp from tool output
    if (Array.isArray(result)) {

      const textOutput = result.find(
        (item: any) => item?.type === 'text' && typeof item.text === 'string'
      );
      

      
      if (textOutput?.text) {

        return <TimeCard timestamp={textOutput.text} />;
      }
    }
    
    // Fallback: if result is a string directly
    if (typeof result === 'string') {
      return <TimeCard timestamp={result} />;
    }
    
    console.warn('[TimeCardRenderer] ⚠️ 无法解析 result，返回 null');
    return null;
  } catch (error) {
    console.error('[TimeCardRenderer] ❌ 解析失败:', error);
    return null;
  }
};

/**
 * Plugin Renderer Registry
 * 
 * KISS Pattern: Simple object mapping plugin names to React components.
 * 
 * To add a new plugin renderer:
 * 1. Create your component (e.g., WeatherCard)
 * 2. Create a renderer function that extracts data from `result`
 * 3. Add one line to this object: 'plugin_name': YourRenderer
 * 
 * Example:
 *   const WeatherRenderer: PluginRenderer = ({ result }) => {
 *     const data = extractWeatherData(result);
 *     return <WeatherCard {...data} />;
 *   };
 * 
 *   export const PLUGIN_RENDERERS = {
 *     tool_now: TimeCardRenderer,
 *     tool_weather: WeatherRenderer,  // <- Add here
 *   };
 */
export const PLUGIN_RENDERERS: Record<string, PluginRenderer> = {
  tool_now: TimeCardRenderer,
  // Add more plugin renderers here
};
