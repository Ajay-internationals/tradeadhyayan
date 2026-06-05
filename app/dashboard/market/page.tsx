"use client";

import React, { useEffect, useRef, useState } from "react";
import { LineChart, Calendar, Globe, LayoutGrid, Flame } from "lucide-react";

// Helper component to load TradingView widgets safely
const TradingViewWidget = ({ src, config, height = "100%", width = "100%" }: { src: string, config: any, height?: string | number, width?: string | number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear the container first to prevent duplicate widgets in React Strict Mode
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [src, config]);

  return <div className="tradingview-widget-container" ref={containerRef} style={{ height, width }}></div>;
};

export default function MarketViewPage() {
  const [activeTab, setActiveTab] = useState<"advanced" | "overview" | "heatmap" | "hotlists" | "calendar">("advanced");

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF] p-6 lg:p-8 h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-4 border-b border-[#E9E6F5]">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Live Market Terminal</h1>
            <p className="text-[#64748B] font-medium mt-1 text-sm">Real-time charts, heatmaps, major indices, and economic data.</p>
          </div>

          <div className="flex flex-wrap bg-white border border-[#E9E6F5] p-1 rounded-xl shadow-sm self-start gap-1">
            <button
              onClick={() => setActiveTab("advanced")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "advanced" ? "bg-[#F4F0FF] text-[#7C3AED]" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <LineChart size={16} /> Chart
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "overview" ? "bg-[#F4F0FF] text-[#7C3AED]" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Globe size={16} /> Indices Overview
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "heatmap" ? "bg-[#F4F0FF] text-[#7C3AED]" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <LayoutGrid size={16} /> Stock Heatmap
            </button>
            <button
              onClick={() => setActiveTab("hotlists")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "hotlists" ? "bg-[#F4F0FF] text-[#7C3AED]" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Flame size={16} /> Top Movers
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "calendar" ? "bg-[#F4F0FF] text-[#7C3AED]" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Calendar size={16} /> Calendar
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[24px] border border-[#E9E6F5] shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          
          {activeTab === "advanced" && (
            <div className="flex-1 w-full h-full p-2">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                config={{
                  autosize: true,
                  symbol: "BSE:SENSEX",
                  interval: "5",
                  timezone: "Asia/Kolkata",
                  theme: "light",
                  style: "1",
                  locale: "in",
                  enable_publishing: false,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  gridColor: "rgba(233, 230, 245, 1)",
                  hide_top_toolbar: false,
                  hide_legend: false,
                  save_image: false,
                  container_id: "tradingview_advanced_chart",
                  details: true,
                  hotlist: true,
                  calendar: false,
                  show_popup_button: true,
                  popup_width: "1000",
                  popup_height: "650",
                  support_host: "https://www.tradingview.com"
                }}
              />
            </div>
          )}

          {activeTab === "overview" && (
            <div className="flex-1 w-full h-full p-2">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
                config={{
                  colorTheme: "light",
                  dateRange: "12M",
                  showChart: true,
                  locale: "in",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  showFloatingTooltip: false,
                  width: "100%",
                  height: "100%",
                  tabs: [
                    {
                      title: "Indian Indices",
                      symbols: [
                        { s: "BSE:SENSEX", d: "Sensex" },
                        { s: "NSE:NIFTY", d: "Nifty 50" },
                        { s: "NSE:BANKNIFTY", d: "Bank Nifty" },
                        { s: "NSE:CNXIT", d: "Nifty IT" },
                        { s: "NSE:NIFTY_FIN_SERVICE", d: "Nifty Fin Service" },
                        { s: "BSE:BSE_MIDCAP", d: "BSE Midcap" }
                      ],
                      originalTitle: "Indices"
                    },
                    {
                      title: "Global Indices",
                      symbols: [
                        { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
                        { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" },
                        { s: "FOREXCOM:DJI", d: "Dow Jones" },
                        { s: "INDEX:NKY", d: "Nikkei 225" },
                        { s: "INDEX:FTSE", d: "FTSE 100" }
                      ]
                    },
                    {
                      title: "Commodities & Forex",
                      symbols: [
                        { s: "MCX:GOL1!", d: "Gold MCX" },
                        { s: "MCX:SIL1!", d: "Silver MCX" },
                        { s: "MCX:CRU1!", d: "Crude Oil MCX" },
                        { s: "FX_IDC:USDINR", d: "USD to INR" },
                        { s: "FX_IDC:EURINR", d: "EUR to INR" }
                      ]
                    }
                  ]
                }}
              />
            </div>
          )}

          {activeTab === "heatmap" && (
            <div className="flex-1 w-full h-full p-2">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
                config={{
                  exchanges: ["BSE"],
                  dataSource: "SENSEX",
                  grouping: "sector",
                  blockSize: "market_cap_basic",
                  blockColor: "change",
                  locale: "in",
                  symbolUrl: "",
                  colorTheme: "light",
                  hasTopBar: true,
                  isDataSetEnabled: true,
                  isZoomEnabled: true,
                  hasSymbolTooltip: true,
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          )}

          {activeTab === "hotlists" && (
            <div className="flex-1 w-full h-full p-2">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js"
                config={{
                  colorTheme: "light",
                  dateRange: "12M",
                  exchange: "BSE",
                  showChart: true,
                  locale: "in",
                  largeChartUrl: "",
                  isTransparent: false,
                  showSymbolLogo: true,
                  showFloatingTooltip: false,
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="flex-1 w-full h-full p-2">
              <TradingViewWidget 
                src="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
                config={{
                  colorTheme: "light",
                  isTransparent: false,
                  width: "100%",
                  height: "100%",
                  locale: "in",
                  importanceFilter: "-1,0,1",
                  currencyFilter: "INR,USD,EUR,GBP,JPY"
                }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
