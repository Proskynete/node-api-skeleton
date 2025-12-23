module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(?:(?<emoji>[\p{Emoji}\u200d]+)\s)?(?<type>\w+)(?:\((?<scope>[\w-]+)\))?!?:\s(?<subject>.+)$/u,
      headerCorrespondence: ["emoji", "type", "scope", "subject"],
    },
  },
};
