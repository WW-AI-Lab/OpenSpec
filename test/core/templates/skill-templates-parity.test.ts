import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: 'e2765fae6c2e960f4ce07058cfdaa547ff3435d454eacd5e924e38139e97ad52',
  getNewChangeSkillTemplate: '54cc79ab44cb29de59524735df04d60cf559f5afd0cf3963c135b8288f7eae65',
  getContinueChangeSkillTemplate: 'ad3eab7f7c898370347dccced87ab6695c03a96e1e96c1386ed68b892d79868a',
  getApplyChangeSkillTemplate: '5601a7d7a37cf1704d19759680b8a73d73de1f0a7725fde18b0fef853aea2f8f',
  getFfChangeSkillTemplate: '832d36edf7f9af6db073dfde6a42700d8a8c724a37d07d577040f06d2578c1e9',
  getSyncSpecsSkillTemplate: '9f02b41227db70875b89eefeb275c769142607dc5b2593f4e606794aed2fdbad',
  getOnboardSkillTemplate: '4f4b60fea6e3fc7d2185815b2808fad51535fdd00cd4401b32d1536f32fa2b6d',
  getOpsxExploreCommandTemplate: '4d5e64e3ede6703113cf2fd23b797371ef2407b702478b4f7240fc81cbf2d3a5',
  getOpsxNewCommandTemplate: '701abe2bf6f1534092b1942648f5c271e4875c246ea14f434bbb4016032a66ac',
  getOpsxContinueCommandTemplate: 'b66c3a065473c85d281151cff11ef61fd53938cc32c0bcfe39c3aaa0e47d8952',
  getOpsxApplyCommandTemplate: '40e81fd56eb207fadfa64d7b9fc684299fcd78bf5296383c086b0cd17e62527c',
  getOpsxFfCommandTemplate: '9209d082672fd758380e08b7d72bc3e3c51a18de0ebe4507da28e88fad1849d0',
  getArchiveChangeSkillTemplate: 'bdf022ae2cdef1feef4d641a068bef3a7fc5d98a323f7ce9f77ac578fe8d20c6',
  getBulkArchiveChangeSkillTemplate: 'fdb1715804e86de85be96222b8efeb9d5b350c6d5c19e343e244655deff8e62b',
  getOpsxSyncCommandTemplate: '4c8118afaea79ff4fed3d946c88e6a7abbba904a5fbf643e4372da1e3735a467',
  getVerifyChangeSkillTemplate: 'eff9d520f1557fcf224f0cee7546e19cd5ab5eafedfbc929cc14795036dfd206',
  getOpsxArchiveCommandTemplate: '5181ec2f59c9f0f3376e61d952ed4be976cbd01595b6b0d5e67466c8bd6bac6d',
  getOpsxOnboardCommandTemplate: '57c1f3e2590bda8f47818bab1d528456c1b8a9a7501f63ab9e2115e0cfaf6f35',
  getOpsxBulkArchiveCommandTemplate: 'b76c421023ccb5a12867c349f27cdb186234b692c1811980fb94127567bdabda',
  getOpsxVerifyCommandTemplate: '7778c1c37ae89f39bc82a952fe1ad19277cc5ea093412fc029805e7e3d88dcf2',
  getOpsxProposeSkillTemplate: 'e8214a875a57d542b7c2aea32a3068d6175ca61b075892f03897ccec6bc99541',
  getOpsxProposeCommandTemplate: 'd4e9919407601c085fdf83340e3ad2ad72b198595734d66cda80b21aa32dd2c5',
  getFeedbackSkillTemplate: 'd7d83c5f7fc2b92fe8f4588a5bf2d9cb315e4c73ec19bcd5ef28270906319a0d',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '28d900ef82b325beb65e69ee6435949adcfdf14a4314638e7006e6dc359b92d4',
  'openspec-new-change': '75639f6c3e300d7454cdc8ee8efe1ea6d7a5f34980bc2aadd911371d1c5b6176',
  'openspec-continue-change': 'bb5e26520c0c42fb6dc7f18cb35c8b750fa6890e7c25c63eeb8c1a4b26b1a3c2',
  'openspec-apply-change': '87864ffdb3a7db50e51ec02c1ae39d786fbfd32c2fa2485a59510d6d726d1a17',
  'openspec-ff-change': '9714b6f2d3b08a3fe68e8b3272188800ecaffbaabcf64d267ef03e819f276b33',
  'openspec-sync-specs': '2e0f67ec6fadffc6107b4b1a28eef23a99a6649e5fae706897ea1dd9deb852a8',
  'openspec-archive-change': '8d14af2c8b2e4358308ac9fc14f75db42a4b41a07e175825035852a82479793e',
  'openspec-bulk-archive-change': '16207683996b1952559cd4e33463f28fb097761f2c5d912107733d01a90d3f2f',
  'openspec-verify-change': 'cb6d2ed372744c55cab9a42c0196c36e95d9fb9282d86bacd9a3cc9b5845272f',
  'openspec-onboard': 'b924ea3c97543ebb7ee82c5f194afe7ce87a521c32b85616f445240ab33a02ab',
  'openspec-propose': '9ed2940fbff70a0da7f135f2357713e16394f253d0c6941588e1ac9f9569cc4b',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getOpsxProposeSkillTemplate,
      getOpsxProposeCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['openspec-explore', getExploreSkillTemplate],
      ['openspec-new-change', getNewChangeSkillTemplate],
      ['openspec-continue-change', getContinueChangeSkillTemplate],
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-ff-change', getFfChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
      ['openspec-onboard', getOnboardSkillTemplate],
      ['openspec-propose', getOpsxProposeSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  it('guards unsupported workspace workflows from repo-local fallback edits', () => {
    const guardedSkills: Array<[string, () => SkillTemplate, string]> = [
      ['openspec-apply-change', getApplyChangeSkillTemplate, 'full workspace apply is not supported'],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate, 'workspace spec sync is not supported'],
      ['openspec-archive-change', getArchiveChangeSkillTemplate, 'workspace archive is not supported'],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate, 'workspace bulk archive is not supported'],
      ['openspec-verify-change', getVerifyChangeSkillTemplate, 'full workspace implementation verification is not supported'],
    ];

    for (const [dirName, createTemplate, guardText] of guardedSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');

      expect(content, dirName).toContain('actionContext.mode: "workspace-planning"');
      expect(content, dirName).toContain(guardText);
      expect(content, dirName).not.toContain('openspec/changes/<name>');
      expect(content, dirName).not.toContain('mv openspec/changes');
    }
  });

  it('requires proposal and apply workflows to plan safe sub-agent delegation', () => {
    const proposeContent = generateSkillContent(getOpsxProposeSkillTemplate(), 'PARITY-BASELINE');
    const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'PARITY-BASELINE');
    const continueContent = generateSkillContent(getContinueChangeSkillTemplate(), 'PARITY-BASELINE');

    expect(proposeContent).toContain('If creating tasks.md, include a parallelization/sub-agent plan');
    expect(proposeContent).toContain('When writing tasks.md, preserve checkbox syntax and make concurrency explicit');
    expect(continueContent).toContain('which tasks can run concurrently via sub-agent');
    expect(applyContent).toContain('Plan sub-agent execution');
    expect(applyContent).toContain('Keep architecture decisions, shared-interface changes, conflict resolution, final integration, and checkbox updates with the main agent');
  });
});
