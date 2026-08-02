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
  getExploreSkillTemplate: '6fef69fc6dd688bc2ebd05f3a21970095135787c3727e3528cfc647715b14dc8',
  getNewChangeSkillTemplate: '4418a01721aa5de3639a90bc759a403e5ff128ae110e51b3049d7f871cdc6fe8',
  getContinueChangeSkillTemplate: '86cddc6fdda6c820b6de180e3df823203c16b4ef7aecc57c7a98b92420d1058a',
  getApplyChangeSkillTemplate: '83aeab4ef86c8642f83b837038bfd6a457cdda3d3b8faa7685e0562d60bba10b',
  getFfChangeSkillTemplate: '1e8c394bc52d91e581c7eefaf35cdc3d18d7c5677381f766cbbddcc52b5024db',
  getSyncSpecsSkillTemplate: '63f319036ec3e6583ceb22e990c8d7abe424feffb030bfc5b4e7d5ca886c229a',
  getOnboardSkillTemplate: '50228e9940c9de442ce155b29cb87b0a17c2cbfd241170b0b915fcb9468d0e3e',
  getOpsxExploreCommandTemplate: '0b13822c126033b97cb57bddd3731e0de2d1b70233f97958c3f65fed56494582',
  getOpsxNewCommandTemplate: '06f16655ea0f2d95a8bd9b680055ae38be3431c7fb179dc881b56d32ba4ec1d9',
  getOpsxContinueCommandTemplate: '48e29dc513fb75383eed857e471916777326b20440e07193d0ddb4076f8b92ef',
  getOpsxApplyCommandTemplate: '763b628927a6137d68e131199ddf5d57b3de992138aad35d46cafbdbdb48f160',
  getOpsxFfCommandTemplate: 'a30bb9d4a585d6496feffc926344154a88e0fd99ad975ff128e679d6f9e64d14',
  getArchiveChangeSkillTemplate: 'ba480cbc8f15008fc8cf8aec441355ad0749834af60273a7c89609fa7bd29e45',
  getBulkArchiveChangeSkillTemplate: 'fdb1715804e86de85be96222b8efeb9d5b350c6d5c19e343e244655deff8e62b',
  getOpsxSyncCommandTemplate: 'e2fdf4ff4ba19a1702d1ac3d9ef6894a2c139954d4666cd0addd90f7b58636f4',
  getVerifyChangeSkillTemplate: 'b18b51d56120c38bc4445a77073dce124e361abd6113a6c6099829aed2d63003',
  getOpsxArchiveCommandTemplate: 'bb28bbee36f07ca81a1b2e4bba6bd045abed113f7075aacbdb522193e80e744d',
  getOpsxOnboardCommandTemplate: '1f9a80683efa89e7e90c59f84efcae3ed31be5b8692666e514b2d1211f8f005d',
  getOpsxBulkArchiveCommandTemplate: 'b76c421023ccb5a12867c349f27cdb186234b692c1811980fb94127567bdabda',
  getOpsxVerifyCommandTemplate: '677ea55129a918bc7790db5d3cc0b3fbd5922036728ba8d1071a5535b44dee80',
  getOpsxProposeSkillTemplate: '3ee2c9ea16f4dca214b2c5abb866b5f71f7c182c4ec4286dc0679154675b2840',
  getOpsxProposeCommandTemplate: 'bd8498790fdea65be1713d327cc69d5e3f5106d0dd37b624e37e4ee0bb0055f7',
  getFeedbackSkillTemplate: 'd7d83c5f7fc2b92fe8f4588a5bf2d9cb315e4c73ec19bcd5ef28270906319a0d',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': 'faa1cc4c2adc4ba77cc28e290185c171828389c34d53c6d13f771a0f17dd7653',
  'openspec-new-change': '3f340ed1190da55cb212c4e80ef488ddf1efb3e67c847cd95e01774ac3032cd9',
  'openspec-continue-change': 'c7c5e76e9d841ee0b08c724ec11a54afe23130e624a181e88230a5be1c39bde2',
  'openspec-apply-change': '92627d618494ae7ab4f586839bf3c3e4348c5c418326c4936aa51fdadb2c0fc4',
  'openspec-ff-change': '511bd7527a83bbac1ac2d3a8d08057007ea393599eb2390169353ca7437a3e2b',
  'openspec-sync-specs': 'f8e490b9bfa02bba017e3bf8a86ecd34eb0348dace4beca8293e0080be1f1f4e',
  'openspec-archive-change': '5197a0476cbd97052c90b1cfe052de39842fbb8eadcc2b33f2accc2955b31039',
  'openspec-bulk-archive-change': '16207683996b1952559cd4e33463f28fb097761f2c5d912107733d01a90d3f2f',
  'openspec-verify-change': '6659f750478363d2cfc51c55889c64092cd8efa39d17c9e07d9f2baa2d1da44f',
  'openspec-onboard': '1981f775fabd1837bb4f5d7839708c0d2802c04d07679d64baa7a7f339b265e6',
  'openspec-propose': 'e6bfb6f4eaff62a103ce911422f248c1f19248abf2eae18eb955b4a94db1ff2f',
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

  it('keeps contract-style invariants in propose and apply workflows', () => {
    const proposeContent = generateSkillContent(getOpsxProposeSkillTemplate(), 'PARITY-BASELINE');
    const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'PARITY-BASELINE');
    const applyCommandContent = getOpsxApplyCommandTemplate().content;
    const applyTemplate = getApplyChangeSkillTemplate();
    const applyCommandTemplate = getOpsxApplyCommandTemplate();
    const continueContent = generateSkillContent(getContinueChangeSkillTemplate(), 'PARITY-BASELINE');
    const onboardContent = generateSkillContent(getOnboardSkillTemplate(), 'PARITY-BASELINE');

    // Propose: orchestration is delegated to the agent, format invariants are preserved.
    expect(proposeContent).toContain('编排由你决定');
    expect(proposeContent).toContain('## ADDED/MODIFIED/REMOVED/RENAMED Requirements');
    expect(proposeContent).toContain('- [ ]');
    // Apply: both generated surfaces preserve the verified checkpoint and closeout contract.
    for (const content of [applyContent, applyCommandContent]) {
      expect(content).toContain('仅在验证通过后');
      expect(content).toContain('随后立即重读 tasks 文件');
      expect(content).toContain('主动识别适合 sub-agent 的独立切片');
      expect(content).toContain('checkbox 和交付收尾由主 agent 负责');
      expect(content).toContain('2-3 个互斥选项');
      expect(content).toContain('将推荐项放在最前');
      expect(content).toContain('必要验证、文档、归档和 Git 提交');
      expect(content).toContain('scoped Git commit');
      expect(content).toContain('跳过实现，直接进入下述“完成闭环”');
    }
    expect(applyTemplate.description).toContain('Implement and close out');
    expect(applyTemplate.compatibility).toContain('requires a Git worktree');
    expect(applyCommandTemplate.description).toContain('scoped Git commit closeout');
    expect(onboardContent).toContain('Apply and Close Out');
    expect(onboardContent).toContain('Immediately re-read tasks.md');
    expect(onboardContent).toContain('Manual/recovery archive');
    expect(onboardContent).not.toContain("One more step—let's archive it");
    // Continue: no forced parallelization plan in tasks guidance.
    expect(continueContent).not.toContain('parallelization/sub-agent plan');
  });
});
