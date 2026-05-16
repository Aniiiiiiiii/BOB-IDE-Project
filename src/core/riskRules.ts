export const riskRules = [
  {
    id: "large-diff",
    description: "Diff size is too large",
    check: (diff: string) => diff.length > 1000,
  },
];
