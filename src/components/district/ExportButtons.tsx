"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileJson, FileSpreadsheet, ChevronDown } from "lucide-react";
import { DistrictDetail } from "@/lib/types";
import {
    exportDistrictAsCSV,
    exportDistrictAsJSON,
} from "@/lib/utils/export";
import { cn } from "@/lib/utils/helpers";

interface ExportButtonsProps {
    data: DistrictDetail;
    slug: string;
}

export function ExportButtons({ data, slug }: ExportButtonsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleExportCSV = () => {
        exportDistrictAsCSV(data, slug);
        setIsOpen(false);
    };

    const handleExportJSON = () => {
        exportDistrictAsJSON(data, slug);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-nature-700 font-semibold border border-nature-500 hover:bg-nature-50 transition"
            >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isOpen ? "transform rotate-180" : ""
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        <button
                            onClick={handleExportCSV}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            Export as CSV
                        </button>
                        <button
                            onClick={handleExportJSON}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                            <FileJson className="w-4 h-4 text-orange-600" />
                            Export as JSON
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
