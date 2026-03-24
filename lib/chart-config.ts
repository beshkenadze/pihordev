export const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

export const SEMANTIC_COLORS = {
	success: "oklch(0.7 0.18 155)",
	error: "oklch(0.65 0.22 25)",
	warning: "oklch(0.75 0.15 75)",
	info: "var(--chart-1)",
};

export const tooltipStyle: React.CSSProperties = {
	backgroundColor: "oklch(var(--popover))" as string,
	border: "1px solid oklch(var(--border))" as string,
	borderRadius: "var(--radius)",
	fontSize: 12,
	fontFamily: "var(--font-geist-mono)",
};

export function getTooltipStyle(): Record<string, string> {
	return {
		backgroundColor: "var(--popover)",
		borderColor: "var(--border)",
		borderWidth: "1px",
		borderStyle: "solid",
		borderRadius: "var(--radius)",
		fontSize: "12px",
		color: "var(--popover-foreground)",
	};
}
