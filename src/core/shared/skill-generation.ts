/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';
import type { SkillReference } from '../templates/types.js';

const ARCHITECTURE_GUIDANCE_REFERENCE: SkillReference = {
  path: 'references/architecture-guidance.md',
  content: `# 通用架构指导

在创建或执行 OpenSpec 规划 artifact 时，默认把架构评估作为设计质量的一部分。此指导适用于不同技术栈和不同类型的变更，不针对任何单一场景。

## 先理解现状

- 阅读相关 \`openspec/specs/\` 中的现有能力定义。
- 阅读当前 change 已存在的 artifact，尤其是 \`proposal.md\` 和 \`design.md\`。
- 查找相关模块、公共工具、适配器、服务、配置、测试和文档。
- 确认是否已有类似能力、相似接口、共享基础设施或既定实现模式。
- 在 workspace planning 中，先识别受影响 area/repo；未确认允许编辑根目录前，把 linked repos/folders 作为只读探索上下文。

## 优先复用

默认优先级：

1. 复用已有能力或接口。
2. 在已有模块边界内扩展。
3. 提取小而清晰的共享能力。
4. 新增跨模块基础设施。
5. 引入新依赖、新服务、新存储或新协议。

越靠后的选择，越需要在 \`design.md\` 中说明理由、替代方案、风险、验证方式和回滚方式。

## 明确边界

设计方案应回答：

- 变更属于哪个 capability、module、service、package 或 workspace area？
- 哪些能力是业务层职责，哪些能力是基础设施职责？
- 哪些 API/contract 会被其他模块依赖？
- 新增状态、缓存、连接、队列、任务、文件、配置或数据模型由谁拥有？
- 失败、重试、取消、超时、权限、并发和资源释放由哪一层负责？

## 控制复杂度

新增抽象、依赖、服务、存储、协议或跨模块基础设施前，必须说明：

- 它解决的是当前真实复杂度，还是 speculative future-proofing？
- 是否可以用现有框架能力或现有 helper 直接完成？
- 是否引入额外生命周期、状态同步、并发、迁移或部署风险？
- 如果新增公共能力，是否有最小 API 面和清晰扩展点？

## 评估质量属性

按变更相关性评估安全、可靠性、性能、可维护性、可观测性、可测试性、可部署性。小改动可以简短说明；架构显著变更必须在 \`design.md\` 或 \`tasks.md\` 中体现。

## 记录决策

当存在多个可行方案时，记录选择方案、替代方案、决策理由、代价和风险。长期有效、跨多个 change 的决策可以沉淀到项目自己的 docs 或 ADR 目录；OpenSpec 默认不强制固定目录。

## 转成验证任务

\`tasks.md\` 应把关键架构约束转为可验证任务，例如：

- contract/integration/e2e 测试。
- 防止重复实现或绕过公共入口的 regression check。
- lint/static check。
- 迁移兼容性和回滚验证。
- 关键错误路径、权限路径、并发路径或资源释放路径验证。
`,
};

const ARCHITECTURE_GUIDANCE_WORKFLOWS = new Set([
  'propose',
  'new',
  'continue',
  'ff',
  'apply',
  'verify',
]);

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 */
export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'openspec-explore', workflowId: 'explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'openspec-new-change', workflowId: 'new' },
    { template: getContinueChangeSkillTemplate(), dirName: 'openspec-continue-change', workflowId: 'continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'openspec-apply-change', workflowId: 'apply' },
    { template: getFfChangeSkillTemplate(), dirName: 'openspec-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'openspec-sync-specs', workflowId: 'sync' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'openspec-archive-change', workflowId: 'archive' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'openspec-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'openspec-verify-change', workflowId: 'verify' },
    { template: getOnboardSkillTemplate(), dirName: 'openspec-onboard', workflowId: 'onboard' },
    { template: getOpsxProposeSkillTemplate(), dirName: 'openspec-propose', workflowId: 'propose' },
  ];

  const withReferences = all.map((entry) => {
    if (!ARCHITECTURE_GUIDANCE_WORKFLOWS.has(entry.workflowId)) {
      return entry;
    }

    return {
      ...entry,
      template: {
        ...entry.template,
        references: [
          ...(entry.template.references ?? []),
          ARCHITECTURE_GUIDANCE_REFERENCE,
        ],
      },
    };
  });

  if (!workflowFilter) return withReferences;

  const filterSet = new Set(workflowFilter);
  return withReferences.filter(entry => filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 */
export function getCommandTemplates(workflowFilter?: readonly string[]): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: getOpsxExploreCommandTemplate(), id: 'explore' },
    { template: getOpsxNewCommandTemplate(), id: 'new' },
    { template: getOpsxContinueCommandTemplate(), id: 'continue' },
    { template: getOpsxApplyCommandTemplate(), id: 'apply' },
    { template: getOpsxFfCommandTemplate(), id: 'ff' },
    { template: getOpsxSyncCommandTemplate(), id: 'sync' },
    { template: getOpsxArchiveCommandTemplate(), id: 'archive' },
    { template: getOpsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOpsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOpsxOnboardCommandTemplate(), id: 'onboard' },
    { template: getOpsxProposeCommandTemplate(), id: 'propose' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 */
export function getCommandContents(workflowFilter?: readonly string[]): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The OpenSpec version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires openspec CLI.'}
metadata:
  author: ${template.metadata?.author || 'openspec'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}

/**
 * Generates referenced files for a skill directory.
 */
export function generateSkillReferences(
  template: SkillTemplate,
  transformContent?: (content: string) => string
): SkillReference[] {
  return (template.references ?? []).map((reference) => ({
    path: reference.path,
    content: transformContent ? transformContent(reference.content) : reference.content,
  }));
}
